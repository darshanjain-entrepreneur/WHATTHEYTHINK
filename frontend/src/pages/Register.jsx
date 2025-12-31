import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        // Username validation
        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return false;
        }
        if (username.length > 15) {
            setError('Username cannot exceed 15 characters');
            return false;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setError('Username can only contain letters, numbers, and underscores');
            return false;
        }

        // Password validation
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (password.length > 20) {
            setError('Password cannot exceed 20 characters');
            return false;
        }

        // Confirm password
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await register(username, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>WHATTHEYTHINK</h1>
                    <p>Create your anonymous account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-error">{error}</div>}

                    <div className="input-group">
                        <label className="input-label">
                            Username
                            <span className="input-hint">({username.length}/15 characters)</span>
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Choose a username (3-15 chars)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            required
                            minLength={3}
                            maxLength={15}
                            disabled={loading}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            Password
                            <span className="input-hint">({password.length}/20 characters)</span>
                        </label>
                        <input
                            type="password"
                            className="input"
                            placeholder="Create a password (6-20 chars)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            maxLength={20}
                            disabled={loading}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Confirm Password</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full btn-lg"
                        disabled={loading}
                    >
                        {loading ? <span className="spinner"></span> : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
