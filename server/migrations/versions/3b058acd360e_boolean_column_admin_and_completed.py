"""boolean column admin and completed

Revision ID: 3b058acd360e
Revises: 243735b65080
Create Date: 2023-09-25 19:06:42.441110

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3b058acd360e'
down_revision = '243735b65080'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('employees', schema=None) as batch_op:
        batch_op.add_column(sa.Column('admin', sa.Boolean(), nullable=True))

    with op.batch_alter_table('work_orders', schema=None) as batch_op:
        batch_op.add_column(sa.Column('completed', sa.Boolean(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('work_orders', schema=None) as batch_op:
        batch_op.drop_column('completed')

    with op.batch_alter_table('employees', schema=None) as batch_op:
        batch_op.drop_column('admin')

    # ### end Alembic commands ###