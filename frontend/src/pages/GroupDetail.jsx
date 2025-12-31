import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupsAPI, messagesAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const GroupDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchGroup();
    }, [id]);

    const fetchGroup = async () => {
        try {
            const response = await groupsAPI.getGroup(id);
            setGroup(response.data);
        } catch (err) {
            console.error('Failed to fetch group:', err);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const openMessageModal = (member) => {
        if (member._id === user._id) return; // Can't message yourself
        setSelectedMember(member);
        setMessageText('');
        setError('');
        setShowMessageModal(true);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!selectedMember || !messageText.trim()) return;

        setSending(true);
        setError('');

        try {
            await messagesAPI.send(selectedMember._id, group._id, messageText);
            setShowMessageModal(false);
            setMessageText('');
            setSelectedMember(null);
            setSuccess('Anonymous message sent!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const copyInviteCode = () => {
        navigator.clipboard.writeText(group.inviteCode);
        setSuccess('Invite code copied!');
        setTimeout(() => setSuccess(''), 2000);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="page">
                    <div className="container">
                        <div className="empty-state">
                            <div className="spinner" style={{ width: 40, height: 40 }}></div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="page">
                <div className="container">
                    <div
                        className="back-btn"
                        onClick={() => navigate('/')}
                    >
                        ← Back to Groups
                    </div>

                    {success && <div className="alert alert-success">{success}</div>}

                    <div className="group-detail-header">
                        <div className="group-detail-info">
                            <h1>{group.name}</h1>
                            <div
                                className="invite-code mt-2"
                                onClick={copyInviteCode}
                                style={{ cursor: 'pointer' }}
                                title="Click to copy"
                            >
                                📋 Invite Code: {group.inviteCode}
                            </div>
                        </div>
                        <div className="text-muted">
                            {group.members.length} members
                        </div>
                    </div>

                    <div className="section-header">
                        <h2 className="section-title">Members</h2>
                        <p className="text-muted">Tap on a member to send an anonymous message</p>
                    </div>

                    <div className="members-list">
                        {group.members.map((member) => (
                            <div
                                key={member._id}
                                className="member-item"
                                onClick={() => openMessageModal(member)}
                                style={{ cursor: member._id === user._id ? 'default' : 'pointer' }}
                            >
                                <div className="member-info">
                                    <div className="member-avatar">
                                        {member.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="member-name">{member.username}</span>
                                </div>
                                {member._id === user._id ? (
                                    <span className="member-badge">You</span>
                                ) : (
                                    <button className="btn btn-ghost btn-sm">
                                        Send Message
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Send Message Modal */}
            {showMessageModal && selectedMember && (
                <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                Send Anonymous Message
                            </h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowMessageModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="mb-3">
                            <p className="text-muted">
                                Sending to <strong>{selectedMember.username}</strong>
                            </p>
                            <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                This message is completely anonymous. The recipient will only see the message content and group name.
                            </p>
                        </div>

                        <form onSubmit={handleSendMessage}>
                            {error && <div className="alert alert-error">{error}</div>}

                            <div className="input-group">
                                <label className="input-label">Your Message</label>
                                <textarea
                                    className="input"
                                    placeholder="What do you want to say?"
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    required
                                    maxLength={1000}
                                    disabled={sending}
                                    autoFocus
                                    style={{ minHeight: '120px' }}
                                />
                                <small className="text-muted" style={{ marginTop: '0.5rem', display: 'block' }}>
                                    {messageText.length}/1000 characters
                                </small>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowMessageModal(false)}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={sending || !messageText.trim()}
                                    style={{ flex: 1 }}
                                >
                                    {sending ? <span className="spinner"></span> : 'Send Anonymously'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default GroupDetail;
