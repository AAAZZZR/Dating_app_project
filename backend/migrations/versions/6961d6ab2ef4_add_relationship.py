"""add relationship

Revision ID: 6961d6ab2ef4
Revises: f221b3feb550
Create Date: 2024-09-29 08:42:00.219445

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6961d6ab2ef4'
down_revision = 'f221b3feb550'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('activities', schema=None) as batch_op:
        batch_op.add_column(sa.Column('status', sa.String(length=20), nullable=False, server_default='upcoming'))

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_constraint('users_host_activity_id_fkey', type_='foreignkey')
        batch_op.drop_constraint('users_participant_activity_id_fkey', type_='foreignkey')
        batch_op.drop_column('participant_activity_id')
        batch_op.drop_column('host_activity_id')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('host_activity_id', sa.VARCHAR(length=32), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('participant_activity_id', sa.VARCHAR(length=32), autoincrement=False, nullable=True))
        batch_op.create_foreign_key('users_participant_activity_id_fkey', 'activities', ['participant_activity_id'], ['id'])
        batch_op.create_foreign_key('users_host_activity_id_fkey', 'activities', ['host_activity_id'], ['id'])

    with op.batch_alter_table('activities', schema=None) as batch_op:
        batch_op.drop_column('status')

    # ### end Alembic commands ###
