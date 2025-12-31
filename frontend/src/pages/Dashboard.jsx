import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsAPI } from '../api/api';
import Navbar from '../components/Navbar';

const Dashboard = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await groupsAPI.getMyGroups();
            setGroups(response.data);
        } catch (err) {
            console.error('Failed to fetch groups:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        setError('');
        setModalLoading(true);

        try {
            const response = await groupsAPI.create(groupName);
            setGroups([response.data, ...groups]);
            setShowCreateModal(false);
            setGroupName('');
            setSuccess(`Group created! Invite code: ${response.data.inviteCode}`);
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create group');
        } finally {
            setModalLoading(false);
        }
    };

    const handleJoinGroup = async (e) => {
        e.preventDefault();
        setError('');
        setModalLoading(true);

        try {
            const response = await groupsAPI.join(inviteCode);
            setGroups([response.data, ...groups]);
            setShowJoinModal(false);
            setInviteCode('');
            setSuccess(`Joined ${response.data.name}!`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join group');
        } finally {
            setModalLoading(false);
        }
    };

    const copyInviteCode = (code) => {
        navigator.clipboard.writeText(code);
    };

    return (
        <>
            <Navbar />
            <div className="page">
                <div className="container">
                    {success && <div className="alert alert-success">{success}</div>}

                    <div className="dashboard-header">
                        <div>
                            <h1>Your Groups</h1>
                            <p className="text-muted mt-1">Manage your anonymous groups</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowJoinModal(true)}
                            >
                                Join Group
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowCreateModal(true)}
                            >
                                Create Group
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="empty-state">
                            <div className="spinner" style={{ width: 40, height: 40 }}></div>
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">👥</div>
                            <h3 className="empty-state-title">No groups yet</h3>
                            <p className="empty-state-text">
                                Create a new group or join one with an invite code
                            </p>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowCreateModal(true)}
                            >
                                Create Your First Group
                            </button>
                        </div>
                    ) : (
                        <div className="groups-grid">
                            {groups.map((group) => (
                                <div
                                    key={group._id}
                                    className="card group-card"
                                    onClick={() => navigate(`/group/${group._id}`)}
                                >
                                    <div className="group-card-content">
                                        <h3 className="card-title">{group.name}</h3>
                                        <div className="group-meta">
                                            <span>👥 {group.memberCount} members</span>
                                        </div>
                                        <div
                                            className="invite-code"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                copyInviteCode(group.inviteCode);
                                            }}
                                            title="Click to copy"
                                        >
                                            📋 {group.inviteCode}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Group Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create New Group</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowCreateModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCreateGroup}>
                            {error && <div className="alert alert-error">{error}</div>}
                            <div className="input-group">
                                <label className="input-label">Group Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Enter group name"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    required
                                    maxLength={50}
                                    disabled={modalLoading}
                                    autoFocus
                                />
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCreateModal(false)}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={modalLoading}
                                    style={{ flex: 1 }}
                                >
                                    {modalLoading ? <span className="spinner"></span> : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Join Group Modal */}
            {showJoinModal && (
                <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Join a Group</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowJoinModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleJoinGroup}>
                            {error && <div className="alert alert-error">{error}</div>}
                            <div className="input-group">
                                <label className="input-label">Invite Code</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Enter invite code"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    required
                                    disabled={modalLoading}
                                    autoFocus
                                    style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                                />
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowJoinModal(false)}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={modalLoading}
                                    style={{ flex: 1 }}
                                >
                                    {modalLoading ? <span className="spinner"></span> : 'Join'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Dashboard;
