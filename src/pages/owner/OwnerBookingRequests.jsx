import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, Spinner, Container, Alert, Badge } from "react-bootstrap";
import { refreshAccessToken } from "../../utils/auth";

function OwnerBookingRequests() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fadingBookings, setFadingBookings] = useState([]);
  const token = localStorage.getItem("access");

  const fetchBookings = async () => {
    try {
      let token = localStorage.getItem("access");
      if (!token) throw new Error("No token found");

      let res = await axios.get("https://spoto-turf-booker-backend.onrender.com/api/owner/bookings/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (!newToken) throw new Error("Session expired. Please log in again.");
        res = await axios.get("https://spoto-turf-booker-backend.onrender.com/api/owner/bookings/", {
          headers: { Authorization: `Bearer ${newToken}` },
        });
      }

      setBookings(res.data);
    } catch (err) {
      console.error("❌ Error fetching bookings:", err);
      setError("Failed to fetch booking requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const res = await axios.post(
        `https://spoto-turf-booker-backend.onrender.com/api/booking/${id}/action/`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const msg = res.data?.message || `Booking ${action}ed successfully!`;
      alert(msg);

      const fadeColor = action === "approve" ? "approve" : "reject";
      setFadingBookings((prev) => [...prev, { id, fadeColor }]);

      setTimeout(() => {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        setFadingBookings((prev) => prev.filter((f) => f.id !== id));
      }, 800);

      setTimeout(() => {
        fetchBookings();
      }, 1600);
    } catch (err) {
      console.error("❌ Error updating booking:", err);
      const backendError =
        err.response?.data?.error || err.response?.data?.message;
      alert(backendError || "Failed to update booking status.");
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="loading-screen">
        <Spinner animation="border" variant="primary" />
        <style>{`
          .loading-screen {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #d8e9ff, #f2f7ff, #ffffff);
          }
        `}</style>
      </div>
    );

  if (error)
    return (
      <Container className="mt-4">
        <Alert variant="danger" className="shadow-sm text-center">
          {error}
        </Alert>
      </Container>
    );

  return (
    <div className="owner-bookings-page">
      <Container className="py-5">
        <div className="page-header text-center mb-4">
          <h2 className="fw-bold text-primary">📬 Pending Booking Requests</h2>
          <p className="text-muted">
            Manage and track live booking requests in real-time.
          </p>
        </div>

        {bookings.length === 0 ? (
          <Alert variant="info" className="text-center shadow-sm">
            No pending bookings found!
          </Alert>
        ) : (
          <div className="booking-list">
            {bookings.map((b) => {
              let statusColor, statusLabel, statusEmoji;
              if (b.booking_status === "approved") {
                statusColor = "success";
                statusLabel = "Approved";
                statusEmoji = "✅";
              } else if (b.booking_status === "rejected") {
                statusColor = "danger";
                statusLabel = "Rejected";
                statusEmoji = "❌";
              } else {
                statusColor = "warning";
                statusLabel = "Pending";
                statusEmoji = "🕒";
              }

              const fadeInfo = fadingBookings.find((f) => f.id === b.id);
              const fadeClass = fadeInfo
                ? fadeInfo.fadeColor === "approve"
                  ? "fade-out-approve"
                  : "fade-out-reject"
                : "";

              return (
                <Card key={b.id} className={`booking-card ${fadeClass}`}>
                  <div className="booking-details">
                    <div className="booking-info">
                      <h5 className="turf-name">🏟️ {b.turf?.name || "Unnamed Turf"}</h5>
                      <Badge bg={statusColor} className="status-badge">
                        {statusEmoji} {statusLabel}
                      </Badge>
                      <p className="details-text mt-2">
                        👤 <strong>User:</strong> {b.user?.username || "Unknown"} <br />
                        📅 <strong>Date:</strong> {b.date} <br />
                        ⏰ <strong>Time:</strong> {b.start_time} - {b.end_time} <br />
                        💰 <strong>Total:</strong>{" "}
                        <span className="text-success fw-bold">₹{b.total_price}</span>
                      </p>
                    </div>

                    <div className="booking-actions">
                      <Button
                        className="approve-btn"
                        onClick={() => handleAction(b.id, "approve")}
                        disabled={!!fadeInfo}
                      >
                        ✅ Approve
                      </Button>
                      <Button
                        className="reject-btn"
                        onClick={() => handleAction(b.id, "reject")}
                        disabled={!!fadeInfo}
                      >
                        ❌ Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Container>

      <style>{`
        .owner-bookings-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #d8e9ff, #f2f7ff, #ffffff);
          font-family: 'Segoe UI', sans-serif;
          color: #003366;
          animation: bgShift 15s ease infinite;
          background-size: 200% 200%;
        }

        .page-header h2 {
          font-size: 2rem;
        }

        .booking-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .booking-card {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          padding: 18px 25px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          border-left: 6px solid #007bff;
          box-shadow: 0 6px 20px rgba(0, 123, 255, 0.15);
          transition: transform 0.3s ease, opacity 0.8s ease, height 0.8s ease, margin 0.8s ease, padding 0.8s ease;
          overflow: hidden;
        }

        .booking-details {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          flex-wrap: nowrap;
          gap: 20px;
        }

        .booking-info {
          flex: 3;
        }

        .booking-actions {
          flex: 1;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .booking-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(0, 123, 255, 0.25);
        }

        .fade-out-approve {
          animation: fadeBlue 0.8s forwards ease-out;
        }

        .fade-out-reject {
          animation: fadeRed 0.8s forwards ease-out;
        }

        @keyframes fadeBlue {
          0% { opacity: 1; transform: scale(1); border-left-color: #007bff; }
          50% { opacity: 0.5; transform: scale(0.98); border-left-color: #66b3ff; }
          100% { opacity: 0; transform: translateY(-10px); height: 0; margin: 0; padding: 0; }
        }

        @keyframes fadeRed {
          0% { opacity: 1; transform: scale(1); border-left-color: #ff4d4d; }
          50% { opacity: 0.5; transform: scale(0.98); border-left-color: #ff8080; }
          100% { opacity: 0; transform: translateY(-10px); height: 0; margin: 0; padding: 0; }
        }

        .approve-btn {
          background: linear-gradient(90deg, #007bff, #6cb5ff);
          border: none;
          border-radius: 10px;
          font-weight: bold;
          color: #fff;
          padding: 8px 16px;
          transition: all 0.3s ease;
        }

        .approve-btn:hover {
          background: linear-gradient(90deg, #339cff, #007bff);
          box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
          transform: translateY(-2px);
        }

        .reject-btn {
          background: linear-gradient(90deg, #ff4d4d, #ff7b7b);
          border: none;
          border-radius: 10px;
          font-weight: bold;
          color: #fff;
          padding: 8px 16px;
          transition: all 0.3s ease;
        }

        .reject-btn:hover {
          background: linear-gradient(90deg, #ff3333, #ff6666);
          box-shadow: 0 4px 10px rgba(255, 0, 0, 0.3);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .booking-details {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .booking-actions {
            justify-content: center;
            margin-top: 12px;
          }
        }

        @keyframes bgShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

export default OwnerBookingRequests;
