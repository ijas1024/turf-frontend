import React, { useEffect, useState } from "react";
import { Container, Card, Spinner, Button } from "react-bootstrap";
import "./Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const role = localStorage.getItem("role");
  const bgColor = role === "owner" ? "#E3F2FD" : "#E8F5E9";
  const accent = role === "owner" ? "#0288d1" : "#2e7d32";

  // 🔹 Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/notifications/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Auto-refresh every 2 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 2000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Mark all as read
  const markAllRead = async () => {
    try {
      setMarking(true);
      const res = await fetch("http://127.0.0.1:8000/api/notifications/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true, justRead: true }))
        );
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
    } finally {
      setMarking(false);
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant={role === "owner" ? "info" : "success"} />
      </div>
    );

  return (
    <Container
      className="my-5 p-4 rounded-4 shadow-sm"
      style={{
        backgroundColor: bgColor,
        minHeight: "90vh",
        transition: "all 0.3s ease",
      }}
    >
      {/* Gradient header */}
      <div
        style={{
          background: `linear-gradient(90deg, ${accent}, ${
            role === "owner" ? "#5eb8ff" : "#66bb6a"
          })`,
          color: "#fff",
          borderRadius: "10px",
          padding: "1rem 1.5rem",
          textAlign: "center",
          marginBottom: "1.5rem",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h3 className="fw-bold mb-0">🔔 Notifications</h3>
      </div>

      <div className="text-end mb-3">
        <Button
          variant={role === "owner" ? "info" : "success"}
          onClick={markAllRead}
          disabled={marking}
          className="rounded-pill px-4 fw-semibold shadow-sm"
        >
          {marking ? "Marking..." : "Mark All as Read"}
        </Button>
      </div>

      {notifications.length === 0 ? (
        <p className="text-center text-muted">No notifications found.</p>
      ) : (
        notifications.map((n) => (
          <Card
            key={n.id}
            className={`mb-3 shadow-sm notification-card ${
              n.is_read ? "read" : "unread"
            } ${n.justRead ? "fade-out" : ""}`}
          >
            <Card.Body>
              <Card.Text className="mb-1 fs-6 fw-semibold">{n.message}</Card.Text>
              <small className="text-muted">
                {new Date(n.created_at).toLocaleString()}
              </small>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
}

export default Notifications;
