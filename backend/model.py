from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4

db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

participants = db.Table('participants',
    db.Column('user_id', db.String(32), db.ForeignKey('users.id'), primary_key=True),
    db.Column('activity_id', db.String(32), db.ForeignKey('activities.id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(32), primary_key=True,unique=True, default=get_uuid)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(345), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    hosted_activities = db.relationship('Activity', backref="hoster", lazy='select')
    participated_activities = db.relationship('Activity',secondary=participants, back_populates='participants')
    

class Activity(db.Model):
    __tablename__ = 'activities'
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    name = db.Column(db.String(100), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    status = db.Column(db.String(20), default='upcoming', nullable=False)
    location = db.Column(db.String(200), nullable=False)
    max_participants = db.Column(db.Integer, nullable=False)
    current_participants = db.Column(db.Integer, default=0)
    host_id = db.Column(db.String(32), db.ForeignKey('users.id'), nullable=False)
    
    description = db.Column(db.Text, nullable=True)
    participants = db.relationship('User', secondary=participants, back_populates='participated_activities',lazy='select')

# class user_activity(db.Model):
#     __tablename__ = 'user_activities'
#     id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
#     user_id = db.Column(db.String(32), db.ForeignKey('users.id'), nullable=False)
    
    
    # user = db.relationship('User', backref='user_activities')
    # activity = db.relationship('Activity', backref='user_activities')