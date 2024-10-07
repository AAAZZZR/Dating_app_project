from flask import session, jsonify
from model import User, Activity

def get_user():

    user_id = session.get("user_id")
    print("session",session)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    user = User.query.filter_by(id=user_id).first()
    return user

def check_activity(activity_id,user = None):
    activity = Activity.query.get(activity_id)
    if activity.current_participants >= activity.max_participants:
        return {"error": "Activity is full", "code": 400}
    
    if activity.status != 'upcoming':
        return {"error": "Activity is not available for joining", "code": 400}
    
    if not user:
        if user in activity.participants:
            return {"error": "You have already joined this activity", "code": 400}

        if user == activity.hoster:
            return {"error": "You are the host of this activity", "code": 400}



