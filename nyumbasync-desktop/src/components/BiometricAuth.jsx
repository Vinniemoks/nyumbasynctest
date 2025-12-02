import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BiometricAuth.css';

const BiometricAuth = ({ onSuccess, identifier }) => {
    const [supported, setSupported] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [registered, setRegistered] = useState(false);

    useEffect(() => {
        // Check if WebAuthn is supported
        if (window.PublicKeyCredential) {
            setSupported(true);
            checkRegistrationStatus();
        }
    }, []);

    const checkRegistrationStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await axios.get('/api/v1/biometric/credentials', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRegistered(response.data.enabled);
            }
        } catch (err) {
            console.error('Failed to check biometric status:', err);
        }
    };

    // Convert base64url to ArrayBuffer
    const base64urlToBuffer = (base64url) => {
        const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    };

    // Convert ArrayBuffer to base64url
    const bufferToBase64url = (buffer) => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        bytes.forEach(b => binary += String.fromCharCode(b));
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    };

    const registerBiometric = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');

            // Get registration challenge
            const challengeResponse = await axios.post(
                '/api/v1/biometric/register/challenge',
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const options = challengeResponse.data;

            // Convert challenge to ArrayBuffer
            options.challenge = base64urlToBuffer(options.challenge);
            options.user.id = base64urlToBuffer(options.user.id);

            // Call WebAuthn API
            const credential = await navigator.credentials.create({
                publicKey: options
            });

            // Prepare credential for server
            const credentialForServer = {
                id: credential.id,
                rawId: bufferToBase64url(credential.rawId),
                response: {
                    clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
                    attestationObject: bufferToBase64url(credential.response.attestationObject)
                },
                type: credential.type
            };

            // Verify with server
            await axios.post(
                '/api/v1/biometric/register/verify',
                { credential: credentialForServer },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setRegistered(true);
            alert('Biometric authentication registered successfully!');
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.error || 'Failed to register biometric authentication');
        } finally {
            setLoading(false);
        }
    };

    const loginWithBiometric = async () => {
        setLoading(true);
        setError('');

        try {
            // Get login challenge
            const challengeResponse = await axios.post('/api/v1/biometric/login/challenge', {
                identifier
            });

            const options = challengeResponse.data;

            // Convert challenge and credential IDs
            options.challenge = base64urlToBuffer(options.challenge);
            options.allowCredentials = options.allowCredentials.map(cred => ({
                ...cred,
                id: base64urlToBuffer(cred.id)
            }));

            // Call WebAuthn API
            const assertion = await navigator.credentials.get({
                publicKey: options
            });

            // Prepare assertion for server
            const assertionForServer = {
                id: assertion.id,
                rawId: bufferToBase64url(assertion.rawId),
                response: {
                    clientDataJSON: bufferToBase64url(assertion.response.clientDataJSON),
                    authenticatorData: bufferToBase64url(assertion.response.authenticatorData),
                    signature: bufferToBase64url(assertion.response.signature),
                    userHandle: assertion.response.userHandle ? bufferToBase64url(assertion.response.userHandle) : null
                },
                type: assertion.type
            };

            // Verify with server
            const response = await axios.post('/api/v1/biometric/login/verify', {
                credential: assertionForServer,
                identifier
            });

            // Store token and call success callback
            localStorage.setItem('token', response.data.token);
            onSuccess(response.data);

        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.error || 'Biometric authentication failed');
        } finally {
            setLoading(false);
        }
    };

    if (!supported) {
        return (
            <div className="biometric-auth">
                <p className="error-message">
                    ❌ Your browser doesn't support biometric authentication
                </p>
            </div>
        );
    }

    return (
        <div className="biometric-auth">
            {error && (
                <div className="error-message">
                    <span>⚠️</span>
                    <p>{error}</p>
                </div>
            )}

            {!registered && localStorage.getItem('token') && (
                <div className="register-section">
                    <h3>Enable Biometric Login</h3>
                    <p>Register your fingerprint or biometric device for quick login</p>
                    <button
                        onClick={registerBiometric}
                        disabled={loading}
                        className="biometric-btn register"
                    >
                        {loading ? '🔄 Registering...' : '👆 Register Fingerprint'}
                    </button>
                </div>
            )}

            {registered && (
                <div className="login-section">
                    <button
                        onClick={loginWithBiometric}
                        disabled={loading}
                        className="biometric-btn login"
                    >
                        {loading ? '🔄 Authenticating...' : '👆 Login with Fingerprint'}
                    </button>
                </div>
            )}

            <div className="biometric-info">
                <p>✓ Supported devices: USB fingerprint scanners, Touch ID, Face ID, Windows Hello</p>
                <p>✓ Your biometric data never leaves your device</p>
            </div>
        </div>
    );
};

export default BiometricAuth;
