# app.py
import eventlet
eventlet.monkey_patch()
from flask import Flask, request, jsonify,abort,session
from flask_bcrypt import Bcrypt
from config import ApplicationConfig   
from flask_session import Session 
from flask_cors import CORS, cross_origin
from model import db, User, Activity
from flask_migrate import Migrate
from flask_socketio import SocketIO
from datetime import datetime
from functools import wraps

from chat import socketio 
from utils import get_user

app = Flask(__name__)
app.config.from_object('config.ApplicationConfig')
bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True)
# server_session = Session(app)


db.init_app(app)
migrate = Migrate(app, db)

with app.app_context():
    db.create_all()
        

@app.route("/@me")
def get_current_user():
    user = get_user()
    
    hosted_activities = [{
                "id": activity.id,
                "name": activity.name,
                "date": activity.date.isoformat(),
                "time": activity.time.isoformat(),
                "location": activity.location,
                "description": activity.description,
                "status": activity.status
            } for activity in user.hosted_activities]
    
    participated_activities = [{
                "id": activity.id,
                "name": activity.name,
                "date": activity.date.isoformat(),
                "time": activity.time.isoformat(),
                "location": activity.location,
                "description": activity.description,
                "status": activity.status
            } for activity in user.participated_activities]
    
    print(hosted_activities)
    return jsonify({
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "hosted_activities": hosted_activities,
        "participated_activities":participated_activities
    }) 


@app.route('/register', methods=['POST'])
def register():
    try:
        username = request.json["username"]
        email = request.json["email"]
        password = request.json["password"]
        
        user_exist = User.query.filter_by(email=email).first()
        
        if user_exist:
            return jsonify({"message": "User already exists"}), 409
        
        
        hashed_password = bcrypt.generate_password_hash(password).decode('utf8')
        new_user = User(username=username,email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        
        # session["user_id"] = new_user.id
        return jsonify({
            "id": new_user.id,
            "email": new_user.email,
            "username": new_user.username
            }), 201

    except Exception as e:
        db.session.rollback()
        print(f"fail: {str(e)}")
        return jsonify({"error": "fail", "details": str(e)}), 500

@app.route("/login", methods=["POST"])
def login_user():
    
    email = request.json["email"]
    password = request.json["password"]

    user = User.query.filter_by(email=email).first()

    if user is None:
        return jsonify({"error": "Unauthorized"}), 401

    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Unauthorized"}), 401
    
    session["user_id"] = user.id

    return jsonify({
        "id": user.id,
        "email": user.email,
        "username": user.username   
    })
    
@app.route('/create_activity', methods=['POST'])
def create_activity():
    # current_user_response = get_current_user()
    # if isinstance(current_user_response, tuple):  
    #     return current_user_response  

    # current_user = current_user_response.json  
    
    user = get_user()
    data = request.json
    
    
    required_fields = ['name', 'date', 'time', 'location', 'max_participants']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        
        date = datetime.strptime(data['date'], "%Y-%m-%d").date()
        time = datetime.strptime(data['time'], "%H:%M").time()
        
        new_activity = Activity(
            name=data['name'],
            date=date,
            time=time,
            location=data['location'],
            max_participants=int(data['max_participants']),
            host_id=user.id,
            description=data.get('description', ''),
        )
        
        new_activity.participants.append(user)
        new_activity.current_participants = 1
        
        db.session.add(new_activity)
        db.session.commit()
        
        # user = User.query.get(current_user['id'])
        # user.hosted_activities.append(new_activity)
        
            
        return jsonify({
            "message": "Activity created successfully",
            "activity_id": new_activity.id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/cancel_activity/<activity_id>', methods=['POST'])
def cancel_activity(activity_id):
    user = get_user()
    
    if not user:
        return jsonify({"error": "User not found"}), 404

    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({"error": "Activity not found"}), 404

    if activity.host_id != user.id:
        return jsonify({"error": "You are not the host of this activity"}), 403

    
    activity.status = 'cancelled'
    db.session.commit()

    return jsonify({"message": "Activity has been cancelled"}), 200

@app.route('/activities', methods=['GET'])
def get_activities():
    activities = Activity.query.filter_by(status='upcoming').all()
    current_time = datetime.now()
    for activity in activities:
        
        activity_datetime = datetime.combine(activity.date, activity.time)
        if activity_datetime < current_time and activity.status not in ['completed', 'cancelled']:
            activity.status = 'completed'
        
        
    
    db.session.commit() 


    return jsonify([{
        'id': activity.id,
        'name': activity.name,
        'date': activity.date.isoformat(),
        'time': activity.time.isoformat(),
        'location': activity.location,
        'max_participants': activity.max_participants,
        'current_participants': activity.current_participants,
        'host_id': activity.host_id,
        'host_username': activity.hoster.username,
        "description": activity.description,
        'participants': [user.username for user in activity.participants]
    } for activity in activities]), 200

@app.route('/join_activity/<activity_id>', methods=['POST'])
def join_activity(activity_id):
    user = get_user()
    
    if not user:
        return jsonify({"error": "User not found"}), 404

    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({"error": "Activity not found"}), 404

    if activity.current_participants >= activity.max_participants:
        return jsonify({"error": "Activity is full"}), 400
    
    if activity.status != 'upcoming':
        return jsonify({"error": "Activity is not available for joining"}), 400
    # 檢查用戶是否已經參加該活動
    if user in activity.participants:
        return jsonify({"error": "You have already joined this activity"}), 400

    if user == activity.hoster:
        return jsonify({"error": "You are the host of this activity"}), 400
    # 添加用戶到活動的 participants 列表
    activity.participants.append(user)
    activity.current_participants += 1

    # 提交變更到數據庫
    db.session.commit()

    return jsonify({"message": "Successfully joined the activity"}), 200

@app.route('/dropout_activity/<activity_id>', methods=['POST'])
def dropout_activity(activity_id):
    user = get_user()
    if not user:
        return jsonify({"error": "User not found"}), 404

    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({"error": "Activity not found"}), 404

    if user not in activity.participants:
        return jsonify({"error": "You are not a participant of this activity"}), 400

    
    activity.participants.remove(user)
    activity.current_participants -= 1

    db.session.commit()

    return jsonify({"message": "Successfully dropped out of the activity"}), 200

@app.route('/logout', methods=['POST'])
def logout_user():
    session.pop("user_id")
    return "200"

socketio.init_app(app, cors_allowed_origins="*", message_queue='redis://localhost:6379')
if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
    