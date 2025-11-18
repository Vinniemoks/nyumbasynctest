import React, { useState, useEffect } from 'react';
import { verifyTOTP, verifyBackupCode, mfaSessionManager } from '../utils/mfaService';
import { auditLogger } from '../utils/auditLogger';

const MFAVerification = ({ onVerified, onCancel }) => {
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  useEffect(() => {
    checkLockStatus();
    const interval = setInterval(checkLockStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkLockStatus = () => {
    const session = mfaSessionManager.getPendingSession();
    if (!session) return;

    const lockStatus = mfaSessionManager.isAccountLocked(session.userId);
    if (lockStatus.locked) {
      setIsLocked(true);
      setLockoutTime(Math.ceil(lockStatus.remainingTime / 1000));
    } else {
      setIsLocked(false);
      setLockoutTime(0);
      setRemainingAttempts(mfaSessionManager.getRemainingAttempts(session.userId));
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const session = mfaSessionManager.getPendingSession();
    if (!session) {
      setError('Session expired. Please login again.');
      setLoading(false);
      return;
    }

    // Check if account is locked
    const lockStatus = mfaSessionManager.isAccountLocked(session.userId);
    if (lockStatus.locked) {
      setError(`Account temporarily locked. Try again in ${Math.ceil(lockStatus.remainingTime / 60000)} minutes.`);
      setLoading(false);
      return;
    }

    try {
      let isValid = false;

      if (useBackupCode) {
        // Verify backup code
        const result = await verifyBackupCode(code, session.backupCodes || []);
        isValid = result.valid;

        if (isValid) {
          // Mark backup code as used (in real app, update on backend)
          auditLogger.logAuth('mfa_backup_code_used', {
            userId: session.userId,
            codeIndex: result.index
          });
        }
      } else {
        // Verify TOTP code
        isValid = await verifyTOTP(code, session.mfaSecret);
      }

      if (isValid) {
        // Clear failed attempts
        mfaSessionManager.clearFailedAttempts(session.userId);
        
        // Mark MFA as verified
        mfaSessionManager.setMFAVerified(session.userId);
        
        // Clear pending session
        mfaSessionManager.clearPendingSession();
        
        auditLogger.logAuth('mfa_verification_success', {
          userId: session.userId,
          method: useBackupCode ? 'backup_code' : 'totp'
        });

        onVerified(session);
      } else {
        // Record failed attempt
        const attempts = mfaSessionManager.recordFailedAttempt(session.userId);
        
        if (attempts.lockedUntil) {
          setError('Too many failed attempts. Account temporarily locked.');
          setIsLocked(true);
        } else {
          const remaining = mfaSessionManager.getRemainingAttempts(session.userId);
          setRemainingAttempts(remaining);
          setError(`Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
        }
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
      setCode('');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <i className="fas fa-shield-alt text-3xl text-indigo-600"></i>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Two-Factor Authentication</h1>
          <p className="text-indigo-100">Enter your verification code to continue</p>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {isLocked ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <i className="fas fa-lock text-3xl text-red-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Account Temporarily Locked</h3>
              <p className="text-gray-600">
                Too many failed verification attempts. Please try again in:
              </p>
              <div className="text-4xl font-bold text-red-600">
                {formatTime(lockoutTime)}
              </div>
              <button
                onClick={onCancel}
                className="w-full mt-6 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {useBackupCode ? 'Backup Code' : 'Authentication Code'}
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\s/g, '').toUpperCase())}
                  placeholder={useBackupCode ? 'XXXX-XXXX' : '000000'}
                  maxLength={useBackupCode ? 9 : 6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                  autoFocus
                />
                <p className="mt-2 text-xs text-gray-500 text-center">
                  {useBackupCode
                    ? 'Enter one of your backup codes'
                    : 'Enter the 6-digit code from your authenticator app'}
                </p>
              </div>

              {remainingAttempts < 5 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-yellow-800 text-sm">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length < (useBackupCode ? 8 : 6)}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Verifying...
                  </span>
                ) : (
                  'Verify'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setUseBackupCode(!useBackupCode);
                    setCode('');
                    setError('');
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  {useBackupCode ? 'Use authenticator code' : 'Use backup code'}
                </button>
              </div>

              <div className="text-center pt-4 border-t">
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-start text-white text-sm">
            <i className="fas fa-info-circle mt-0.5 mr-2"></i>
            <p>
              This is an additional security layer to protect your admin account. 
              Never share your verification codes with anyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFAVerification;
