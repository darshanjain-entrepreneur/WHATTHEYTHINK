import { useState, useEffect } from 'react';
import { messagesAPI } from '../api/api';
import Navbar from '../components/Navbar';

const Inbox = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await messagesAPI.getInbox();
            setMessages(response.data);
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    const formatFullDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const copyInviteCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <>
            <Navbar />
            <div className="page">
                <div className="container" style={{ maxWidth: '720px' }}>
                    <div className="dashboard-header">
                        <div>
                            <h1>Inbox</h1>
                            <p className="text-muted mt-1">Anonymous messages people sent you</p>
                        </div>

                    </div>

                    {loading ? (
                        <div className="empty-state">
                            <div className="spinner" style={{ width: 40, height: 40 }}></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">💬</div>
                            <h3 className="empty-state-title">No messages yet</h3>
                            <p className="empty-state-text">
                                When someone sends you an anonymous message, it will appear here
                            </p>
                        </div>
                    ) : (
                        <div>
                            {messages.map((message) => (
                                <div key={message._id} className="card message-card">
                                    <p className="message-content">{message.messageText}</p>
                                    <div className="message-meta">
                                        <span className="message-group">
                                            👥 {message.groupName}
                                        </span>
                                        {message.groupInviteCode && (
                                            <span
                                                className="invite-code-badge"
                                                onClick={() => copyInviteCode(message.groupInviteCode)}
                                                title="Click to copy invite code"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {copiedCode === message.groupInviteCode ? '✓ Copied!' : `📋 ${message.groupInviteCode}`}
                                            </span>
                                        )}
                                        <span
                                            className="message-time"
                                            title={formatFullDate(message.createdAt)}
                                        >
                                            🕐 {formatDate(message.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Inbox;
