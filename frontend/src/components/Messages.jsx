import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/global.css';
import { getSocket, emitDelivered, emitRead, onDelivered, onRead } from '../utils/socket';
import { t } from '../utils/i18n';
import EmojiPicker from './EmojiPicker';

const Messages = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTo = searchParams.get('to');

  const [conversations, setConversations] = useState([]); // matches with start===true
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [activeTo, setActiveTo] = useState(preselectedTo || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // fetch matches then filter by start field
    const fetchMatches = async () => {
      setConversationsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/matches/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        const started = Array.isArray(data) ? data.filter(m => m.start) : [];
        // enrich started matches with presigned photo URLs when available
        const enrichPromises = started.map(async (m) => {
          if (m.user_photo) return m;
          if (m.user_photo_key) {
            try {
              const r = await fetch(`/api/users/${m.id}/image`, { headers: { Authorization: `Bearer ${token}` } });
              if (r.ok) {
                const json = await r.json();
                if (json && json.url) m.user_photo = json.url;
              }
            } catch (e) {
              // ignore
            }
          }
          return m;
        });
        const startedWithPhotos = await Promise.all(enrichPromises);
        setConversations(startedWithPhotos);
        if (!activeTo && startedWithPhotos.length > 0) setActiveTo(startedWithPhotos[0].id);
      } catch (e) {
        console.error('Error loading conversations', e);
      } finally {
        setConversationsLoading(false);
      }
    };

    fetchMatches();
  }, [isAuthenticated, loading, user, navigate]);

  // When conversations load or activeTo is set (e.g. via ?to=...), open that conversation
  useEffect(() => {
    if (!activeTo) return;
    // if messages already loaded for this conversation, do nothing
    if (messages && messages.length > 0) return;
    const match = conversations.find(c => String(c.id) === String(activeTo));
    if (match) {
      openConversation(match);
    } else if (conversations.length === 0) {
      // conversations not loaded yet; openConversation will be triggered once conversations update
    }
  }, [activeTo, conversations]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    socketRef.current = socket;

    if (socket) {
      socket.emit('identify', user.id);

      socket.on('message', (payload) => {
        setMessages(prev => {
          const next = [...prev, payload];
          next.sort((a, b) => (Number(a.sequence || 0) - Number(b.sequence || 0)) || (new Date(a.sentAt || 0) - new Date(b.sentAt || 0)));
          return next;
        });

        // auto-acknowledge delivery for incoming messages (if they have an id)
        try {
          if (payload && payload.id && String(payload.to) === String(user.id)) {
            emitDelivered(payload.id);
          }
        } catch (e) {
          // ignore
        }
      });

      // register receipt listeners
      onDelivered((data) => {
        if (!data || !data.messageId) return;
        setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, status: 'delivered', deliveredAt: data.delivered_at || new Date().toISOString() } : m));
      });

      onRead((data) => {
        if (!data || !data.messageId) return;
        setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, status: 'read', readAt: data.read_at || new Date().toISOString() } : m));
      });
    }
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = (match) => {
    setActiveTo(match.id);
    setMessages([]);
    // load historical messages via API
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/messages/conversation?senderID=${encodeURIComponent(user.id)}&receiverID=${encodeURIComponent(match.id)}&count=100&page=0`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        const mapped = Array.isArray(data) ? data.map(m => ({
          from: m.sender_id || m.senderID,
          to: m.reciever_id || m.receiverID,
          text: m.body || m.text,
          sentAt: m.timestamp || m.sentAt || m.sent_at,
          sequence: m.sequence,
          id: m.id
        })) : [];
        mapped.sort((a, b) => (Number(a.sequence || 0) - Number(b.sequence || 0)) || (new Date(a.sentAt || 0) - new Date(b.sentAt || 0)));
        setMessages(mapped);
      } catch (e) {
        console.error('Error loading conversation', e);
      }
    })();
  };

  const getImgUrl = (m) => {
    return m.user_photo || m.avatar_url || m.photo || m.profile_image || m.image || m.avatar || null;
  };

  const getInitials = (name) => {
    const safe = (name || 'U').toString().trim();
    return safe.split(/\s+/).map(s => s[0]).slice(0,2).join('').toUpperCase();
  };

  const formatToPST = (dateInput) => {
    try {
      if (!dateInput) return new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
      // Normalize various DB timestamp formats (space-separated or plain ISO) to ISO UTC
      let input = dateInput;
      if (typeof input === 'string') {
        input = input.trim();
        // format: YYYY-MM-DD HH:mm:ss(.fraction) -> convert to YYYY-MM-DDTHH:mm:ss(.fraction)Z
        const spaceIso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
        const isoNoTZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
        if (spaceIso.test(input)) {
          input = input.replace(' ', 'T') + 'Z';
        } else if (isoNoTZ.test(input)) {
          input = input + 'Z';
        }
      }
      const d = (typeof input === 'number') ? new Date(input) : new Date(input);
      return d.toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (e) {
      return new Date(dateInput || Date.now()).toLocaleString();
    }
  };

  const sendMessage = () => {
    if (!text || !activeTo || !socketRef.current) return;
    const body = text;
    // first insert into DB via API
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ senderID: user.id, receiverID: activeTo, body })
        });
        if (!res.ok) {
          console.error('Failed to save message to server');
          return;
        }
        const inserted = await res.json();
        const payload = {
          to: inserted.reciever_id || inserted.receiverID || activeTo,
          from: inserted.sender_id || inserted.senderID || user.id,
          text: inserted.body || body,
          sentAt: inserted.timestamp || new Date().toISOString(),
          sequence: inserted.sequence,
          id: inserted.id,
          status: inserted.status || 'sent'
        };
        // emit for realtime delivery
        socketRef.current.emit('message', payload);
        // append locally with optimistic status
        setMessages(prev => [...prev, payload]);
        setText('');
      } catch (e) {
        console.error('Error sending message', e);
      }
    })();
  };

  return (
    <div className="messages-page">
      <aside className="conversations-list">
        <h3>Conversations</h3>
        {conversationsLoading ? (
          <div>Loading conversations...</div>
        ) : (
          conversations.length === 0 && <div>No conversations yet.</div>
        )}
        {conversations.map(m => {
          const imgUrl = getImgUrl(m);
          const initials = getInitials(m.name || m.email);
          return (
            <div key={m.id} className={`conv-item ${String(activeTo) === String(m.id) ? 'active' : ''}`} onClick={() => openConversation(m)}>
              <div className="conv-left">
                <div className="conv-avatar">
                  {imgUrl ? <img src={imgUrl} alt={(m.name || m.email || 'User') + ' avatar'} /> : <div className="avatar-initials">{initials}</div>}
                </div>
                <div className="conv-main">
                  <div className="conv-name">{m.name || m.email || 'User'}</div>
                </div>
              </div>
            </div>
          );
        })}
      </aside>

      <section className="chat-area">
        {!activeTo ? (
          <div className="chat-empty">Select a conversation</div>
        ) : (
          <div className="chat-box">
            <div className="messages-list">
                {messages.map((msg) => {
                  const senderName = String(msg.from) === String(user.id) ? 'You' : (conversations.find(c => String(c.id) === String(msg.from))?.name || 'User');
                  return (
                    <div key={msg.id || `${msg.sequence}_${msg.sentAt}`} className={`msg ${String(msg.from) === String(user.id) ? 'sent' : 'received'}`}>
                      <div className="msg-sender">{senderName}</div>
                      <div className="msg-text">{msg.text}</div>
                      <div className="msg-meta">
                        {formatToPST(msg.sentAt)}
                        {String(msg.from) === String(user.id) && (
                          <span className="msg-status">{t((msg.status || 'sent').toLowerCase())}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              <div ref={bottomRef} />
            </div>

                  <div className="chat-input">
                    <textarea
                      ref={inputRef}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={t('typeMessage')}
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <EmojiPicker onSelect={(emoji) => {
                        try {
                          const el = inputRef.current;
                          if (!el) return setText(prev => prev + emoji);
                          const start = el.selectionStart || 0;
                          const end = el.selectionEnd || 0;
                          const next = text.slice(0, start) + emoji + text.slice(end);
                          setText(next);
                          // restore caret after emoji insertion
                          requestAnimationFrame(() => {
                            el.selectionStart = el.selectionEnd = start + emoji.length;
                            el.focus();
                          });
                        } catch (e) {
                          setText(prev => prev + emoji);
                        }
                      }} />
                      <button className="btn-primary" onClick={sendMessage}>Send</button>
                    </div>
                  </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Messages;
