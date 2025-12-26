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
    social_media_accounts: '',
    gender: '',
    gender_other: '',
    sexual_orientation: '',
    orientation_other: ''
  });

  const [showCampusOther, setShowCampusOther] = useState(false);
  const [showGenderOther, setShowGenderOther] = useState(false);
  const [showOrientationOther, setShowOrientationOther] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      const campusOptions = ['Harvey Mudd','Pitzer','Pomona','Claremont McKenna','Scripps'];
      const genderOptions = ['Woman','Man','Non-binary','Genderqueer/Genderfluid','Questioning','Prefer not to say'];
      const orientationOptions = ['Heterosexual','Homosexual','Bisexual','Asexual','Pansexual'];
      
      // Auto-detect campus from email if not set
      const guessCampusFromEmail = (email) => {
        if (!email) {
            return '';
        }
        const e = String(email).toLowerCase();
        if (/\b(hmc)\b|hmc\.edu/.test(e)) {
          return 'Harvey Mudd';
        }
        if (/pitzer/.test(e)) {
          return 'Pitzer';
        }
        if (/pomona/.test(e)) {
          return 'Pomona';
        }
        if (/cmc/.test(e)) {
          return 'Claremont McKenna';
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
        social_media_accounts: user.social_media_accounts || '',
        gender: genderData.select,
        gender_other: genderData.other,
        sexual_orientation: orientationData.select,
        orientation_other: orientationData.other
      });

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
    // TODO: profile save to backend
    console.log('Profile data to save:', formData);
    alert('Profile save functionality will be implemented with backend API integration.');
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
                  <option value="Harvey Mudd">Harvey Mudd</option>
                  <option value="Pitzer">Pitzer</option>
                  <option value="Pomona">Pomona</option>
                  <option value="Claremont McKenna">Claremont McKenna</option>
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
                <label htmlFor="social_media_accounts">Instagram</label>
                <input
                  id="social_media_accounts"
                  name="social_media_accounts"
                  type="text"
                  placeholder="instagram: @yourhandle"
                  value={formData.social_media_accounts}
                  onChange={handleInputChange}
                />
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