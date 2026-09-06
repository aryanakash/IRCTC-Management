import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/Profile.css';
import { FiUser, FiMail, FiCalendar, FiHash } from 'react-icons/fi';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { authToken } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setProfile(response.data);
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authToken]);

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loader"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return <div className="profile-error">{error}</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <FiUser className="avatar-icon" />
          </div>
          <h1>{profile?.name || 'My Profile'}</h1>
        </div>
        
        <div className="profile-info">
          <div className="info-item">
            <FiHash className="info-icon" />
            <div className="info-content">
              <label>User ID</label>
              <p>{profile?.id || 'N/A'}</p>
            </div>
          </div>

          <div className="info-item">
            <FiUser className="info-icon" />
            <div className="info-content">
              <label>Name</label>
              <p>{profile?.name || 'N/A'}</p>
            </div>
          </div>

          <div className="info-item">
            <FiMail className="info-icon" />
            <div className="info-content">
              <label>Email</label>
              <p>{profile?.email || 'N/A'}</p>
            </div>
          </div>

          <div className="info-item">
            <FiCalendar className="info-icon" />
            <div className="info-content">
              <label>Member Since</label>
              <p>
                {profile?.created_at 
                  ? new Date(profile.created_at).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
