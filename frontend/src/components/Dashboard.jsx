import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    home_location: '',
    campus: '',
    campus_other: '',
    year: '',
    gender: '',
    gender_other: '',
    sexual_orientation: '',
    orientation_other: ''
  });

  const [socialMediaAccounts, setSocialMediaAccounts] = useState([]);
  const [showCampusOther, setShowCampusOther] = useState(false);
  const [showGenderOther, setShowGenderOther] = useState(false);
  const [showOrientationOther, setShowOrientationOther] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      const campusOptions = ['HMC','Pitzer','Pomona','CMC','Scripps'];
      const genderOptions = ['Woman','Man','Non-binary','Genderqueer/Genderfluid','Questioning','Prefer not to say'];
      const orientationOptions = ['Heterosexual','Homosexual','Bisexual','Asexual','Pansexual'];
      
      // Auto-detect campus from email if not set
      const guessCampusFromEmail = (email) => {
        if (!email) {
            return '';
        }
        const e = String(email).toLowerCase();
        if (/\b(hmc)\b|hmc\.edu/.test(e)) {
          return 'HMC';
        }
        if (/pitzer/.test(e)) {
          return 'Pitzer';
        }
        if (/pomona/.test(e)) {
          return 'Pomona';
        }
        if (/cmc/.test(e)) {
          return 'CMC';
        }
        if (/scripps/.test(e)) {
          return 'Scripps';
        }
        return '';
      };

      // set select value or "Other"
      const setSelectOrOther = (value, options) => {
        const normalizedValue = value == null ? '' : String(value).trim();
        const matchedOption = options.find(
          option => option.toLowerCase() === normalizedValue.toLowerCase()
        );
        
        if (matchedOption) {
          return {
            select: matchedOption,
            other: '',
            showOther: false
          };
        }
        
        if (normalizedValue) {
          return {
            select: 'Other',
            other: normalizedValue,
            showOther: true
          };
        }
        
        return {
          select: '',
          other: '',
          showOther: false
        };
      };

      // Set campus with auto-detection
      let campusData;
      if (user.campus) {
        campusData = setSelectOrOther(user.campus, campusOptions);
      } else {
        const guessedCampus = guessCampusFromEmail(user.email);
        if (guessedCampus) {
          campusData = setSelectOrOther(guessedCampus, campusOptions);
        } else {
          campusData = { select: '', other: '', showOther: false };
        }
      }

      const genderData = setSelectOrOther(user.gender, genderOptions);
      const orientationData = setSelectOrOther(user.sexual_orientation, orientationOptions);

      setFormData({
        name: user.name || '',
        email: user.email || '',
        age: user.age || '',
        home_location: user.home_location || '',
        campus: campusData.select,
        campus_other: campusData.other,
        year: user.year || '',
        gender: genderData.select,
        gender_other: genderData.other,
        sexual_orientation: orientationData.select,
        orientation_other: orientationData.other
      });

      // Parse social media accounts from JSON
      if (user.social_media_accounts) {
        try {
          const parsed = typeof user.social_media_accounts === 'string' 
            ? JSON.parse(user.social_media_accounts) 
            : user.social_media_accounts;
          const accountsArray = Object.entries(parsed).map(([platform, url]) => {
            const username = url.split('/').pop() || '';
            return { platform, username };
          });
          const savedAccounts = localStorage.getItem('socialMediaAccounts');
          if (savedAccounts) {
            try {
              const localAccounts = JSON.parse(savedAccounts);
              if (localAccounts.length > 0) {
                setSocialMediaAccounts(localAccounts);
              } else {
                setSocialMediaAccounts(accountsArray);
              }
            } catch {
              setSocialMediaAccounts(accountsArray);
            }
          } else {
            setSocialMediaAccounts(accountsArray);
          }
        } catch (e) {
          console.error('Error parsing social media accounts:', e);
          const savedAccounts = localStorage.getItem('socialMediaAccounts');
          if (savedAccounts) {
            try {
              setSocialMediaAccounts(JSON.parse(savedAccounts));
            } catch {
              setSocialMediaAccounts([]);
            }
          } else {
            setSocialMediaAccounts([]);
          }
        }
      } else {
        const savedAccounts = localStorage.getItem('socialMediaAccounts');
        if (savedAccounts) {
          try {
            setSocialMediaAccounts(JSON.parse(savedAccounts));
          } catch {
            setSocialMediaAccounts([]);
          }
        }
      }

      setShowCampusOther(campusData.showOther);
      setShowGenderOther(genderData.showOther);
      setShowOrientationOther(orientationData.showOther);
    }
  }, [user, isAuthenticated, loading, navigate]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSocialMedia = () => {
    const updated = [...socialMediaAccounts, { platform: '', username: '' }];
    setSocialMediaAccounts(updated);
    localStorage.setItem('socialMediaAccounts', JSON.stringify(updated));
  };

  const handleRemoveSocialMedia = (index) => {
    const updated = socialMediaAccounts.filter((_, i) => i !== index);
    setSocialMediaAccounts(updated);
    localStorage.setItem('socialMediaAccounts', JSON.stringify(updated));
  };

  const handleSocialMediaChange = (index, field, value) => {
    const updated = [...socialMediaAccounts];
    updated[index][field] = value;
    setSocialMediaAccounts(updated);
    localStorage.setItem('socialMediaAccounts', JSON.stringify(updated));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // "Other" option visibility
    if (name === 'campus') {
      setShowCampusOther(value === 'Other');
      if (value !== 'Other') {
        setFormData(prev => ({ ...prev, campus_other: '' }));
      }
    } else if (name === 'gender') {
      setShowGenderOther(value === 'Other');
      if (value !== 'Other') {
        setFormData(prev => ({ ...prev, gender_other: '' }));
      }
    } else if (name === 'sexual_orientation') {
      setShowOrientationOther(value === 'Other');
      if (value !== 'Other') {
        setFormData(prev => ({ ...prev, orientation_other: '' }));
      }
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveStatus({ message: '', type: '' });
    
    try {
      // Convert social media accounts to JSON format
      const socialMediaObj = {};
      socialMediaAccounts.forEach(({ platform, username }) => {
        if (platform && username) {
          const baseUrls = {
            instagram: 'https://instagram.com/',
            snapchat: 'https://snapchat.com/add/',
            twitter: 'https://twitter.com/',
            facebook: 'https://facebook.com/'
          };
          const baseUrl = baseUrls[platform.toLowerCase()] || `https://${platform.toLowerCase()}.com/`;
          socialMediaObj[platform.toLowerCase()] = baseUrl + username;
        }
      });

      // Prepare data with proper handling of "Other" fields
      const profileData = {
        name: formData.name,
        email: formData.email,
        age: formData.age ? parseInt(formData.age) : null,
        home_location: formData.home_location,
        campus: formData.campus === 'Other' ? formData.campus_other : formData.campus,
        year: formData.year,
        social_media_accounts: JSON.stringify(socialMediaObj),
        gender: formData.gender === 'Other' ? formData.gender_other : formData.gender,
        sexual_orientation: formData.sexual_orientation === 'Other' ? formData.orientation_other : formData.sexual_orientation,
        form_id: user.form_id || null
      };

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Update user in auth context and localStorage
      const updatedUserData = { ...user, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      setSaveStatus({ message: 'Profile saved successfully!', type: 'success' });
      
      setTimeout(() => {
        setSaveStatus({ message: '', type: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus({ message: 'Failed to save profile. Please try again.', type: 'error' });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const quizTaken = false; // TODO: real check for quiz taken

  return (
    <main className="main-content">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Your Dashboard</h1>
        </div>
        
        <div className="dashboard-content">
          <div className="profile-section">
            <h2 className="section-title">Your Profile</h2>
            <form className="profile-form" onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="0"
                  value={formData.age}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="home_location">Hometown</label>
                <input
                  id="home_location"
                  name="home_location"
                  type="text"
                  value={formData.home_location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="campus">Campus</label>
                <select
                  id="campus"
                  name="campus"
                  value={formData.campus}
                  onChange={handleSelectChange}
                >
                  <option value="">Select campus</option>
                  <option value="HMC">Harvey Mudd</option>
                  <option value="Pitzer">Pitzer</option>
                  <option value="Pomona">Pomona</option>
                  <option value="CMC">Claremont McKenna</option>
                  <option value="Scripps">Scripps</option>
                  <option value="Other">Other</option>
                </select>
                {showCampusOther && (
                  <div className="custom-input-container show">
                    <input
                      className="custom-input"
                      name="campus_other"
                      type="text"
                      placeholder="Other campus"
                      value={formData.campus_other}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="year">Year</label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                >
                  <option value="">Select year</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Super Senior">Super Senior</option>
                </select>
              </div>

              <div className="form-group">
                <label>Social Media Accounts</label>
                {socialMediaAccounts.map((account, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <select
                      value={account.platform}
                      onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
                      style={{ flex: '0 0 140px' }}
                    >
                      <option value="">Select platform</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Snapchat">Snapchat</option>
                      <option value="Twitter">Twitter</option>
                      <option value="Facebook">Facebook</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Username"
                      value={account.username}
                      onChange={(e) => handleSocialMediaChange(index, 'username', e.target.value)}
                      style={{ flex: '1' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSocialMedia(index)}
                      style={{
                        padding: '3px 3px',
                        background: 'transparent',
                        color: '#dc3545',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddSocialMedia}
                  style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    color: '#92b070ff',
                    border: 'solid',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginTop: '8px'
                  }}
                >
                  + Add Social Media
                </button>
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender Identity</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleSelectChange}
                >
                  <option value="">Select gender</option>
                  <option value="Woman">Woman</option>
                  <option value="Man">Man</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Genderqueer/Genderfluid">Genderqueer/Genderfluid</option>
                  <option value="Questioning">Questioning</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Other">Other</option>
                </select>
                {showGenderOther && (
                  <div className="custom-input-container show">
                    <input
                      className="custom-input"
                      name="gender_other"
                      type="text"
                      placeholder="If Other, please specify"
                      value={formData.gender_other}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="sexual_orientation">Sexual Orientation</label>
                <select
                  id="sexual_orientation"
                  name="sexual_orientation"
                  value={formData.sexual_orientation}
                  onChange={handleSelectChange}
                >
                  <option value="">Select orientation</option>
                  <option value="Heterosexual">Heterosexual</option>
                  <option value="Homosexual">Homosexual</option>
                  <option value="Bisexual">Bisexual</option>
                  <option value="Asexual">Asexual</option>
                  <option value="Pansexual">Pansexual</option>
                  <option value="Other">Other</option>
                </select>
                {showOrientationOther && (
                  <div className="custom-input-container show">
                    <input
                      className="custom-input"
                      name="orientation_other"
                      type="text"
                      placeholder="If Other, please specify"
                      value={formData.orientation_other}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
              </div>

              <button type="submit" className="save-button">
                Save Profile
              </button>
              
              {saveStatus.message && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: saveStatus.type === 'success' ? '#d4edda' : '#f8d7da',
                  color: saveStatus.type === 'success' ? '#155724' : '#721c24',
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  {saveStatus.message}
                </div>
              )}
            </form>
          </div>

          <div className="analysis-section">
            <h2 className="section-title">A closer look at you....</h2>
            <div className="analysis-content">
              {!quizTaken ? (
                <div className="quiz-cta">
                  <h3>You haven't taken the quiz yet!</h3>
                  <p>Complete the matching quiz so we can analyze your profile and suggest matches.</p>
                  <button className="quiz-button" onClick={() => navigate('/quiz')}>
                    Take the quiz!
                  </button>
                </div>
              ) : (
                <div>
                  <p><strong>Profile Analysis</strong></p>
                  {/* TODO: Display analysis results */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;