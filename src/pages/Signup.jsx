import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [step, setStep] = useState(1); // 1: role selection, 2: registration form
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    idNumber: '',
    password: '',
    confirmPassword: '',
    userType: '',
    // Agent specific
    agencyName: '',
    licenseNumber: '',
    yearsOfExperience: '',
    agencyAddress: '',
    specialization: [],
    // Landlord specific
    businessRegistrationNumber: '',
    // Vendor specific
    companyName: '',
    serviceType: [],
    businessLicense: '',
    // Tenant specific
    occupation: '',
    emergencyContact: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const userTypes = [
    { value: 'tenant', label: 'Tenant', icon: '🏠', description: 'Looking for a place to rent' },
    { value: 'landlord', label: 'Landlord', icon: '🏢', description: 'Property owner managing rentals' },
    { value: 'agent', label: 'Agent', icon: '💼', description: 'Real estate professional' },
    { value: 'manager', label: 'Property Manager', icon: '📋', description: 'Managing properties for owners' },
    { value: 'vendor', label: 'Vendor', icon: '🔧', description: 'Service provider for properties' }
  ];

  const selectUserType = (type) => {
    setFormData(prev => ({ ...prev, userType: type }));
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.idNumber) newErrors.idNumber = 'ID number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role-specific validation
    if (formData.userType === 'agent') {
      if (!formData.agencyName) newErrors.agencyName = 'Agency name is required';
      if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
      if (formData.specialization.length === 0) newErrors.specialization = 'Select at least one specialization';
    } else if (formData.userType === 'vendor') {
      if (!formData.companyName) newErrors.companyName = 'Company name is required';
      if (formData.serviceType.length === 0) newErrors.serviceType = 'Select at least one service type';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: formData.userType,
        ...formData
      });
      navigate(`/${formData.userType}-dashboard`);
    } catch (error) {
      setErrors({ submit: error.message || 'Signup failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const toggleArrayValue = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-12">
            <Link to="/" className="inline-flex items-center gap-3 text-2xl font-semibold mb-4">
              <img src="/images/logo.png" alt="NyumbaSync" className="h-12 w-12 rounded-full bg-white/10 p-1" />
              NyumbaSync
            </Link>
            <h1 className="text-4xl font-bold mt-4">Join NyumbaSync</h1>
            <p className="text-white/70 mt-2">Select your role to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => selectUserType(type.value)}
                className="group relative rounded-2xl border border-white/10 bg-slate-900/40 p-8 text-left transition hover:-translate-y-2 hover:border-indigo-400/60 hover:bg-slate-900/70"
              >
                <div className="text-5xl mb-4">{type.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{type.label}</h3>
                <p className="text-sm text-white/70">{type.description}</p>
                <div className="mt-4 text-indigo-400 text-sm font-medium">
                  Get started →
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-white/60">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <button
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4"
          >
            ← Back to role selection
          </button>
          <h2 className="text-3xl font-bold">
            {userTypes.find(t => t.value === formData.userType)?.label} Registration
          </h2>
          <p className="text-white/70 mt-2">Complete your profile to get started</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
                    placeholder="Enter first name"
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
                    placeholder="Enter last name"
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
                  placeholder="your@email.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
                    placeholder="+254 700 123456"
                  />
                  {errors.phoneNumber && <p className="mt-1 text-sm text-red-400">{errors.phoneNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    ID Number *
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
                    placeholder="National ID"
                  />
                  {errors.idNumber && <p className="mt-1 text-sm text-red-400">{errors.idNumber}</p>}
                </div>
              </div>
            </div>

            {/* Role-specific fields */}
            {formData.userType === 'agent' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                  Professional Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Agency Name *
                    </label>
                    <input
                      type="text"
                      name="agencyName"
                      value={formData.agencyName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
                      placeholder="Your agency name"
                    />
                    {errors.agencyName && <p className="mt-1 text-sm text-red-400">{errors.agencyName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      License Number *
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
                      placeholder="License number"
                    />
                    {errors.licenseNumber && <p className="mt-1 text-sm text-red-400">{errors.licenseNumber}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Specialization *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Residential', 'Commercial', 'Industrial', 'Land', 'Property Management'].map((spec) => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleArrayValue('specialization', spec)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          formData.specialization.includes(spec)
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-800/50 text-white/70 hover:bg-slate-800'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                  {errors.specialization && <p className="mt-1 text-sm text-red-400">{errors.specialization}</p>}
                </div>
              </div>
            )}

            {formData.userType === 'landlord' && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Business Registration Number (Optional)
                </label>
                <input
                  type="text"
                  name="businessRegistrationNumber"
                  value={formData.businessRegistrationNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
                  placeholder="Business registration number"
                />
              </div>
            )}

            {formData.userType === 'vendor' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                  Business Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
                    placeholder="Your company name"
                  />
                  {errors.companyName && <p className="mt-1 text-sm text-red-400">{errors.companyName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Service Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Plumbing', 'Electrical', 'Cleaning', 'Painting', 'Carpentry', 'HVAC'].map((service) => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => toggleArrayValue('serviceType', service)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          formData.serviceType.includes(service)
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-800/50 text-white/70 hover:bg-slate-800'
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                  {errors.serviceType && <p className="mt-1 text-sm text-red-400">{errors.serviceType}</p>}
                </div>
              </div>
            )}

            {formData.userType === 'tenant' && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Occupation (Optional)
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
                  placeholder="Your occupation"
                />
              </div>
            )}

            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                Security
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
                    placeholder="Create password"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/60">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;