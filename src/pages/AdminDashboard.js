import React, { useEffect, useState } from 'react';

const AdminDashboard = () => {
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://ruu-d.com/sid/admin/activities', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setError('Failed to fetch activities');
          return;
        }

        const data = await response.json();
        setActivities(data.activities);
      } catch (err) {
        setError('An error occurred while fetching activities');
      }
    };

    fetchActivities();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {error && <p className="text-danger">{error}</p>}
      <ul>
        {activities.map((activity) => (
          <li key={activity.id}>{activity.description}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
