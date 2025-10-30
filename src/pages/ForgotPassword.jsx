import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const navigate = useNavigate();
  const [method, setMethod] = useState('email'); // 'email' or 'sms'
  const [identifier, setIdentifier] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!identifier) {
      setError(method === 'email' ? 'Email is required' : 'Phone number is required');
      return;
    }

    if (method === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier)) {
        setError('Please enter a valid email address');
        return;
      }
    } else {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(identifier.replace(/\s/g, ''))) {
        setError('Please enter a valid phone number');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Replace with actual API call
      // await api.post('/auth/forgot-password', { identifier, method });
      
      if (method === 'sms') {
        // Redirect to verification code page for SMS
        navigate('/verify-code', { state: { phoneNumber: identifier, type: 'password-reset' } });
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
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
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
            <p className="text-white/70 mb-6">
              We've sent a password reset link to <span className="text-white font-medium">{identifier}</span>
            </p>
            <p className="text-sm text-white/60 mb-8">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setSubmitted(false)}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                try again
              </button>
            </p>

            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-lg transition"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <h2 className="text-3xl font-bold mt-4">Reset Password</h2>
          <p className="text-white/70 mt-2">Enter your email to receive a reset link</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur p-8">
          {/* Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/80 mb-3">
              Choose recovery method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setMethod('email');
                  setIdentifier('');
                  setError('');
                }}
                className={`p-4 rounded-lg border transition ${
                  method === 'email'
                    ? 'bg-indigo-500/20 border-indigo-500 text-white'
                    : 'bg-slate-800/50 border-white/10 text-white/70 hover:bg-slate-800'
                }`}
              >
                <div className="text-2xl mb-2">📧</div>
                <div className="text-sm font-medium">Email</div>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setMethod('sms');
                  setIdentifier('');
                  setError('');
                }}
                className={`p-4 rounded-lg border transition ${
                  method === 'sms'
                    ? 'bg-indigo-500/20 border-indigo-500 text-white'
                    : 'bg-slate-800/50 border-white/10 text-white/70 hover:bg-slate-800'
                }`}
              >
                <div className="text-2xl mb-2">📱</div>
                <div className="text-sm font-medium">SMS</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                {method === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <input
                type={method === 'email' ? 'email' : 'tel'}
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                placeholder={method === 'email' ? 'your@email.com' : '+254 700 123456'}
                disabled={loading}
              />
              <p className="mt-2 text-xs text-white/50">
                {method === 'email' 
                  ? 'We\'ll send a reset link to your email' 
                  : 'We\'ll send a verification code to your phone'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : method === 'email' ? 'Send Reset Link' : 'Send Code'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-white/60 hover:text-white transition">
              ← Back to Login
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-white/50 text-center">
              Remember your password?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
