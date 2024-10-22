import eventlet
eventlet.monkey_patch()
from flask_socketio import SocketIO, join_room, leave_room, emit
from flask import request
from pymongo import MongoClient
from utils import get_user
from datetime import datetime   
from model import db

from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
app.config.from_object('config.ApplicationConfig')
db.init_app(app)
socketio = SocketIO(app, cors_allowed_origins=["http://localhost"], async_mode="eventlet", message_queue='redis://redis:6379')

mongo_client = MongoClient('mongodb://mongodb:27017/')
db_mongo = mongo_client['chat_app'] 
messages_collection = db_mongo['messages'] 

@socketio.on('join')
def handle_join(data):
    user = get_user()
    
    print(user)
    if not user:
        emit('error', {'message': 'Unauthorized'}, room=request.sid)
        return

    activity_id = data.get('activity_id')
    if not activity_id:
        emit('error', {'message': 'No activity ID provided'}, room=request.sid)
        return

    room = f'activity_{activity_id}'
    join_room(room)
    emit('status', {'message': f'{user.username} has joined the room.'}, room=room)
    
    
    recent_messages = messages_collection.find({'activity_id': activity_id}).sort('timestamp', -1).limit(50)
    messages = []
    for msg in reversed(list(recent_messages)):
        messages.append({
            'user_id': msg['user_id'],
            'username': msg['username'],
            'message': msg['message'],
            'timestamp': msg['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
        })
    emit('chat_history', messages, room=request.sid)

@socketio.on('send_message')
def handle_send_message(data):

    user = get_user()
    print("user",user)
    if not user:
        emit('error', {'message': 'Unauthorized'}, room=request.sid)
        return

    activity_id = data.get('activity_id')
    message_text = data.get('message')
    print('Received message:', message_text)
    if not activity_id or not message_text:
        emit('error', {'message': 'Invalid data'}, room=request.sid)
        return

    room = f'activity_{activity_id}'
    
    
    message = {
        'activity_id': activity_id,
        'user_id': user.id,
        'username': user.username,
        'message': message_text,
        'timestamp': datetime.now()
    }
    messages_collection.insert_one(message)

    print('Emitting message to room:', room, message)
    emit('receive_message', {
        'user_id': user.id,
        'username': user.username,
        'message': message_text,
        'timestamp': message['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
    }, room=room)
    print('Emitting message to room:', room, message)
    

@socketio.on('leave')
def handle_leave(data):
    user = get_user()
    if not user:
        return

    activity_id = data.get('activity_id')
    if not activity_id:
        return

    room = f'activity_{activity_id}'
    leave_room(room)
    emit('status', {'message': f'{user.username} has left the room.'}, room=room)
    
if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5001)
