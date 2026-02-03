"""Add pending_draft table

Revision ID: e1a2b3c4d5e6
Revises: 018012973d35
Create Date: 2025-02-03

"""
from alembic import op
import sqlalchemy as sa


revision = "e1a2b3c4d5e6"
down_revision = "018012973d35"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "pending_draft",
        sa.Column("id", sa.String(), primary_key=True),  # chat_id
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("draft_id", sa.String(), nullable=False),
        sa.Column("created_at", sa.BigInteger(), nullable=False),
    )
    op.create_index("pending_draft_user_id_idx", "pending_draft", ["user_id"])
    op.create_index("pending_draft_draft_id_idx", "pending_draft", ["draft_id"])


def downgrade():
    op.drop_index("pending_draft_draft_id_idx")
    op.drop_index("pending_draft_user_id_idx")
    op.drop_table("pending_draft")

