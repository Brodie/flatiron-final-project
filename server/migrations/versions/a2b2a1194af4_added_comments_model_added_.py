"""added comments model, added relationships between comment model and other models

Revision ID: a2b2a1194af4
Revises: 295ccda6e57c
Create Date: 2023-09-30 15:09:26.095667

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a2b2a1194af4'
down_revision = '295ccda6e57c'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('comments',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('comment_text', sa.String(), nullable=False),
    sa.Column('emp_id', sa.Integer(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('work_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['emp_id'], ['employees.id'], name=op.f('fk_comments_emp_id_employees')),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_comments_user_id_users')),
    sa.ForeignKeyConstraint(['work_id'], ['work_orders.id'], name=op.f('fk_comments_work_id_work_orders')),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('comments')
    # ### end Alembic commands ###