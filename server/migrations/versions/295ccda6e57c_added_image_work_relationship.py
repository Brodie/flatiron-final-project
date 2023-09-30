"""added image work relationship

Revision ID: 295ccda6e57c
Revises: cc0c6b8aa739
Create Date: 2023-09-29 22:19:31.757829

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '295ccda6e57c'
down_revision = 'cc0c6b8aa739'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Image', schema=None) as batch_op:
        batch_op.add_column(sa.Column('work_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(batch_op.f('fk_Image_work_id_work_orders'), 'work_orders', ['work_id'], ['id'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Image', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('fk_Image_work_id_work_orders'), type_='foreignkey')
        batch_op.drop_column('work_id')

    # ### end Alembic commands ###