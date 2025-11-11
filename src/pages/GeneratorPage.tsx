import { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { getUserInfo, generateQRCode, upgradeToPremium } from '../services/api';
import type { User, UserFormData, GenerateQRResponse } from '../types/api';
import '../App.css';

interface Achievement {
  id: string;
  text: string;
  icon: string;
}

interface QRCodeStyle {
  id: string;
  name: string;
  fgColor: string;
  bgColor: string;
  icon: string;
  gradient?: boolean;
  emoji?: string;
  pattern?: string;
  sticker?: boolean;
}

function GeneratorPage() {
  const navigate = useNavigate();
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
  const [selectedStyle, setSelectedStyle] = useState<string>('classic');
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const qrCodeStyles: QRCodeStyle[] = [
    { id: 'classic', name: 'Classic', fgColor: '#000000', bgColor: '#FFFFFF', icon: '⚫' },
    { id: 'car', name: 'Car Sticker', fgColor: '#2196F3', bgColor: '#E3F2FD', icon: '🚗', emoji: '🚗', sticker: true },
    { id: 'star', name: 'Star Power', fgColor: '#FFD700', bgColor: '#FFF9C4', icon: '⭐', emoji: '⭐', sticker: true },
    { id: 'heart', name: 'Love It', fgColor: '#E91E63', bgColor: '#FCE4EC', icon: '❤️', emoji: '❤️', sticker: true },
    { id: 'fire', name: 'On Fire', fgColor: '#FF5722', bgColor: '#FFEBEE', icon: '🔥', emoji: '🔥', sticker: true },
    { id: 'rainbow', name: 'Rainbow', fgColor: '#667eea', bgColor: '#f093fb', icon: '🌈', emoji: '🌈', sticker: true, gradient: true },
    { id: 'rocket', name: 'Rocket', fgColor: '#9C27B0', bgColor: '#F3E5F5', icon: '🚀', emoji: '🚀', sticker: true },
    { id: 'crown', name: 'Royal', fgColor: '#FF9800', bgColor: '#FFF3E0', icon: '👑', emoji: '👑', sticker: true },
    { id: 'diamond', name: 'Diamond', fgColor: '#00BCD4', bgColor: '#E0F7FA', icon: '💎', emoji: '💎', sticker: true },
    { id: 'party', name: 'Party', fgColor: '#E91E63', bgColor: '#F8BBD0', icon: '🎉', emoji: '🎉', sticker: true },
  ];

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
      const styleName = qrCodeStyles.find(s => s.id === selectedStyle)?.name.toLowerCase().replace(/\s/g, '-') || 'classic';
      link.download = `parking-qr-${formData.name.replace(/\s/g, '-')}-${styleName}.png`;
      link.href = url;
      link.click();
    }
  };

  const getCurrentStyle = (): QRCodeStyle => {
    return qrCodeStyles.find(s => s.id === selectedStyle) || qrCodeStyles[0];
  };

  // Calculate progress percentage
  const getProgressPercentage = (): number => {
    if (!userInfo) return 0;
    if (userInfo.plan === 'premium') return 100;
    return Math.min((userInfo.qrCount / 3) * 100, 100);
  };

  // Get user tier/badge
  const getUserTier = (): string => {
    if (!userInfo) return 'Starter';
    const count = userInfo.qrCount;
    if (count < 3) return 'Starter';
    if (count < 10) return 'Active';
    if (count < 25) return 'Pro';
    return 'Expert';
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
          <div className="header-top">
            <h1 className="logo-link" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              Parking QR
            </h1>
            <button 
              onClick={() => navigate('/')} 
              className="home-link"
              title="Back to Home"
            >
              ← Home
            </button>
          </div>
        </header>

        {!showQR ? (
          <form onSubmit={handleSubmit} className="form">
            <div className="form-header">
              <div className="form-icon">🚗</div>
              <div className="form-header-content">
                <h2>Vehicle Registration</h2>
                <p className="form-description">Please fill in your details below</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name">
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

            <div className="form-row">
              <div className="form-group form-group-half">
                <label htmlFor="address">
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

              <div className="form-group form-group-half">
                <label htmlFor="phone">
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
              </div>
            </div>
            <small className="hint" style={{ marginTop: '-0.5rem', marginBottom: '0.5rem' }}>This number will be called when someone scans your QR code</small>

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
            
            {showUpgrade && userInfo && userInfo.plan === 'free' && (
              <div className="upgrade-prompt">
                <h3>🚀 Upgrade to Premium</h3>
                <p>You've reached the basic plan limit of 3 QR codes. Upgrade to premium for unlimited QR codes!</p>
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
              {loading ? 'Generating...' : 'Submit Registration'}
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
                  <div className="stat-value">{getUserTier()}</div>
                  <div className="stat-label">Tier</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{userInfo.plan === 'premium' ? '💎' : '📦'}</div>
                  <div className="stat-label">{userInfo.plan === 'premium' ? 'Premium' : 'Basic'}</div>
                </div>
              </div>
            )}

            {/* QR Code Card */}
            <div className="qr-code-card">
              <h2>Your Parking QR Code</h2>
              <p className="qr-subtitle">Choose a style and download your QR code</p>
              
              {/* Style Selector */}
              <div className="qr-style-selector">
                <label className="style-selector-label">Choose Style:</label>
                <div className="style-options">
                  {qrCodeStyles.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      className={`style-option ${selectedStyle === style.id ? 'active' : ''}`}
                      onClick={() => setSelectedStyle(style.id)}
                      title={style.name}
                    >
                      <span className="style-icon">{style.icon}</span>
                      <span className="style-name">{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="qr-wrapper" ref={qrCodeRef}>
                {qrValue && (
                  <div 
                    className={`qr-code-container ${getCurrentStyle().sticker ? 'qr-sticker' : ''}`}
                    style={{
                      backgroundColor: getCurrentStyle().bgColor,
                      padding: getCurrentStyle().sticker ? '30px 20px' : '20px',
                      borderRadius: getCurrentStyle().sticker ? '24px' : '16px',
                      boxShadow: getCurrentStyle().sticker 
                        ? '0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 4px rgba(255, 255, 255, 0.5)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.1)',
                      position: 'relative',
                      display: 'inline-block',
                      border: getCurrentStyle().sticker ? '3px dashed rgba(0, 0, 0, 0.1)' : 'none',
                    }}
                  >
                    {getCurrentStyle().sticker && getCurrentStyle().emoji && (
                      <>
                        <div className="qr-emoji-top">{getCurrentStyle().emoji}</div>
                        <div className="qr-emoji-bottom">{getCurrentStyle().emoji}</div>
                        <div className="qr-emoji-left">{getCurrentStyle().emoji}</div>
                        <div className="qr-emoji-right">{getCurrentStyle().emoji}</div>
                      </>
                    )}
                    <QRCodeCanvas 
                      value={qrValue} 
                      size={280}
                      level="H"
                      includeMargin={true}
                      fgColor={getCurrentStyle().fgColor}
                      bgColor={getCurrentStyle().bgColor}
                    />
                    {getCurrentStyle().sticker && (
                      <div className="qr-sticker-label">
                        <span className="sticker-emoji">{getCurrentStyle().emoji}</span>
                        <span className="sticker-text">PARKING QR</span>
                      </div>
                    )}
                  </div>
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

