import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import MFASetup from '../../components/MFASetup';
import { verifyTOTP, generateBackupCodes, hashBackupCode } from '../../utils/mfaService';
import { auditLogger } from '../../utils/auditLogger';

const MFAManagement = () => {
  const { user } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [backupCodesCount, setBackupCodesCount] = useState(0);
  const [showRegenerateBackup, setShowRegenerateBackup] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState([]);

  useEffect(() => {
    loadMFAStatus();
  }, []);

  const loadMFAStatus = async () => {
    try {
      // In real app, fetch from backend
      // For now, check localStorage
      const mfaData = localStorage.getItem(`mfa_${user.id}`);
      if (mfaData) {
        const data = JSON.parse(mfaData);
        setMfaEnabled(data.enabled);
        setBackupCodesCount(data.backupCodes?.length || 0);
      }
    } catch (err) {
      console.error('Failed to load MFA status:', err);
    }
  };

  const handleEnableMFA = () => {
    setShowSetup(true);
  };

  const handleMFASetupComplete = async (mfaData) => {
    try {
      setLoading(true);

      // Hash backup codes before storing
      const hashedCodes = await Promise.all(
        mfaData.backupCodes.map(code => hashBackupCode(code))
      );

      // In real app, save to backend
      // For now, save to localStorage
      const data = {
        enabled: true,
        secret: mfaData.secret,
        backupCodes: hashedCodes,
        enabledAt: new Date().toISOString()
      };

      localStorage.setItem(`mfa_${user.id}`, JSON.stringify(data));

      auditLogger.logSecurity('mfa_enabled', {
        userId: user.id,
        email: user.email
      });

      setMfaEnabled(true);
      setBackupCodesCount(hashedCodes.length);
      setShowSetup(false);
      setSuccess('Two-factor authentication has been enabled successfully!');
    } catch (err) {
      setError('Failed to enable MFA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMFA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify current TOTP code before disabling
      const mfaData = localStorage.getItem(`mfa_${user.id}`);
      if (!mfaData) {
        setError('MFA data not found');
        return;
      }

      const data = JSON.parse(mfaData);
      const isValid = await verifyTOTP(verificationCode, data.secret);

      if (!isValid) {
        setError('Invalid verification code');
        return;
      }

      // Disable MFA
      localStorage.removeItem(`mfa_${user.id}`);

      auditLogger.logSecurity('mfa_disabled', {
        userId: user.id,
        email: user.email
      });

      setMfaEnabled(false);
      setShowDisableConfirm(false);
      setVerificationCode('');
      setSuccess('Two-factor authentication has been disabled.');
    } catch (err) {
      setError('Failed to disable MFA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    try {
      setLoading(true);

      // Generate new backup codes
      const codes = generateBackupCodes(10);
      const hashedCodes = await Promise.all(codes.map(code => hashBackupCode(code)));

      // Update stored data
      const mfaData = localStorage.getItem(`mfa_${user.id}`);
      if (mfaData) {
        const data = JSON.parse(mfaData);
        data.backupCodes = hashedCodes;
        localStorage.setItem(`mfa_${user.id}`, JSON.stringify(data));
      }

      auditLogger.logSecurity('mfa_backup_codes_regenerated', {
        userId: user.id,
        email: user.email
      });

      setNewBackupCodes(codes);
      setBackupCodesCount(codes.length);
      setSuccess('New backup codes generated successfully!');
    } catch (err) {
      setError('Failed to regenerate backup codes.');
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = `NyumbaSync Admin - MFA Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\nUser: ${user.email}\n\n${newBackupCodes.join('\n')}\n\nIMPORTANT: Store these codes securely. Each code can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nyumbasync-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setNewBackupCodes([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
        <p className="text-gray-600 mt-1">
          Add an extra layer of security to your admin account
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-check-circle text-green-500 mr-2"></i>
            <p className="text-sm text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* MFA Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${mfaEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
              <i className={`fas fa-shield-alt text-2xl ${mfaEnabled ? 'text-green-600' : 'text-gray-400'}`}></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Two-Factor Authentication
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {mfaEnabled
                  ? 'Your account is protected with 2FA'
                  : 'Protect your account with an additional security layer'}
              </p>
              {mfaEnabled && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <i className="fas fa-check-circle mr-1"></i>
                    Enabled
                  </span>
                  <span className="text-xs text-gray-500">
                    {backupCodesCount} backup codes available
                  </span>
                </div>
              )}
            </div>
          </div>

          {!mfaEnabled && (
            <button
              onClick={handleEnableMFA}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Enable 2FA
            </button>
          )}
        </div>
      </div>

      {/* MFA Enabled Options */}
      {mfaEnabled && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Regenerate Backup Codes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-3 mb-4">
              <i className="fas fa-key text-indigo-600 text-xl mt-1"></i>
              <div>
                <h4 className="font-semibold text-gray-900">Backup Codes</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Generate new backup codes if you've lost access to your old ones
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRegenerateBackup(true)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Regenerate Backup Codes
            </button>
          </div>

          {/* Disable 2FA */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-3 mb-4">
              <i className="fas fa-shield-alt text-red-600 text-xl mt-1"></i>
              <div>
                <h4 className="font-semibold text-gray-900">Disable 2FA</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Remove two-factor authentication from your account
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDisableConfirm(true)}
              className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
            >
              Disable 2FA
            </button>
          </div>
        </div>
      )}

      {/* How it Works */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">How Two-Factor Authentication Works</h4>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle mt-0.5"></i>
            <p>Download an authenticator app like Google Authenticator or Authy</p>
          </div>
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle mt-0.5"></i>
            <p>Scan the QR code or enter the secret key manually</p>
          </div>
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle mt-0.5"></i>
            <p>Enter the 6-digit code from your app each time you log in</p>
          </div>
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle mt-0.5"></i>
            <p>Save your backup codes in a secure location for emergency access</p>
          </div>
        </div>
      </div>

      {/* MFA Setup Modal */}
      {showSetup && (
        <MFASetup
          user={user}
          onComplete={handleMFASetupComplete}
          onCancel={() => setShowSetup(false)}
        />
      )}

      {/* Disable Confirmation Modal */}
      {showDisableConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Disable Two-Factor Authentication</h3>
            <p className="text-gray-600 mb-6">
              Enter your current authentication code to disable 2FA. This will make your account less secure.
            </p>

            <form onSubmit={handleDisableMFA} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Authentication Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDisableConfirm(false);
                    setVerificationCode('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Disabling...' : 'Disable 2FA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Regenerate Backup Codes Modal */}
      {showRegenerateBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Regenerate Backup Codes</h3>
            
            {newBackupCodes.length === 0 ? (
              <>
                <p className="text-gray-600 mb-6">
                  This will generate new backup codes and invalidate your old ones. Make sure to save the new codes securely.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRegenerateBackup(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRegenerateBackupCodes}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Generating...' : 'Generate New Codes'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    Save these codes now. You won't be able to see them again.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {newBackupCodes.map((code, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded px-3 py-2 font-mono text-sm text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={downloadBackupCodes}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <i className="fas fa-download mr-2"></i>
                    Download Codes
                  </button>
                  <button
                    onClick={() => {
                      setShowRegenerateBackup(false);
                      setNewBackupCodes([]);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MFAManagement;
