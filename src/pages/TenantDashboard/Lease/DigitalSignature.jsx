import { useState, useRef, useEffect } from 'react';
import { useTenant } from '../../../context/TenantContext';

const DigitalSignature = ({ renewalTerms, onComplete, onCancel, loading }) => {
  const { tenant } = useTenant();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signedBy, setSignedBy] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Pre-fill the name field
    if (tenant) {
      setSignedBy(`${tenant.firstName} ${tenant.lastName}`);
    }

    // Initialize canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [tenant]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.beginPath();
    
    if (e.type === 'mousedown') {
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    } else if (e.type === 'touchstart') {
      e.preventDefault();
      const touch = e.touches[0];
      ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    }
    
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    if (e.type === 'mousemove') {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    } else if (e.type === 'touchmove') {
      e.preventDefault();
      const touch = e.touches[0];
      ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    }
    
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!signedBy.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!hasSignature) {
      setError('Please provide your signature');
      return;
    }

    if (!agreedToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    // Get signature as data URL
    const canvas = canvasRef.current;
    const signatureDataUrl = canvas.toDataURL('image/png');

    // Call the completion handler
    onComplete({
      signature: signatureDataUrl,
      signedBy: signedBy,
      signedAt: new Date().toISOString()
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Digital Signature</h2>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-blue-800">
          <i className="fas fa-info-circle mr-2"></i>
          By signing below, you agree to the lease renewal terms and conditions.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Renewal Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Renewal Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">New Monthly Rent:</span>
              <div className="font-semibold text-gray-800">
                KES {renewalTerms.proposedRent?.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Lease Duration:</span>
              <div className="font-semibold text-gray-800">
                {renewalTerms.leaseDuration} Months
              </div>
            </div>
            <div>
              <span className="text-gray-600">Start Date:</span>
              <div className="font-semibold text-gray-800">
                {formatDate(renewalTerms.startDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Legal Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={signedBy}
            onChange={(e) => setSignedBy(e.target.value)}
            placeholder="Enter your full legal name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            This should match the name on your identification documents
          </p>
        </div>

        {/* Signature Canvas */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Signature <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full bg-white cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">
              Sign above using your mouse or touchscreen
            </p>
            <button
              type="button"
              onClick={clearSignature}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <i className="fas fa-redo mr-1"></i>
              Clear Signature
            </button>
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="mb-6">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <span className="text-sm text-gray-700">
              I hereby acknowledge that I have read, understood, and agree to all the terms and conditions 
              outlined in the lease renewal agreement. I understand that this digital signature is legally 
              binding and has the same effect as a handwritten signature. I confirm that the information 
              provided is accurate and complete.
            </span>
          </label>
        </div>

        {/* Legal Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-700 mb-2 text-sm">
            <i className="fas fa-gavel mr-2"></i>
            Legal Notice
          </h4>
          <p className="text-xs text-gray-600">
            By signing this document electronically, you agree that your electronic signature is the legal 
            equivalent of your manual signature. You consent to be legally bound by the agreement's terms 
            and conditions. This electronic signature will be stored securely and can be used as evidence 
            in legal proceedings if necessary.
          </p>
        </div>

        {/* Timestamp */}
        <div className="bg-blue-50 rounded-lg p-3 mb-6">
          <p className="text-sm text-blue-800">
            <i className="fas fa-clock mr-2"></i>
            Signing Date & Time: {new Date().toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:bg-gray-100"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Terms
          </button>
          <button
            type="submit"
            disabled={loading || !hasSignature || !agreedToTerms}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-green-300"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-check-circle mr-2"></i>
                Complete Renewal
              </>
            )}
          </button>
        </div>
      </form>

      {/* Security Notice */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-start text-xs text-gray-500">
          <i className="fas fa-shield-alt text-green-600 mr-2 mt-0.5"></i>
          <p>
            Your signature and personal information are encrypted and stored securely. 
            We use industry-standard security measures to protect your data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DigitalSignature;
