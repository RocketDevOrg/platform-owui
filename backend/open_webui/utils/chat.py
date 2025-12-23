import time
import logging
import sys
import os

from aiocache import cached
from typing import Any, Optional
import random
import json
import inspect
import uuid
import asyncio
import aiohttp

from fastapi import Request, status, HTTPException
from starlette.responses import Response, StreamingResponse, JSONResponse


from open_webui.models.users import UserModel

from open_webui.socket.main import (
    sio,
    get_event_call,
    get_event_emitter,
)
from open_webui.functions import generate_function_chat_completion

from open_webui.routers.openai import (
    generate_chat_completion as generate_openai_chat_completion,
)

from open_webui.routers.ollama import (
    generate_chat_completion as generate_ollama_chat_completion,
)

from open_webui.routers.pipelines import (
    process_pipeline_inlet_filter,
    process_pipeline_outlet_filter,
)

from open_webui.models.functions import Functions
from open_webui.models.models import Models


from open_webui.utils.plugin import (
    load_function_module_by_id,
    get_function_module_from_cache,
)
from open_webui.utils.models import get_all_models, check_model_access
from open_webui.utils.payload import convert_payload_openai_to_ollama
from open_webui.utils.response import (
    convert_response_ollama_to_openai,
    convert_streaming_response_ollama_to_openai,
)
from open_webui.utils.filter import (
    get_sorted_filter_ids,
    process_filter_functions,
)

from open_webui.env import (
    SRC_LOG_LEVELS,
    GLOBAL_LOG_LEVEL,
    BYPASS_MODEL_ACCESS_CONTROL,
    FASTAPI_CHAT_URL,
    USE_FASTAPI_FOR_CHAT,
)


logging.basicConfig(stream=sys.stdout, level=GLOBAL_LOG_LEVEL)
log = logging.getLogger(__name__)
log.setLevel(SRC_LOG_LEVELS["MAIN"])

# Таймаут для HTTP запросов к FastAPI
AIOHTTP_CLIENT_TIMEOUT = aiohttp.ClientTimeout(total=300)  # 5 минут


async def generate_fastapi_chat_completion(
    request: Request,
    form_data: dict,
    user: Any,
):
    """
    Вызывает FastAPI эндпоинт для генерации ответа чата
    Вместо стандартных LLM API (OpenAI/Ollama) все запросы идут в FastAPI
    """
    log.debug(f"generate_fastapi_chat_completion: calling FastAPI at {FASTAPI_CHAT_URL}")
    
    metadata = form_data.get("metadata", {})
    stream = form_data.get("stream", False)
    
    # Подготовка payload для FastAPI (в формате OpenAI API)
    payload = {
        "messages": form_data.get("messages", []),
        "model": form_data.get("model", ""),
        "stream": stream,
    }
    
    # Добавляем дополнительные параметры, если есть
    if "params" in form_data:
        payload["params"] = form_data["params"]
    
    # Добавляем метаданные для контекста
    if metadata:
        payload["metadata"] = {
            "user_id": metadata.get("user_id"),
            "chat_id": metadata.get("chat_id"),
            "message_id": metadata.get("message_id"),
            "session_id": metadata.get("session_id"),
        }
    
    headers = {
        "Content-Type": "application/json",
    }
    
    # Прокидываем токен авторизации, если есть
    auth_header = request.headers.get("authorization")
    if auth_header:
        headers["authorization"] = auth_header
    
    try:
        async with aiohttp.ClientSession(
            trust_env=True,
            timeout=AIOHTTP_CLIENT_TIMEOUT
        ) as session:
            async with session.post(
                FASTAPI_CHAT_URL,
                json=payload,
                headers=headers,
            ) as response:
                if response.status >= 400:
                    try:
                        error_data = await response.json()
                        error_text = error_data.get("detail", await response.text())
                    except:
                        error_text = await response.text()
                    
                    log.error(f"FastAPI error {response.status}: {error_text}")
                    raise HTTPException(
                        status_code=response.status,
                        detail=f"FastAPI error: {error_text}"
                    )
                
                if stream:
                    # Streaming ответ (SSE формат)
                    async def stream_generator():
                        async for line in response.content:
                            if line:
                                try:
                                    line_str = line.decode('utf-8').strip()
                                    if line_str:
                                        # Если строка уже в формате SSE, возвращаем как есть
                                        if line_str.startswith('data: '):
                                            yield f"{line_str}\n\n"
                                        elif line_str == "[DONE]":
                                            yield f"data: [DONE]\n\n"
                                        else:
                                            # Обертываем в формат SSE
                                            yield f"data: {line_str}\n\n"
                                except Exception as e:
                                    log.debug(f"Error parsing stream line: {e}")
                                    continue
                    
                    return StreamingResponse(
                        stream_generator(),
                        media_type="text/event-stream"
                    )
                else:
                    # Non-streaming ответ
                    response_data = await response.json()
                    return response_data
                    
    except aiohttp.ClientError as e:
        log.error(f"FastAPI connection error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to connect to FastAPI: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"FastAPI error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"FastAPI error: {str(e)}"
        )


async def generate_direct_chat_completion(
    request: Request,
    form_data: dict,
    user: Any,
    models: dict,
):
    log.info("generate_direct_chat_completion")

    metadata = form_data.pop("metadata", {})

    user_id = metadata.get("user_id")
    session_id = metadata.get("session_id")
    request_id = str(uuid.uuid4())  # Generate a unique request ID

    event_caller = get_event_call(metadata)

    channel = f"{user_id}:{session_id}:{request_id}"
    logging.info(f"WebSocket channel: {channel}")

    if form_data.get("stream"):
        q = asyncio.Queue()

        async def message_listener(sid, data):
            """
            Handle received socket messages and push them into the queue.
            """
            await q.put(data)

        # Register the listener
        sio.on(channel, message_listener)

        # Start processing chat completion in background
        res = await event_caller(
            {
                "type": "request:chat:completion",
                "data": {
                    "form_data": form_data,
                    "model": models[form_data["model"]],
                    "channel": channel,
                    "session_id": session_id,
                },
            }
        )

        log.info(f"res: {res}")

        if res.get("status", False):
            # Define a generator to stream responses
            async def event_generator():
                nonlocal q
                try:
                    while True:
                        data = await q.get()  # Wait for new messages
                        if isinstance(data, dict):
                            if "done" in data and data["done"]:
                                break  # Stop streaming when 'done' is received

                            yield f"data: {json.dumps(data)}\n\n"
                        elif isinstance(data, str):
                            if "data:" in data:
                                yield f"{data}\n\n"
                            else:
                                yield f"data: {data}\n\n"
                except Exception as e:
                    log.debug(f"Error in event generator: {e}")
                    pass

            # Define a background task to run the event generator
            async def background():
                try:
                    del sio.handlers["/"][channel]
                except Exception as e:
                    pass

            # Return the streaming response
            return StreamingResponse(
                event_generator(), media_type="text/event-stream", background=background
            )
        else:
            raise Exception(str(res))
    else:
        res = await event_caller(
            {
                "type": "request:chat:completion",
                "data": {
                    "form_data": form_data,
                    "model": models[form_data["model"]],
                    "channel": channel,
                    "session_id": session_id,
                },
            }
        )

        if "error" in res and res["error"]:
            raise Exception(res["error"])

        return res


async def generate_chat_completion(
    request: Request,
    form_data: dict,
    user: Any,
    bypass_filter: bool = False,
):
    log.debug(f"generate_chat_completion: {form_data}")
    if BYPASS_MODEL_ACCESS_CONTROL:
        bypass_filter = True

    if hasattr(request.state, "metadata"):
        if "metadata" not in form_data:
            form_data["metadata"] = request.state.metadata
        else:
            form_data["metadata"] = {
                **form_data["metadata"],
                **request.state.metadata,
            }

    # ВСЕГДА используем FastAPI для генерации ответов чата
    # Убрана опция выбора модели - все запросы идут напрямую в FastAPI
    log.debug("Using FastAPI for chat completion (always enabled)")
    return await generate_fastapi_chat_completion(
        request=request,
        form_data=form_data,
        user=user,
    )

    # ============================================================
    # ЗАКОММЕНТИРОВАНО: Стандартная логика работы с моделями
    # Раскомментировать для восстановления функциональности выбора моделей
    # ============================================================
    # # Если включено использование FastAPI для чата, перенаправляем все запросы туда
    # if USE_FASTAPI_FOR_CHAT:
    #     log.debug("Using FastAPI for chat completion")
    #     return await generate_fastapi_chat_completion(
    #         request=request,
    #         form_data=form_data,
    #         user=user,
    #     )
    #
    # # Стандартная логика для работы с моделями (если FastAPI отключен)
    # if getattr(request.state, "direct", False) and hasattr(request.state, "model"):
    #     models = {
    #         request.state.model["id"]: request.state.model,
    #     }
    #     log.debug(f"direct connection to model: {models}")
    # else:
    #     models = request.app.state.MODELS
    #
    # model_id = form_data["model"]
    # if model_id not in models:
    #     raise Exception("Model not found")
    #
    # model = models[model_id]
    #
    # if getattr(request.state, "direct", False):
    #     return await generate_direct_chat_completion(
    #         request, form_data, user=user, models=models
    #     )
    # else:
    #     # Check if user has access to the model
    #     if not bypass_filter and user.role == "user":
    #         try:
    #             check_model_access(user, model)
    #         except Exception as e:
    #             raise e
    #
    #     if model.get("owned_by") == "arena":
    #         model_ids = model.get("info", {}).get("meta", {}).get("model_ids")
    #         filter_mode = model.get("info", {}).get("meta", {}).get("filter_mode")
    #         if model_ids and filter_mode == "exclude":
    #             model_ids = [
    #                 model["id"]
    #                 for model in list(request.app.state.MODELS.values())
    #                 if model.get("owned_by") != "arena" and model["id"] not in model_ids
    #             ]
    #
    #         selected_model_id = None
    #         if isinstance(model_ids, list) and model_ids:
    #             selected_model_id = random.choice(model_ids)
    #         else:
    #             model_ids = [
    #                 model["id"]
    #                 for model in list(request.app.state.MODELS.values())
    #                 if model.get("owned_by") != "arena"
    #             ]
    #             selected_model_id = random.choice(model_ids)
    #
    #         form_data["model"] = selected_model_id
    #
    #         if form_data.get("stream") == True:
    #
    #             async def stream_wrapper(stream):
    #                 yield f"data: {json.dumps({'selected_model_id': selected_model_id})}\n\n"
    #                 async for chunk in stream:
    #                     yield chunk
    #
    #             response = await generate_chat_completion(
    #                 request, form_data, user, bypass_filter=True
    #             )
    #             return StreamingResponse(
    #                 stream_wrapper(response.body_iterator),
    #                 media_type="text/event-stream",
    #                 background=response.background,
    #             )
    #         else:
    #             return {
    #                 **(
    #                     await generate_chat_completion(
    #                         request, form_data, user, bypass_filter=True
    #                     )
    #                 ),
    #                 "selected_model_id": selected_model_id,
    #             }
    #
    #     if model.get("pipe"):
    #         # Below does not require bypass_filter because this is the only route the uses this function and it is already bypassing the filter
    #         return await generate_function_chat_completion(
    #             request, form_data, user=user, models=models
    #         )
    #     if model.get("owned_by") == "ollama":
    #         # Using /ollama/api/chat endpoint
    #         form_data = convert_payload_openai_to_ollama(form_data)
    #         response = await generate_ollama_chat_completion(
    #             request=request,
    #             form_data=form_data,
    #             user=user,
    #             bypass_filter=bypass_filter,
    #         )
    #         if form_data.get("stream"):
    #             response.headers["content-type"] = "text/event-stream"
    #             return StreamingResponse(
    #                 convert_streaming_response_ollama_to_openai(response),
    #                 headers=dict(response.headers),
    #                 background=response.background,
    #             )
    #         else:
    #             return convert_response_ollama_to_openai(response)
    #     else:
    #         return await generate_openai_chat_completion(
    #             request=request,
    #             form_data=form_data,
    #             user=user,
    #             bypass_filter=bypass_filter,
    #         )


chat_completion = generate_chat_completion


async def chat_completed(request: Request, form_data: dict, user: Any):
    if not request.app.state.MODELS:
        await get_all_models(request, user=user)

    if getattr(request.state, "direct", False) and hasattr(request.state, "model"):
        models = {
            request.state.model["id"]: request.state.model,
        }
    else:
        models = request.app.state.MODELS

    data = form_data
    model_id = data["model"]
    if model_id not in models:
        raise Exception("Model not found")

    model = models[model_id]

    try:
        data = await process_pipeline_outlet_filter(request, data, user, models)
    except Exception as e:
        return Exception(f"Error: {e}")

    metadata = {
        "chat_id": data["chat_id"],
        "message_id": data["id"],
        "filter_ids": data.get("filter_ids", []),
        "session_id": data["session_id"],
        "user_id": user.id,
    }

    extra_params = {
        "__event_emitter__": get_event_emitter(metadata),
        "__event_call__": get_event_call(metadata),
        "__user__": user.model_dump() if isinstance(user, UserModel) else {},
        "__metadata__": metadata,
        "__request__": request,
        "__model__": model,
    }

    try:
        filter_functions = [
            Functions.get_function_by_id(filter_id)
            for filter_id in get_sorted_filter_ids(
                request, model, metadata.get("filter_ids", [])
            )
        ]

        result, _ = await process_filter_functions(
            request=request,
            filter_functions=filter_functions,
            filter_type="outlet",
            form_data=data,
            extra_params=extra_params,
        )
        return result
    except Exception as e:
        return Exception(f"Error: {e}")


async def chat_action(request: Request, action_id: str, form_data: dict, user: Any):
    if "." in action_id:
        action_id, sub_action_id = action_id.split(".")
    else:
        sub_action_id = None

    action = Functions.get_function_by_id(action_id)
    if not action:
        raise Exception(f"Action not found: {action_id}")

    if not request.app.state.MODELS:
        await get_all_models(request, user=user)

    if getattr(request.state, "direct", False) and hasattr(request.state, "model"):
        models = {
            request.state.model["id"]: request.state.model,
        }
    else:
        models = request.app.state.MODELS

    data = form_data
    model_id = data["model"]

    if model_id not in models:
        raise Exception("Model not found")
    model = models[model_id]

    __event_emitter__ = get_event_emitter(
        {
            "chat_id": data["chat_id"],
            "message_id": data["id"],
            "session_id": data["session_id"],
            "user_id": user.id,
        }
    )
    __event_call__ = get_event_call(
        {
            "chat_id": data["chat_id"],
            "message_id": data["id"],
            "session_id": data["session_id"],
            "user_id": user.id,
        }
    )

    function_module, _, _ = get_function_module_from_cache(request, action_id)

    if hasattr(function_module, "valves") and hasattr(function_module, "Valves"):
        valves = Functions.get_function_valves_by_id(action_id)
        function_module.valves = function_module.Valves(**(valves if valves else {}))

    if hasattr(function_module, "action"):
        try:
            action = function_module.action

            # Get the signature of the function
            sig = inspect.signature(action)
            params = {"body": data}

            # Extra parameters to be passed to the function
            extra_params = {
                "__model__": model,
                "__id__": sub_action_id if sub_action_id is not None else action_id,
                "__event_emitter__": __event_emitter__,
                "__event_call__": __event_call__,
                "__request__": request,
            }

            # Add extra params in contained in function signature
            for key, value in extra_params.items():
                if key in sig.parameters:
                    params[key] = value

            if "__user__" in sig.parameters:
                __user__ = user.model_dump() if isinstance(user, UserModel) else {}

                try:
                    if hasattr(function_module, "UserValves"):
                        __user__["valves"] = function_module.UserValves(
                            **Functions.get_user_valves_by_id_and_user_id(
                                action_id, user.id
                            )
                        )
                except Exception as e:
                    log.exception(f"Failed to get user values: {e}")

                params = {**params, "__user__": __user__}

            if inspect.iscoroutinefunction(action):
                data = await action(**params)
            else:
                data = action(**params)

        except Exception as e:
            return Exception(f"Error: {e}")

    return data
