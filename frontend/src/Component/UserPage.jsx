import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserPage.css';
import "./ActivityCard.css";
import ChatWindow from './ChatWindow'; // 假设你有一个 ChatWindow 组件



const UserPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null); // 用来存储当前选择的活动
  const [showChat, setShowChat] = useState(false); // 控制聊天窗口的显示

  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/@me', { withCredentials: true });
      setUser(response.data);
      console.log('User data:', response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch user data. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // const handleJoinActivity = async (activityId) => {
  //   try {
  //     const response = await axios.post(`http://localhost:5000/join_activity/${activityId}`, {}, { withCredentials: true });
  //     if (response.status === 200) {
  //       alert('Successfully joined the activity');
  //       await fetchUserData();
  //     } else {
  //       alert(response.data.error || 'Failed to join activity');
  //     }
  //   } catch (error) {
  //     console.error("Failed to join activity:", error);
  //     alert("Failed to join activity. Please try again.");
  //   }
  // };

  const handleDropOutActivity = async (activityId) => {
    try {
      const response = await axios.post(`http://localhost:5000/dropout_activity/${activityId}`, {}, { withCredentials: true });
      if (response.status === 200) {
        alert('Successfully dropped out of the activity');
        await fetchUserData();
      } else {
        alert(response.data.error || 'Failed to drop out of activity');
      }
    } catch (error) {
      console.error("Failed to drop out of activity:", error);
      alert("Failed to drop out of activity. Please try again.");
    }
  };

  const handleCancelActivity = async (activityId) => {
    try {
      const response = await axios.post(`http://localhost:5000/cancel_activity/${activityId}`, {}, { withCredentials: true });
      if (response.status === 200) {
        alert('Activity has been cancelled');
        await fetchUserData();
      } else {
        alert(response.data.error || 'Failed to cancel activity');
      }
    } catch (error) {
      console.error("Failed to cancel activity:", error);
      alert("Failed to cancel activity. Please try again.");
    }
  };

  const openChatWindow = (activity) => {
    setSelectedActivity(activity);
    setShowChat(true); // 显示聊天窗口
  };

  const closeChatWindow = () => {
    setShowChat(false); // 关闭聊天窗口
  };

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>No user data available. Please log in.</div>;
  }

  const filteredParticipatedActivities = user.participated_activities.filter(
    (activity) => {

      const isHostedByUser = user.hosted_activities.some((hostedActivity) => hostedActivity.id === activity.id);
      console.log(`Filtering activity: ${activity.name}, hosted by user: ${isHostedByUser}`);
      return !isHostedByUser;
    }

  );


  const renderActivityList = (activities, emptyMessage, activityType) => {
    if (!activities || activities.length === 0) {
      return <p>{emptyMessage}</p>;
    }


    const sortedActivities = activities.sort((a, b) => {
      if (a.status === 'cancelled' && b.status !== 'cancelled') return 1;
      if (a.status !== 'cancelled' && b.status === 'cancelled') return -1;
      return 0;
    });

    return (
      <ul>
        {sortedActivities.map(activity => (
          <li key={activity.id} className="activity-card">
            <h4 className="activity-title">{activity.name}</h4>
            <div className="activity-details">
              <p>📅 Date: {new Date(activity.date).toLocaleDateString()}</p>
              <p>🕒 Time: {activity.time}</p>
              <p>📍 Location: {activity.location}</p>
              <p className="activity-description">📝 {activity.description || 'No description available'}</p>
              <p className="activity-status">🏷️ Status: {activity.status || 'Unknown'}</p>
            </div>
            {/* 根据活动类型显示不同的按钮 */}
            {activityType === 'hosted' && (
              <>
                <button
                  onClick={() => handleCancelActivity(activity.id)}
                  className="cancel-button"
                  disabled={activity.status === 'cancelled' || activity.status === 'completed'}
                >
                  {activity.status === 'cancelled' ? 'Cancelled' : 'Cancel Activity'}
                </button>

                {/* 仅当活动未取消时显示 "Open Chat" 按钮 */}
                {activity.status !== 'cancelled' && (
                  <button
                    onClick={() => openChatWindow(activity)}
                    className="chat-button"
                  >
                    Open Chat
                  </button>
                )}
              </>
            )}

            {activityType === 'participated' && (
              <>
                <button
                  onClick={() => handleDropOutActivity(activity.id)}
                  className="dropout-button"
                  disabled={activity.status === 'cancelled'}
                >
                  Drop Out
                </button>
                <button
                  onClick={() => openChatWindow(activity)} // 点击打开聊天窗口
                  className="chat-button"
                >
                  Open Chat
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    );
  };


  return (
    <div>
      <div className="user-info">
        <h2>User Information</h2>
        <p>Username: {user.username}</p>
        <p>Email: {user.email}</p>
      </div>
      <div className="activity-columns">
        <div className="activity-section">
          <h3>Hosted Activities</h3>
          
          {renderActivityList(user.hosted_activities, "You are not hosting any activities.", 'hosted')}
        </div>
  
        <div className="activity-section">
          <h3>Participated Activities</h3>
          
          {renderActivityList(filteredParticipatedActivities, 'You are not participating in any activities.', 'participated')}
        </div>
  
        {showChat && selectedActivity && (
          <ChatWindow
            activity={selectedActivity}
            closeChat={closeChatWindow}
            currentUser={user}
          />
        )}
      </div>
    </div>
  );
};

export default UserPage;
