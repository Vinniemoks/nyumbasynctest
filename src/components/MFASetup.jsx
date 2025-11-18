import React, { useState, useEffect } from 'react';
import { generateSecret, generateTOTPUri, verifyTOTP, generateBackupCodes } from '../utils/mfaService';
import QRCode from 'qrcode';

const MFASetup = ({ user, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    initializeMFA();
  }, []);

  const initializeMFA = async () => {
    try {
      const newSecret = generateSecret();
      setSecret(newSecret);

      const uri = generateTOTPUri(newSecret, user.email);
      const qrUrl = await QRCode.toDataURL(uri);
      setQrCodeUrl(qrUrl);

      const codes = generateBackupCodes(10);
      setBackupCodes(codes);
    } catch (err) {
      setError('Failed to initialize MFA setup');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isValid = await verifyTOTP(verificationCode, secret);

      if (isValid) {
        setStep(2);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete({
      secret,
      backupCodes,
      enabled: true
    });
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadBackupCodes = () => {
    const content = `NyumbaSync Admin - MFA Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\nUser: ${user.email}\n\n${backupCodes.join('\n')}\n\nIMPORTANT: Store these codes securely. Each code can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nyumbasync-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="fas fa-shield-alt text-2xl"></i>
              <div>
                <h2 className="text-xl font-bold">Enable Two-Factor Authentication</h2>
                <p className="text-indigo-100 text-sm">Add an extra layer of security to your admin account</p>
              </div>
            </div>
            <button onClick={onCancel} className="text-white hover:text-indigo-200">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Scan QR Code */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Scan QR Code</h3>
                  <p className="text-sm text-gray-600">Use your authenticator app to scan this code</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-center">
                {qrCodeUrl && (
                  <img src={qrCodeUrl} alt="QR Code" className="mx-auto w-64 h-64" />
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-2">Recommended Authenticator Apps:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Google Authenticator (iOS/Android)</li>
                      <li>Microsoft Authenticator (iOS/Android)</li>
                      <li>Authy (iOS/Android/Desktop)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or enter this key manually:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={secret}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                  />
                  <button
                    onClick={copySecret}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <i className={`fas fa-${copied ? 'check' : 'copy'}`}></i>
                  </button>
                </div>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter the 6-digit code from your app:
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

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-800 text-sm">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || verificationCode.length !== 6}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <i className="fas fa-spinner fa-spin"></i>
                        Verifying...
                      </span>
                    ) : (
                      'Verify & Continue'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: Save Backup Codes */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 font-bold">
                  <i className="fas fa-check"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Save Your Backup Codes</h3>
                  <p className="text-sm text-gray-600">Use these codes if you lose access to your authenticator</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <i className="fas fa-exclamation-triangle text-yellow-600 mt-1"></i>
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Important:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Each code can only be used once</li>
                      <li>Store them in a secure location</li>
                      <li>Don't share them with anyone</li>
                      <li>You won't be able to see these codes again</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-3">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded px-4 py-2 font-mono text-sm text-center"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={downloadBackupCodes}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-download"></i>
                Download Backup Codes
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleComplete}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Complete Setup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MFASetup;
