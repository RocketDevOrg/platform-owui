"""
Модель для хранения pending (ожидающих обработки) черновиков карточек товаров.
Используется для отслеживания черновиков в статусе 'processing' и возобновления polling после перезагрузки страницы.
"""
import logging
import time
from typing import Optional

from open_webui.internal.db import Base, get_db, engine
from open_webui.env import SRC_LOG_LEVELS

from pydantic import BaseModel, ConfigDict
from sqlalchemy import BigInteger, Column, String, Index, inspect

log = logging.getLogger(__name__)
log.setLevel(SRC_LOG_LEVELS["MODELS"])


class PendingDraft(Base):
    """
    Таблица для хранения pending draft_id по chat_id.
    Один чат может иметь только один pending draft.
    """
    __tablename__ = "pending_draft"

    id = Column(String, primary_key=True)  # chat_id
    user_id = Column(String, nullable=False)
    draft_id = Column(String, nullable=False)
    created_at = Column(BigInteger, nullable=False)

    __table_args__ = (
        Index("pending_draft_user_id_idx", "user_id"),
        Index("pending_draft_draft_id_idx", "draft_id"),
    )


# Автоматически создаём таблицу при импорте модуля если она не существует
def _ensure_table_exists():
    try:
        inspector = inspect(engine)
        if not inspector.has_table("pending_draft"):
            PendingDraft.__table__.create(engine, checkfirst=True)
            log.info("Created pending_draft table")
    except Exception as e:
        log.error(f"Error ensuring pending_draft table exists: {e}")

_ensure_table_exists()


class PendingDraftModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str  # chat_id
    user_id: str
    draft_id: str
    created_at: int


class PendingDraftForm(BaseModel):
    draft_id: str


class PendingDraftResponse(BaseModel):
    chat_id: str
    draft_id: str
    created_at: int


class PendingDraftTable:
    def get_pending_draft_by_chat_id(self, chat_id: str, user_id: str) -> Optional[PendingDraftModel]:
        """Получить pending draft для чата"""
        try:
            with get_db() as db:
                pending = db.query(PendingDraft).filter_by(id=chat_id, user_id=user_id).first()
                return PendingDraftModel.model_validate(pending) if pending else None
        except Exception as e:
            log.error(f"Error getting pending draft: {e}")
            return None

    def get_all_pending_drafts_by_user_id(self, user_id: str) -> list[PendingDraftModel]:
        """Получить все pending drafts пользователя"""
        try:
            with get_db() as db:
                pending_list = db.query(PendingDraft).filter_by(user_id=user_id).all()
                return [PendingDraftModel.model_validate(p) for p in pending_list]
        except Exception as e:
            log.error(f"Error getting pending drafts: {e}")
            return []

    def create_pending_draft(self, chat_id: str, user_id: str, draft_id: str) -> Optional[PendingDraftModel]:
        """Создать или обновить pending draft для чата"""
        try:
            with get_db() as db:
                # Удаляем старый pending draft если есть
                db.query(PendingDraft).filter_by(id=chat_id).delete()
                
                pending = PendingDraft(
                    id=chat_id,
                    user_id=user_id,
                    draft_id=draft_id,
                    created_at=int(time.time())
                )
                db.add(pending)
                db.commit()
                db.refresh(pending)
                return PendingDraftModel.model_validate(pending)
        except Exception as e:
            log.error(f"Error creating pending draft: {e}")
            return None

    def delete_pending_draft(self, chat_id: str, user_id: str) -> bool:
        """Удалить pending draft для чата"""
        try:
            with get_db() as db:
                result = db.query(PendingDraft).filter_by(id=chat_id, user_id=user_id).delete()
                db.commit()
                return result > 0
        except Exception as e:
            log.error(f"Error deleting pending draft: {e}")
            return False

    def delete_pending_draft_by_draft_id(self, draft_id: str, user_id: str) -> bool:
        """Удалить pending draft по draft_id"""
        try:
            with get_db() as db:
                result = db.query(PendingDraft).filter_by(draft_id=draft_id, user_id=user_id).delete()
                db.commit()
                return result > 0
        except Exception as e:
            log.error(f"Error deleting pending draft by draft_id: {e}")
            return False


PendingDrafts = PendingDraftTable()

