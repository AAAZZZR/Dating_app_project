import React, { useState } from 'react';
import "./ActivityCard.css";
import ChatWindow from './ChatWindow'; 

const ActivityCard = ({ activity, onJoin, isLoggedIn, onDropOut, isParticipant,currentUser}) => {
    
    const [showChat, setShowChat] = useState(false);
    
    
    const toggleChatWindow = () => {
        setShowChat(!showChat);
    };
    
    return (
        <div className="activity-card">
            <h3 className="activity-title">{activity.name}</h3>
            <div className="activity-details">
                <p>📅 Date:</p><p>{activity.date}</p>
                <p>🕒 Time:</p><p>{activity.time}</p>
                <p>📍 Location:</p><p>{activity.location}</p>
                <p>👤 Host:</p><p>{activity.host_username}</p>
                <p>👥 Participants:</p><p>{activity.current_participants}/{activity.max_participants}</p>
                <p className="activity-status">🏷️ Status: {activity.status}</p>
                <p className="activity-description">📝 Description: {activity.description}</p>
                <div className="participants-list">
                    <p>Participants:</p>
                    <ul>
                        {activity.participants.map((username, index) => (
                            <li key={index}>{username}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {isLoggedIn && (
                <>
                    <button
                        onClick={isParticipant ? onDropOut : onJoin}
                        className={isParticipant ? "dropout-button" : "join-button"}
                        disabled={(!isParticipant && (activity.current_participants >= activity.max_participants || activity.status === 'completed'))}
                    >
                        {isParticipant ? 'Drop Out' :
                            activity.current_participants >= activity.max_participants ? 'Full' :
                                activity.status === 'completed' ? 'Completed' : 'Join Activity'}
                    </button>

                    {isParticipant && (
                        <button
                            onClick={toggleChatWindow} 
                            className="chat-button"
                        >
                            {showChat ? 'Close Chat' : 'Join Chat'}
                        </button>
                    )}
                    
                    
                    {showChat && 
                        <ChatWindow activity={activity} closeChat={toggleChatWindow} currentUser={currentUser} />
                    }
                </>
            )}
        </div>
    );
};

export default ActivityCard;
