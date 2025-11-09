import { useState, ChangeEvent, FormEvent } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { getUserInfo, generateQRCode, upgradeToPremium } from '../services/api';
import type { User, UserFormData, GenerateQRResponse } from '../types/api';
import '../App.css';

interface Achievement {
  id: string;
  text: string;
  icon: string;
}

function GeneratorPage() {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    address: '',
    phone: ''
  });
  const [qrValue, setQrValue] = useState<string>('');
  const [showQR, setShowQR] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showUpgrade, setShowUpgrade] = useState<boolean>(false);
  const [upgrading, setUpgrading] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Check user limits when email changes
    if (name === 'email' && value.includes('@')) {
      checkUserLimits(value);
    }
  };

  // Check user limits
  const checkUserLimits = async (email: string) => {
    try {
      const info = await getUserInfo(email);
      setUserInfo(info);
      setError('');
      checkAchievements(info);
    } catch (err) {
      console.error('Error checking user limits:', err);
      // Don't show error for first-time users
    }
  };

  // Check and set achievements
  const checkAchievements = (info: User | null) => {
    if (!info) return;
    
    const newAchievements: Achievement[] = [];
    if (info.qrCount >= 1) {
      newAchievements.push({ id: 'first', text: '🎉 First QR Code!', icon: '🎉' });
    }
    if (info.qrCount >= 3) {
      newAchievements.push({ id: 'three', text: '🔥 3 QR Codes!', icon: '🔥' });
    }
    if (info.qrCount >= 10) {
      newAchievements.push({ id: 'ten', text: '⭐ 10 QR Codes!', icon: '⭐' });
    }
    if (info.plan === 'premium') {
      newAchievements.push({ id: 'premium', text: '💎 Premium Member', icon: '💎' });
    }
    setAchievements(newAchievements);
  };

  // Create celebration confetti
  const createConfetti = () => {
    const confettiCount = 50;
    const confettiElements = [];
    for (let i = 0; i < confettiCount; i++) {
      const left = Math.random() * 100;
      const delay = Math.random() * 0.5;
      const duration = 2 + Math.random() * 2;
      confettiElements.push(
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${left}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      );
    }
    return confettiElements;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Generate QR code via API
      const result: GenerateQRResponse = await generateQRCode(formData);
      
      // Type-safe check with proper error handling
      if (!result) {
        throw new Error('Invalid response from server');
      }
      
      if (!result.qrCode) {
        throw new Error('QR code data is missing from response');
      }
      
      if (!result.qrCode.qrValue) {
        throw new Error('QR code value is missing');
      }
      
      if (!result.user) {
        throw new Error('User data is missing from response');
      }
      
      // All checks passed, set the values
      setQrValue(result.qrCode.qrValue);
      setUserInfo(result.user);
      setShowQR(true);
      setError('');
      setShowUpgrade(false);
      setShowCelebration(true);
      checkAchievements(result.user);
      setTimeout(() => setShowCelebration(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code. Please try again.';
      setError(errorMessage);
      console.error('QR Generation Error:', err);
      
      // Check if it's a limit error and show upgrade prompt
      if (errorMessage.includes('limit reached') || errorMessage.includes('limit')) {
        setShowUpgrade(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      address: '',
      phone: ''
    });
    setQrValue('');
    setShowQR(false);
    setUserInfo(null);
    setError('');
    setShowUpgrade(false);
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    setError('');
    
    try {
      const result = await upgradeToPremium(formData.email);
      if (result && result.plan === 'premium') {
        // Refresh user info
        await checkUserLimits(formData.email);
        setShowUpgrade(false);
        setError('');
        alert('🎉 Successfully upgraded to Premium! You can now generate unlimited QR codes.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upgrade. Please try again.';
      setError(errorMessage);
    } finally {
      setUpgrading(false);
    }
  };

  const handleDownload = () => {
    // Create a canvas element to download QR code
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `parking-qr-${formData.name.replace(/\s/g, '-')}.png`;
      link.href = url;
      link.click();
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = (): number => {
    if (!userInfo) return 0;
    if (userInfo.plan === 'premium') return 100;
    return Math.min((userInfo.qrCount / 3) * 100, 100);
  };

  // Get user level
  const getUserLevel = (): number => {
    if (!userInfo) return 1;
    const count = userInfo.qrCount;
    if (count < 3) return 1;
    if (count < 10) return 2;
    if (count < 25) return 3;
    return 4;
  };

  return (
    <div className="App">
      {showCelebration && (
        <div className="celebration">
          {createConfetti()}
        </div>
      )}
      <div className="container">
        <header className="header">
          <div className="car-icon-single">🚗</div>
          <h1>Parking QR Generator</h1>
          <p className="subtitle">Create a smart QR code for your vehicle. One scan, instant call.</p>
          {userInfo && (
            <div className="level-indicator" style={{ marginTop: '1rem' }}>
              <span className="level-icon">⭐</span>
              <span>Level {getUserLevel()} Explorer</span>
            </div>
          )}
        </header>

        {!showQR ? (
          <form onSubmit={handleSubmit} className="form">
            <div className="form-header">
              <div className="form-header-content">
                <span className="form-icon">👤</span>
                <h2>Your Information</h2>
              </div>
              <p className="form-description">Fill in your details to generate your personalized parking QR code</p>
            </div>

            <div className="form-group">
              <label htmlFor="name">
                <span className="label-icon">👤</span>
                Full Name <span className="required">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <span className="label-icon">✉️</span>
                Email Address <span className="required">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                required
              />
              {userInfo && (
                <>
                  <div className="progress-container">
                    <div className="progress-header">
                      <span className="progress-label">
                        <span>📊</span>
                        <span>Progress</span>
                      </span>
                      <span className="progress-value">
                        {userInfo.qrCount} / {userInfo.plan === 'premium' ? '∞' : '3'}
                      </span>
                    </div>
                    <div className="progress-bar-wrapper">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${getProgressPercentage()}%` }}
                      />
                    </div>
                  </div>
                  {achievements.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      {achievements.map(achievement => (
                        <span 
                          key={achievement.id}
                          className={`achievement-badge ${achievement.id === 'premium' ? 'achievement-badge-premium' : ''}`}
                        >
                          <span>{achievement.icon}</span>
                          <span>{achievement.text}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="address">
                <span className="label-icon">📍</span>
                Address <span className="required">*</span>
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, City, State"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                <span className="label-icon">📞</span>
                Phone Number <span className="required">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                required
              />
              <small className="hint">This number will be called when someone scans your QR code</small>
            </div>

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
            
            {showUpgrade && userInfo && userInfo.plan === 'free' && (
              <div className="upgrade-prompt">
                <h3>🚀 Upgrade to Premium</h3>
                <p>You've reached the free limit of 3 QR codes. Upgrade to premium for unlimited QR codes!</p>
                <div className="upgrade-features">
                  <div className="feature">✅ Unlimited QR codes</div>
                  <div className="feature">✅ Priority support</div>
                  <div className="feature">✅ Advanced features</div>
                </div>
                <button 
                  type="button" 
                  onClick={handleUpgrade} 
                  className="btn btn-premium"
                  disabled={upgrading}
                >
                  {upgrading ? 'Upgrading...' : 'Upgrade to Premium - $9.99/month'}
                </button>
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              <span className="btn-icon">✓</span>
              {loading ? 'Generating...' : 'Generate QR Code'}
            </button>
          </form>
        ) : (
          <div className="qr-section">
            {showCelebration && (
              <div className="success-message">
                <h3>🎉 Success! 🎉</h3>
                <p>Your QR code has been generated successfully!</p>
              </div>
            )}
            
            {/* Stats Cards */}
            {userInfo && (
              <div className="stats-container">
                <div className="stat-card">
                  <div className="stat-value">{userInfo.qrCount}</div>
                  <div className="stat-label">QR Codes</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{getUserLevel()}</div>
                  <div className="stat-label">Level</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{userInfo.plan === 'premium' ? '💎' : '🆓'}</div>
                  <div className="stat-label">{userInfo.plan === 'premium' ? 'Premium' : 'Free'}</div>
                </div>
              </div>
            )}

            {/* QR Code Card */}
            <div className="qr-code-card">
              <h2>Your Parking QR Code</h2>
              <p className="qr-subtitle">Ready to print and place on your vehicle</p>
              <div className="qr-wrapper">
                {qrValue && (
                  <QRCodeCanvas 
                    value={qrValue} 
                    size={300}
                    level="H"
                    includeMargin={true}
                  />
                )}
              </div>
            </div>

            {/* User Info Card */}
            <div className="user-info-card">
              <div className="info-item">
                <span className="info-icon">👤</span>
                <div className="info-content">
                  <span className="info-label">Name</span>
                  <span className="info-value">{formData.name}</span>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">✉️</span>
                <div className="info-content">
                  <span className="info-label">Email</span>
                  <span className="info-value">{formData.email}</span>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">📍</span>
                <div className="info-content">
                  <span className="info-label">Address</span>
                  <span className="info-value">{formData.address}</span>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">📞</span>
                <div className="info-content">
                  <span className="info-label">Phone</span>
                  <span className="info-value">{formData.phone}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="qr-actions">
              <button onClick={handleDownload} className="btn btn-primary">
                <span className="btn-icon">⬇️</span>
                Download QR Code
              </button>
              <button onClick={handleReset} className="btn btn-outline">
                <span className="btn-icon">🔄</span>
                Generate New
              </button>
            </div>

            {/* How It Works Card */}
            <div className="how-it-works-card">
              <div className="how-it-works-header">
                <span className="how-it-works-icon">📞</span>
                <h3>How it works</h3>
              </div>
              <p className="how-it-works-text">
                Print this QR code and display it on your vehicle's dashboard. When someone needs to reach you (e.g., if your car needs to be moved), they simply scan the code with their phone camera, and it will instantly open their dialer with your number ready to call.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GeneratorPage;

