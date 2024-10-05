import React, { useState } from 'react';
import './Activities.css';

const ActivityForm = ({ onCreateActivity, onCancel }) => {
    const [activityData, setActivityData] = useState({
      name: '',
      date: '',
      time: '',
      location: '',
      max_participants: '',
      description: '' 
    });
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setActivityData(prev => ({ ...prev, [name]: value }));
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onCreateActivity(activityData);
    };
  
    return (
      <form onSubmit={handleSubmit} className="create-activity-form">
        <input
          type="text"
          name="name"
          value={activityData.name}
          onChange={handleChange}
          placeholder="Activity Name"
          required
        />
        <input
          type="date"
          name="date"
          value={activityData.date}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="time"
          value={activityData.time}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="location"
          value={activityData.location}
          onChange={handleChange}
          placeholder="Location"
          required
        />
        <input
          type="number"
          name="max_participants"
          value={activityData.max_participants}
          onChange={handleChange}
          placeholder="Max Participants"
          required
        />
         <textarea
          name="description"
          value={activityData.description}
          onChange={handleChange}
          placeholder="Activity Description"
          rows="4"
        />
        <button type="submit">Create Activity</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    );
  };
export default ActivityForm;