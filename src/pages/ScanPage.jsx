import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQRCodeInfo, initiateCall } from '../services/api';
import './ScanPage.css';

function ScanPage() {
  const { qrId } = useParams();
  const navigate = useNavigate();
  const [qrInfo, setQrInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);
  const [error, setError] = useState('');
  const [callInitiated, setCallInitiated] = useState(false);
  const [callResult, setCallResult] = useState(null);

  useEffect(() => {
    const fetchQRInfo = async () => {
      try {
        setLoading(true);
        const info = await getQRCodeInfo(qrId);
        setQrInfo(info);
        setError('');
      } catch (err) {
        setError(err.message || 'QR code not found');
      } finally {
        setLoading(false);
      }
    };

    if (qrId) {
      fetchQRInfo();
    }
  }, [qrId]);

  const handleCall = async () => {
    try {
      setCalling(true);
      setError('');
      const result = await initiateCall(qrId);
      setCallResult(result);
      setCallInitiated(true);
      
      // In production, this would initiate a call through Twilio
      // For now, show a message
      if (result.maskedNumber && result.maskedNumber !== 'Call feature requires Twilio integration') {
        // If we have a real masked number, initiate the call
        window.location.href = `tel:${result.maskedNumber}`;
      } else {
        // Demo mode - show instructions
        console.log('Call would be initiated to masked number:', result.maskedNumber);
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate call. Please try again.');
    } finally {
      setCalling(false);
    }
  };

  if (loading) {
    return (
      <div className="scan-page">
        <div className="scan-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading QR code information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !qrInfo) {
    return (
      <div className="scan-page">
        <div className="scan-container">
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h2>QR Code Not Found</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scan-page">
      <div className="scan-container">
        <div className="scan-header">
          <div className="car-icon-large">🚗</div>
          <h1>Contact Vehicle Owner</h1>
          <p className="scan-subtitle">Secure, private communication</p>
        </div>

        {qrInfo && (
          <div className="owner-info-card">
            <div className="info-header">
              <span className="info-icon">👤</span>
              <h2>Vehicle Owner</h2>
            </div>
            <div className="info-details">
              <div className="detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{qrInfo.name}</span>
              </div>
              {qrInfo.address && (
                <div className="detail-item">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{qrInfo.address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {!callInitiated ? (
          <div className="call-section">
            <div className="call-info">
              <div className="call-icon">📞</div>
              <h3>Need to contact the owner?</h3>
              <p className="call-description">
                Click the button below to initiate a secure, masked call. 
                Your phone number will remain private, and the owner's number will never be revealed to you.
              </p>
            </div>
            
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            <button 
              onClick={handleCall} 
              className="btn btn-call"
              disabled={calling}
            >
              {calling ? (
                <>
                  <span className="spinner-small"></span>
                  Initiating Call...
                </>
              ) : (
                <>
                  <span className="call-btn-icon">📞</span>
                  Call Owner (Masked)
                </>
              )}
            </button>

            <div className="privacy-note">
              <span className="privacy-icon">🔒</span>
              <p>Your privacy is protected. This is a masked call system.</p>
            </div>
          </div>
        ) : (
          <div className="call-success">
            <div className="success-icon">✅</div>
            <h3>Call Initiated!</h3>
            {callResult?.note && (
              <div className="demo-note">
                <p>{callResult.note}</p>
                {callResult.ownerPhone && (
                  <p className="demo-phone">
                    <strong>Demo Mode:</strong> Owner's phone: {callResult.ownerPhone}
                    <br />
                    <small>(This would be hidden in production)</small>
                  </p>
                )}
              </div>
            )}
            {callResult?.maskedNumber && callResult.maskedNumber !== 'Call feature requires Twilio integration' && (
              <p className="masked-number">
                Calling: {callResult.maskedNumber}
              </p>
            )}
            <button 
              onClick={() => {
                setCallInitiated(false);
                setCallResult(null);
              }} 
              className="btn btn-secondary"
            >
              Make Another Call
            </button>
          </div>
        )}

        <div className="scan-footer">
          <button onClick={() => navigate('/')} className="btn-link">
            Generate Your Own QR Code
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScanPage;

