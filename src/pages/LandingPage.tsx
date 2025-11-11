import { useNavigate } from 'react-router-dom';
import '../App.css';

function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/generate');
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <div className="header-top">
            <h1 className="logo-link" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              Parking QR
            </h1>
          </div>
          <p className="subtitle">
            Create a smart QR code for your vehicle. One scan, instant connection.
          </p>
        </header>

        <div className="landing-content">
          {/* Hero Section */}
          <div className="hero-card">
            <div className="hero-icon">📱</div>
            <h2>Never Miss a Call Again</h2>
            <p className="hero-description">
              Display a QR code on your vehicle's dashboard. When someone needs to reach you, 
              they simply scan the code and get connected instantly through a secure, masked call system.
            </p>
          </div>

          {/* Features Section */}
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Quick Setup</h3>
              <p>Generate your personalized QR code in seconds</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Privacy Protected</h3>
              <p>Your phone number stays private with masked calling</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📞</div>
              <h3>Instant Connection</h3>
              <p>One scan connects callers directly to you</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🖨️</div>
              <h3>Easy to Print</h3>
              <p>Download and print your QR code instantly</p>
            </div>
          </div>

          {/* How It Works */}
          <div className="how-it-works-section">
            <h2 className="section-title">How It Works</h2>
            <div className="steps-container">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Enter Your Details</h3>
                  <p>Fill in your name, email, address, and phone number</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Generate QR Code</h3>
                  <p>Get your unique QR code instantly</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Print & Display</h3>
                  <p>Print the QR code and place it on your vehicle's dashboard</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Stay Connected</h3>
                  <p>Anyone can scan and call you securely</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="cta-section">
            <h2>Ready to Get Started?</h2>
            <p className="cta-description">
              Create your parking QR code now and never miss an important call again.
            </p>
            <button 
              onClick={handleGetStarted}
              className="btn btn-primary btn-large"
            >
              <span className="btn-icon">🚀</span>
              Generate Your QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

