import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: ''
  });
  const [qrValue, setQrValue] = useState('');
  const [showQR, setShowQR] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = formData.phone.replace(/\s|-|\(|\)/g, '');
    if (cleanPhone) {
      // Create tel: link that will open dialer when scanned
      setQrValue(`tel:${cleanPhone}`);
      setShowQR(true);
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

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <div className="header-icon">
            <div className="wifi-icon">📶</div>
            <div className="car-icon">🚗</div>
          </div>
          <h1>Parking QR Generator</h1>
          <p className="subtitle">Create a smart QR code for your vehicle. One scan, instant call.</p>
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

            <button type="submit" className="btn btn-primary">
              <span className="btn-icon">✓</span>
              Generate QR Code
            </button>
          </form>
        ) : (
          <div className="qr-section">
            <div className="qr-card">
              <h2>Your Parking QR Code</h2>
              <div className="qr-wrapper">
                <QRCodeCanvas 
                  value={qrValue} 
                  size={300}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div className="user-info">
                <div className="info-item">
                  <strong>Name:</strong> {formData.name}
                </div>
                <div className="info-item">
                  <strong>Email:</strong> {formData.email}
                </div>
                <div className="info-item">
                  <strong>Address:</strong> {formData.address}
                </div>
                <div className="info-item">
                  <strong>Phone:</strong> {formData.phone}
                </div>
              </div>

              <div className="qr-actions">
                <button onClick={handleDownload} className="btn btn-secondary">
                  Download QR Code
                </button>
                <button onClick={handleReset} className="btn btn-outline">
                  Generate New Code
                </button>
              </div>

              <div className="instructions">
                <p className="instruction-text">
                  📱 <strong>How it works:</strong> Print this QR code and place it on your vehicle. 
                  When someone scans it, their phone will automatically open the dialer with your number ready to call.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;