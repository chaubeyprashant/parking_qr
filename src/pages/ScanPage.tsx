import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQRCodeInfo, initiateCall } from '../services/api';
import type { QRCodeInfo, CallResponse } from '../types/api';
import './ScanPage.css';

function ScanPage() {
  const { qrId } = useParams<{ qrId: string }>();
  const navigate = useNavigate();
  const [qrInfo, setQrInfo] = useState<QRCodeInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [calling, setCalling] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [callInitiated, setCallInitiated] = useState<boolean>(false);
  const [callResult, setCallResult] = useState<CallResponse | null>(null);
  const [callerPhone, setCallerPhone] = useState<string>('');
  const [showPhoneInput, setShowPhoneInput] = useState<boolean>(false);

  useEffect(() => {
    const fetchQRInfo = async () => {
      if (!qrId) return;
      
      try {
        setLoading(true);
        const info = await getQRCodeInfo(qrId);
        setQrInfo(info);
        setError('');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'QR code not found';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchQRInfo();
  }, [qrId]);

  const handleCall = async () => {
    if (!qrId) return;
    
    try {
      setCalling(true);
      setError('');
      
      // First attempt - may require phone number
      const result = await initiateCall(qrId, callerPhone || null);
      
      // Check if phone number is required
      if (result.requiresPhoneNumber && !callerPhone) {
        setShowPhoneInput(true);
        setCallResult(result);
        return;
      }
      
      setCallResult(result);
      setCallInitiated(true);
      
      // If Twilio is configured and call was initiated
      if (result.callSid && result.maskedNumber) {
        // Show success message - Twilio will call the user
        // The user will receive a call from the masked number
        console.log('Call initiated via Twilio:', result.callSid);
      } else if (result.maskedNumber && result.maskedNumber !== 'Call feature requires Twilio integration') {
        // Fallback: direct call link (if not using Twilio)
        window.location.href = `tel:${result.maskedNumber}`;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate call. Please try again.';
      setError(errorMessage);
    } finally {
      setCalling(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callerPhone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    await handleCall();
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
          <div className="car-icon-large">🚗</div>
          <h2>Contact Vehicle Owner</h2>
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
            {showPhoneInput ? (
              <form onSubmit={handlePhoneSubmit} className="phone-input-form">
                <div className="call-info">
                  <div className="call-icon">📞</div>
                  <h3>Enter Your Phone Number</h3>
                  <p className="call-description">
                    For your privacy and security, we need your phone number to connect you with the owner.
                    Your number will remain private and will not be shared.
                  </p>
                </div>
                
                <div className="form-group">
                  <label htmlFor="callerPhone">
                    <span className="label-icon">📱</span>
                    Your Phone Number <span className="required">*</span>
                  </label>
                  <input
                    id="callerPhone"
                    type="tel"
                    value={callerPhone}
                    onChange={(e) => setCallerPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required
                    className="phone-input"
                  />
                  <small className="hint">Include country code (e.g., +1 for US)</small>
                </div>

                {error && (
                  <div className="error-message">
                    <p>{error}</p>
                  </div>
                )}

                <div className="phone-form-actions">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowPhoneInput(false);
                      setCallerPhone('');
                      setError('');
                    }} 
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-call"
                    disabled={calling || !callerPhone.trim()}
                  >
                    {calling ? (
                      <>
                        <span className="spinner-small"></span>
                        Initiating Call...
                      </>
                    ) : (
                      <>
                        <span className="call-btn-icon">📞</span>
                        Initiate Call
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <>
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
              </>
            )}
          </div>
        ) : (
          <div className="call-success">
            <div className="success-icon">✅</div>
            <h3>Call Initiated!</h3>
            {callResult?.callSid ? (
              <div className="call-info-success">
                <p>You will receive a call from our masked number shortly.</p>
                <p className="call-status">Call Status: {callResult.status || 'Initiating'}</p>
                {callResult.maskedNumber && (
                  <p className="masked-number-info">
                    Calling from: {callResult.maskedNumber}
                  </p>
                )}
              </div>
            ) : callResult?.note ? (
              <div className="demo-note">
                <p>{callResult.note}</p>
              </div>
            ) : (
              <p>Your call has been initiated successfully.</p>
            )}
            <button 
              onClick={() => {
                setCallInitiated(false);
                setCallResult(null);
                setShowPhoneInput(false);
                setCallerPhone('');
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
