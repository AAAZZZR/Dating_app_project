import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './ChatWindow.css'; // 添加样式
import { generateColorFromId } from '../utils/utils';


const ChatWindow = ({ activity, closeChat,currentUser}) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    
    useEffect(() => {
        const newSocket = io('http://localhost:5001',{
            transports: ['websocket', 'polling'],
            withCredentials: true});
        setSocket(newSocket);
        newSocket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        newSocket.emit('join', { activity_id: activity.id });
        
        newSocket.on('chat_history', (history) => {
            setMessages(history);
            
        });

        newSocket.on('receive_message', (message) => {
            console.log('Received message:', message);
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        return () => {
            newSocket.emit('leave', { activity_id: activity.id });
            console.log('Disconnecting from WebSocket server');
            newSocket.disconnect();
        };
    }, [activity.id]);

    const sendMessage = () => {
        if (socket && inputMessage.trim() !== '') {
            console.log('Sending message with activity_id:', activity.id, 'and message:', inputMessage);
            socket.emit('send_message', {
                activity_id: activity.id,
                message: inputMessage,
                
            });
            setInputMessage('');
        }
    };
    console.log("Messages:", messages);
    {messages.map((msg, index) => {
        console.log("Message user_id:", msg.user_id);
       
    })}
    return (
        <div className="chat-window">
            <div className="chat-header">
                <h3>{activity.name} @ {activity.location} chat</h3>
                <button onClick={closeChat}>X</button> 
            </div>
            <div className="chat-body">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.username === currentUser.username ? 'right' : 'left'}`}>
                        
                        <div className="username-circle" style={{ backgroundColor: generateColorFromId(msg.user_id) }}>
                            {msg.username.length > 3 ? msg.username.substring(0, 3) : msg.username}
                        </div>
                        
                        <div className="message-content">
                            {msg.message}
                            <em>{msg.timestamp}</em>
                        </div>
                    </div>
                ))}
            </div>
            <div className="chat-footer">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            sendMessage();
                        }
                    }}
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}
export default ChatWindow;
