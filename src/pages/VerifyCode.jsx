import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const { phoneNumber, type } = location.state || {};
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!phoneNumber) {
      navigate('/forgot-password');
    }
  }, [phoneNumber, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('');
    setCode([...newCode, ...Array(6 - newCode.length).fill('')]);
    
    if (newCode.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (verificationCode) => {
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Replace with actual API call
      // await api.post('/auth/verify-code', { phoneNumber, code: verificationCode, type });
      
      if (type === 'password-reset') {
        navigate('/reset-password', { state: { phoneNumber, verified: true } });
      } else {
        // For login verification
        navigate('/login', { state: { verified: true, phoneNumber } });
      }
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Replace with actual API call
      // await api.post('/auth/resend-code', { phoneNumber, type });
      
      setCountdown(60);
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    handleVerify(verificationCode);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 translate-y-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 text-2xl font-semibold mb-6">
            <img src="/images/logo.png" alt="NyumbaSync" className="h-12 w-12 rounded-full bg-white/10 p-1" />
            NyumbaSync
          </Link>
          <h2 className="text-3xl font-bold mt-4">Verify Your Phone</h2>
          <p className="text-white/70 mt-2">
            Enter the 6-digit code sent to
          </p>
          <p className="text-white font-medium mt-1">{phoneNumber}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/80 mb-4 text-center">
                Verification Code
              </label>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    disabled={loading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.some(digit => !digit)}
              className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          <div className="mt-6 text-center">
            {countdown > 0 ? (
              <p className="text-sm text-white/60">
                Resend code in <span className="text-white font-medium">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link to="/forgot-password" className="text-sm text-white/60 hover:text-white transition">
              ← Use a different method
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyCode;
