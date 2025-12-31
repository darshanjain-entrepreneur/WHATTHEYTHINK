import { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/api';

const Navbar = () => {
    const { user, logout, setUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handlePhotoClick = () => {
        setShowMenu(!showMenu);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
        setShowMenu(false);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('photo', file);
            const response = await authAPI.uploadPhoto(formData);

            // Update user in context
            if (setUser && user) {
                const updatedUser = { ...user, profilePhoto: response.data.profilePhoto };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const getAvatarContent = () => {
        if (user?.profilePhoto) {
            return (
                <img
                    src={`http://localhost:5000${user.profilePhoto}`}
                    alt={user.username}
                    className="navbar-avatar-img"
                />
            );
        }
        return user?.username?.charAt(0).toUpperCase() || '?';
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/" className="navbar-brand">
                    WHATTHEYTHINK
                </Link>

                {user && (
                    <div className="navbar-nav">
                        <Link
                            to="/"
                            className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
                        >
                            Groups
                        </Link>
                        <Link
                            to="/inbox"
                            className={`navbar-link ${location.pathname === '/inbox' ? 'active' : ''}`}
                        >
                            Inbox
                        </Link>

                        <div className="navbar-profile">
                            <div
                                className={`navbar-avatar ${uploading ? 'uploading' : ''}`}
                                onClick={handlePhotoClick}
                                title={user.username}
                            >
                                {uploading ? (
                                    <span className="spinner" style={{ width: 16, height: 16 }}></span>
                                ) : (
                                    getAvatarContent()
                                )}
                            </div>

                            {showMenu && (
                                <div className="navbar-dropdown">
                                    <div className="navbar-dropdown-header">
                                        <span className="navbar-dropdown-username">{user.username}</span>
                                    </div>
                                    <button onClick={handleUploadClick} className="navbar-dropdown-item">
                                        📷 {user.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                                    </button>
                                    <button onClick={handleLogout} className="navbar-dropdown-item navbar-dropdown-logout">
                                        🚪 Logout
                                    </button>
                                </div>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Click outside to close menu */}
            {showMenu && (
                <div
                    className="navbar-overlay"
                    onClick={() => setShowMenu(false)}
                />
            )}
        </nav>
    );
};

export default Navbar;
