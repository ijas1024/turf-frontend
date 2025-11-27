import React, { useState, useEffect, useRef } from "react";
import "./OwnerChat.css";

const API_BASE = "https://spoto-turf-booker-backend.onrender.com/api";

// Helper to get initials for avatar
const initials = (name = "") =>
  (name || "")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function OwnerChatPage() {
  // --- state & refs ---
  const [users, setUsers] = useState([]); // conversation list (unique turf-user combos)
  const [selectedTurf, setSelectedTurf] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({}); // { "turfId-userId": number }
  const [isTyping, setIsTyping] = useState(false);

  const chatWindowRef = useRef(null); // scroll container for messages
  const typingTimerRef = useRef(null);
  const usersPollRef = useRef(null);
  const messagesPollRef = useRef(null);
  const messagesEndRef = useRef(null);


  const token =
    localStorage.getItem("access") || localStorage.getItem("access_token");
  const username = localStorage.getItem("username") || "Owner";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // helper key
  const convKey = (turfId, userId) => `${turfId}-${userId}`;

  // lastSeen stored in localStorage per conversation key (ISO string)
  const getLastSeen = (key) => localStorage.getItem(`lastSeen:${key}`) || null;
  const setLastSeen = (key, iso) => localStorage.setItem(`lastSeen:${key}`, iso);

  // ---------- Fetch functions ----------

  // fetch conversation list (owner/chats) and return unique list
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/owner/chats/`, { headers });
      if (!res.ok) return [];
      const data = await res.json();

      // Unique (turf,user) by key turfId-userId
      const uniqueUsers = Array.from(
        new Map(data.map((u) => [`${u.turf_id}-${u.user_id}`, u])).values()
      );

      setUsers(uniqueUsers);
      return uniqueUsers;
    } catch (e) {
      console.error("fetchUsers error", e);
      return [];
    }
  };

  // fetch messages for selected conversation (turfId, userId)
  const fetchMessages = async (turfId, userId) => {
    try {
      const res = await fetch(`${API_BASE}/turfs/${turfId}/chat/`, { headers });
      if (!res.ok) return;
      const data = await res.json();

      // filter messages relevant to this conversation
      const filtered = data.filter(
        (m) =>
          (m.sender === userId && m.receiver_name === username) ||
          (m.receiver === userId && m.sender_name === username) ||
          m.sender === userId
      );

      // sort ascending by created_at to maintain order
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setMessages(filtered);

      // scroll chat container only
      setTimeout(() => scrollToBottom(), 90);
    } catch (e) {
      console.error("fetchMessages error", e);
    }
  };

  // send message API
  const sendMessage = async () => {
    if (!text.trim() || !activeUser || !selectedTurf) return;
    try {
      const res = await fetch(`${API_BASE}/turfs/${selectedTurf}/chat/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: text,
          receiver_id: activeUser.user_id,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();

      // append to messages and scroll
      setMessages((prev) => [...prev, data]);
      setText("");
      setIsTyping(false);
      clearTimeout(typingTimerRef.current);

      // update lastSeen for this conversation to latest message (owner just sent)
      const key = convKey(selectedTurf, activeUser.user_id);
      setLastSeen(key, new Date().toISOString());
      // clear unread locally
      setUnreadCounts((prev) => {
        if (!prev[key]) return prev;
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });

      setTimeout(() => scrollToBottom(), 80);
    } catch (e) {
      console.error("sendMessage error", e);
    }
  };

  // scroll the chat window element only
  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTo({
        top: chatWindowRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // typing indicator (local)
  const handleTyping = (val) => {
    setText(val);
    if (!isTyping) setIsTyping(true);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1200);
  };

  // ---------- Unread counts logic ----------
  // For each conversation (turf,user) fetch chat and count messages from user after lastSeen
  const fetchUnreadCounts = async (convos = null) => {
    try {
      const convList = convos || users || [];
      if (!convList || convList.length === 0) {
        setUnreadCounts({});
        return;
      }

      const counts = {};
      await Promise.all(
        convList.map(async (u) => {
          try {
            const key = convKey(u.turf_id, u.user_id);
            const res = await fetch(`${API_BASE}/turfs/${u.turf_id}/chat/`, {
              headers,
            });
            if (!res.ok) return;
            const data = await res.json();

            // messages from this user
            const fromUserMsgs = data.filter((m) => m.sender === u.user_id);

            const lastSeenIso = getLastSeen(key);
            if (!lastSeenIso) {
              // if never seen, treat all from-user messages as unread
              counts[key] = fromUserMsgs.length;
            } else {
              const lastSeenDate = new Date(lastSeenIso);
              const unread = fromUserMsgs.filter(
                (m) => new Date(m.created_at) > lastSeenDate
              ).length;
              counts[key] = unread;
            }
          } catch (err) {
            console.error("fetchUnreadCounts error for", u, err);
          }
        })
      );

      // only keep entries where unread > 0 to keep object small
      const filteredCounts = Object.fromEntries(
        Object.entries(counts).filter(([k, v]) => v && v > 0)
      );
      setUnreadCounts(filteredCounts);
    } catch (err) {
      console.error("fetchUnreadCounts error", err);
    }
  };

  // ---------- Open conversation ----------------
  // When the owner clicks a conversation: load messages, set selected turf & active user,
  // set lastSeen to latest message (mark as read), and clear unread locally.
  const openConversation = async (u) => {
    setActiveUser(u);
    setSelectedTurf(u.turf_id);

    // fetch messages for this conversation
    await fetchMessages(u.turf_id, u.user_id);

    // determine last message timestamp for this convo and set lastSeen
    try {
      const res = await fetch(`${API_BASE}/turfs/${u.turf_id}/chat/`, { headers });
      if (res.ok) {
        const chatData = await res.json();
        const convoMsgs = chatData.filter(
          (m) =>
            (m.sender === u.user_id && m.receiver_name === username) ||
            (m.receiver === u.user_id && m.sender_name === username) ||
            m.sender === u.user_id
        );
        if (convoMsgs.length > 0) {
          convoMsgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          const last = convoMsgs[convoMsgs.length - 1];
          setLastSeen(convKey(u.turf_id, u.user_id), last.created_at);
        } else {
          // no messages => set lastSeen to now
          setLastSeen(convKey(u.turf_id, u.user_id), new Date().toISOString());
        }
      }
    } catch (err) {
      console.error("openConversation lastSeen fetch error", err);
    }

    // clear unread count locally for this conv
    setUnreadCounts((prev) => {
      const next = { ...prev };
      delete next[convKey(u.turf_id, u.user_id)];
      return next;
    });
  };

  // ---------- Polling & effects ----------

  // initial load + polling for users & unread counts
  useEffect(() => {
    let mounted = true;

    const doInitial = async () => {
      const convs = await fetchUsers();
      if (mounted) {
        // compute initial unread counts immediately for returned convs
        await fetchUnreadCounts(convs);
      }
    };

    doInitial();

    // set interval to update both user list and counts
    usersPollRef.current = setInterval(async () => {
      const convs = await fetchUsers();
      await fetchUnreadCounts(convs);
    }, 3000);

    return () => {
      mounted = false;
      if (usersPollRef.current) clearInterval(usersPollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // polling for messages for currently open conversation only
  useEffect(() => {
    if (!selectedTurf || !activeUser) return;

    // fetch immediately, then poll
    fetchMessages(selectedTurf, activeUser.user_id);

    messagesPollRef.current = setInterval(() => {
      fetchMessages(selectedTurf, activeUser.user_id);
    }, 3000);

    return () => {
      if (messagesPollRef.current) clearInterval(messagesPollRef.current);
    };
  }, [selectedTurf, activeUser]);

  // ---------- Small Avatar component ----------
  const Avatar = ({ name, bg = "#eef6ff", fg = "#007bff", size = 40 }) => (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
        color: fg,
        fontWeight: 800,
        fontSize: Math.round(size / 2.6),
        boxShadow:
          "inset 2px 2px 6px rgba(255,255,255,0.8), 6px 6px 12px rgba(0,0,0,0.04)",
      }}
    >
      {initials(name)}
    </div>
  );

  // ---------- JSX render ----------
  return (
    <div className="ocp-root">
      <aside className="ocp-sidebar">
        <div className="ocp-sidebar-top">
          <div className="ocp-logo">O</div>
          <div>
            <div className="ocp-owner-title">Owner Panel</div>
            <div className="ocp-owner-sub">Manage chats</div>
          </div>
          <div className="ocp-live-indicator">Live</div>
        </div>

        <div className="ocp-section-title">Conversations</div>

        {users.length === 0 ? (
          <div className="ocp-empty">No conversations</div>
        ) : (
          users.map((u) => {
            const key = convKey(u.turf_id, u.user_id);
            const isActive =
              activeUser?.user_id === u.user_id && selectedTurf === u.turf_id;
            const unread = unreadCounts[key] || 0;
            return (
              <div
                key={key}
                className={`ocp-convo ${isActive ? "active" : ""}`}
                onClick={() => openConversation(u)}
              >
                <div className="ocp-convo-left">
                  <Avatar name={u.username} size={44} />
                </div>

                <div className="ocp-convo-mid">
                  <div className="ocp-convo-name">{u.username}</div>
                  <div className="ocp-convo-sub">{u.turf_name}</div>
                </div>

                {unread > 0 && (
                  <div className="ocp-unread-badge">
                    {unread > 99 ? "99+" : unread}
                  </div>
                )}
              </div>
            );
          })
        )}
      </aside>

      <section className="ocp-chat-panel">
        <header className="ocp-chat-header">
          <div className="ocp-chat-header-left">
            {activeUser ? (
              <Avatar name={activeUser.username} size={46} />
            ) : (
              <div style={{ width: 46, height: 46 }} />
            )}
            <div className="ocp-chat-meta">
              <div className="ocp-chat-name">
                {activeUser ? activeUser.username : "Select a conversation"}
              </div>
              <div className="ocp-chat-sub">
                {activeUser ? activeUser.turf_name : "Owner chats"}
              </div>
            </div>
          </div>

          <div className="ocp-chat-header-right">
            <div className="ocp-active-dot" />
          </div>
        </header>

        {/* message container */}
        <div className="ocp-messages-wrap" ref={chatWindowRef}>
          {!activeUser ? (
            <div className="ocp-choose-message">Select a conversation to begin</div>
          ) : messages.length === 0 ? (
            <div className="ocp-no-messages">No messages yet. Say hi 👋</div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.sender_name === username;
              return (
                <div
                  key={msg.id || `${i}-${Math.random()}`}
                  className={`ocp-msg-item ${isMe ? "me" : "them"}`}
                >
                  {!isMe && (
                    <div className="ocp-msg-left">
                      <Avatar name={msg.sender_name} size={38} />
                      <div className="ocp-bubble them-bubble">
                        <div className="ocp-bubble-sender">{msg.sender_name}</div>
                        <div>{msg.message}</div>
                        <div className="ocp-bubble-time">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {isMe && (
                    <div className="ocp-msg-right" style={{ width: "100%", justifyContent: "flex-end" }}>
                      <div className="ocp-bubble me-bubble">
                        <div>{msg.message}</div>
                        <div className="ocp-bubble-time me-time">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* typing indicator */}
          {isTyping && activeUser && (
            <div className="ocp-typing-row">
              <div className="ocp-typing-bubble">
                <div className="ocp-typing-text">Typing</div>
                <div className="ocp-typing-dots">
                  <div className="ocp-dot" />
                  <div className="ocp-dot" />
                  <div className="ocp-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={(el) => (messagesEndRef.current = el)} />
        </div>

        {/* input area */}
        <div className="ocp-input-wrap">
          <div className="ocp-input-left">
            <Avatar name={username} size={40} />
          </div>

          <input
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={activeUser ? `Message ${activeUser.username}...` : "Select a conversation"}
            className="ocp-input"
            disabled={!activeUser}
          />

          <button
            onClick={sendMessage}
            disabled={!activeUser || !text.trim()}
            className="ocp-send-btn"
          >
            Send
          </button>
        </div>
      </section>
    </div>
  );
}
