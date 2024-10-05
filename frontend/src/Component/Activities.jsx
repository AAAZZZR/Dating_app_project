import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Activities.css';
import ActivityCard from './ActivityCard';
import ActivityForm from './ActivityForm';

const Activities = () => {
    const [activities, setActivities] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [participatedActivityIds, setParticipatedActivityIds] = useState([]);
    const checkAuthStatus = async () => {
        try {
            const response = await axios.get('http://localhost:5000/@me', { withCredentials: true });
            setIsLoggedIn(true);
            setUser(response.data);
            const participatedActivityIds = response.data.participated_activities.map(activity => activity.id);
            setParticipatedActivityIds(participatedActivityIds);
            console.log("User logged in:", response.data);
        } catch (error) {
            setIsLoggedIn(false);
            setUser(null);
        }
    };

    const fetchActivities = async () => {
        try {
            const response = await axios.get('http://localhost:5000/activities');
            setActivities(response.data);
        } catch (error) {
            console.error("Failed to fetch activities:", error);
        }
    };

    useEffect(() => {
        checkAuthStatus();
        fetchActivities();
    }, []);

    const handleCreateActivity = async (activityData) => {
        try {
            const response = await axios.post('http://localhost:5000/create_activity', 
                { ...activityData, 
                  max_participants: parseInt(activityData.max_participants, 10),
                   },
                { withCredentials: true }
            );
            console.log("Activity created:", response.data);
            setShowCreateForm(false);
            // Refresh the activities list
            const updatedActivities = await axios.get('http://localhost:5000/activities');
            setActivities(updatedActivities.data);
            const updatedUser = await axios.get('http://localhost:5000/@me', { withCredentials: true });
        } catch (error) {
          console.error("Failed to create activity:", error.response ? error.response.data : error);
          alert("Failed to create activity. Please check the console for details.");
        }
    };

    const handleJoinActivity = async (activityId) => {
        try {
            const response = await axios.post(`http://localhost:5000/join_activity/${activityId}`, {}, { withCredentials: true });
            if (response.status === 200) {
                
                setParticipatedActivityIds(prevIds => [...prevIds, activityId]);
    
                
                setActivities(prevActivities => prevActivities.map(activity => {
                    if (activity.id === activityId) {
                        return {
                            ...activity,
                            current_participants: activity.current_participants + 1,
                            participants: [...activity.participants, user.username],
                        };
                    }
                    return activity;
                }));
    
            } else {
                alert(response.data.error || 'Failed to join activity');
            }
        } catch (error) {
            console.error("Failed to join activity:", error);
            alert("Failed to join activity. Please try again.");
        }
    };
    const handleDropOut = async (activityId) => {
        try {
            const response = await axios.post(`http://localhost:5000/dropout_activity/${activityId}`, {}, { withCredentials: true });
    
            if (response.status === 200) {
                
                await fetchActivities();
                await checkAuthStatus();
                alert('Successfully dropped out of the activity');
            } else {
                alert(response.data.error || 'Failed to drop out of activity');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while dropping out of the activity');
        }
    };
    
    return (
        <div className="activities-container">
            <h1 className="activities-title">Group Dating Activities</h1>
            
            {isLoggedIn ? (
                <button 
                    onClick={() => setShowCreateForm(true)} 
                    className="create-activity-button"
                >
                    Create New Activity
                </button>
            ) : (
                <p>Please log in to create or join activities.</p>
            )}

            {showCreateForm && (
                <ActivityForm 
                    onCreateActivity={handleCreateActivity}
                    onCancel={() => setShowCreateForm(false)}
                />
            )}

            <div className="activities-grid">
                {activities.map(activity => (
                    <ActivityCard 
                        key={activity.id} 
                        activity={activity} 
                        onJoin={() => handleJoinActivity(activity.id)}
                        onDropOut={() => handleDropOut(activity.id)}
                        isLoggedIn={isLoggedIn}
                        isParticipant={participatedActivityIds.includes(activity.id)}
                        currentUser={user}
                    />
                ))}
            </div>
        </div>
    );
};

export default Activities;