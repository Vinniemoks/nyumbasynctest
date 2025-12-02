import React, { useState } from 'react';
import apiService from '../services/api';
import BiometricAuth from '../components/BiometricAuth';

function Login({ onLogin }) {
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showBiometric, setShowBiometric] = useState(true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await apiService.login(formData);
            onLogin(response.user);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleBiometricSuccess = (data) => {
        onLogin(data.user);
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h1>NyumbaSync</h1>
                    <p>Property Management System</p>
                </div>

                {/* Biometric Auth Section */}
                {showBiometric && formData.identifier && (
                    <BiometricAuth
                        onSuccess={handleBiometricSuccess}
                        identifier={formData.identifier}
                    />
                )}

                <div className="divider">
                    <span>or login with password</span>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="error-message">
                            <span>⚠️</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="identifier">Email or Phone</label>
                        <input
                            type="text"
                            id="identifier"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            placeholder="Enter email or phone number"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>

                    <div className="login-footer">
                        <a href="#" className="forgot-password">Forgot password?</a>
                    </div>
                </form>

                <div className="app-info">
                    <p>Version {window.electronAPI.versions.electron}</p>
                    <p>Running on {window.electronAPI.platform}</p>
                </div>
            </div>
        </div>
    );
}

export default Login;
