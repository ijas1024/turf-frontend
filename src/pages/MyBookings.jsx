import React, { useEffect, useState } from "react";
import { Container, Spinner, Alert, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState({});
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        setError("Please login to view your bookings.");
        setLoading(false);
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/api/bookings/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(JSON.stringify(err));
      }

      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error("❌ Error fetching bookings:", err);
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((id) => {
          if (updated[id] > 0) updated[id] -= 1;
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const startCountdown = (bookingId) => {
    setCountdown((prev) => ({
      ...prev,
      [bookingId]: 120,
    }));
  };

  const handlePayment = async (booking) => {
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(
        `http://127.0.0.1:8000/api/bookings/${booking.id}/create-payment/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment creation failed");

      const options = {
        key: data.key,
        amount: data.amount * 100,
        currency: "INR",
        name: "Turf Booking",
        description: `Advance payment for ${booking.turf_name}`,
        order_id: data.order_id,
        handler: async function (response) {
          const verifyRes = await fetch(
            `http://127.0.0.1:8000/api/bookings/${booking.id}/verify-payment/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(response),
            }
          );
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            alert("✅ Payment successful!");
            fetchBookings();
          } else {
            alert("❌ Payment verification failed: " + verifyData.error);
          }
        },
        prefill: { name: localStorage.getItem("username") || "" },
        theme: { color: "#22c55e" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("❌ Payment Error:", err);
      alert("Payment failed. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="booking-loading">
        <Spinner animation="border" />
        <style>{`
          .booking-loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #e6f4ea, #d9f9dc, #ffffff);
          }
        `}</style>
      </div>
    );

  if (error)
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );

  return (
    <div className="bookings-page">
      <Container className="py-5">
        <div className="bookings-header">
          <h2 className="fw-bold">My Bookings</h2>
          <Button className="back-btn" onClick={() => navigate("/")}>
            ⬅ Back to Home
          </Button>
        </div>

        {bookings.length === 0 ? (
          <Alert variant="info" className="text-center">
            You haven’t made any bookings yet.
          </Alert>
        ) : (
          <div className="bookings-table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Turf</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={b.id} className="booking-row">
                    <td>{i + 1}</td>
                    <td className="turf-cell">
                      <div className="turf-icon">🏟️</div>
                      <div>{b.turf_name}</div>
                    </td>
                    <td>📅 {b.date}</td>
                    <td>⏰ {b.start_time} - {b.end_time}</td>
                    <td>₹{b.total_price}</td>
                    <td>
                      <Badge bg={b.payment_status === "paid" ? "success" : "warning"}>
                        {b.payment_status}
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        bg={
                          b.booking_status === "confirmed"
                            ? "success"
                            : b.booking_status === "confirm_after_payment"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {b.booking_status_display}
                      </Badge>
                    </td>
                    <td>
                      {b.booking_status === "confirm_after_payment" &&
                        b.payment_status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="pay-btn"
                              onClick={() => {
                                handlePayment(b);
                                startCountdown(b.id);
                              }}
                            >
                              💳 Pay ₹{b.total_price / 2}
                            </Button>
                            {countdown[b.id] > 0 && (
                              <div className="countdown-tag">
                                ⏳ {Math.floor(countdown[b.id] / 60)}:
                                {String(countdown[b.id] % 60).padStart(2, "0")}
                              </div>
                            )}
                          </>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>

      <style>{`
        .bookings-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #e6f4ea, #d9f9dc, #ffffff);
          color: #1b5e20;
          font-family: "Segoe UI", sans-serif;
        }

        .bookings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 15px 25px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(12px);
        }

        .back-btn {
          background: linear-gradient(90deg, #2e7d32, #66bb6a);
          border: none;
          color: white;
          font-weight: 600;
          border-radius: 10px;
          padding: 8px 16px;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(46, 125, 50, 0.4);
        }

        .modern-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 12px;
        }

        .modern-table thead {
          background: #2e7d32;
          color: white;
        }

        .modern-table th {
          text-transform: uppercase;
          padding: 12px;
        }

        .booking-row {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 14px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .booking-row:hover {
          transform: scale(1.01);
          box-shadow: 0 10px 30px rgba(46, 125, 50, 0.3);
        }

        .modern-table td {
          padding: 14px;
          text-align: center;
          border: none;
          font-size: 1rem;
        }

        .turf-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
        }

        .turf-icon {
          font-size: 1.5rem;
        }

        .pay-btn {
          background: linear-gradient(90deg, #2e7d32, #66bb6a);
          border: none;
          color: white;
          border-radius: 8px;
          padding: 8px 12px;
          font-weight: 600;
          transition: 0.3s ease;
        }

        .pay-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(46,125,50,0.4);
        }

        .countdown-tag {
          display: inline-block;
          background: #fff3cd;
          color: #b71c1c;
          font-weight: 600;
          font-size: 0.85rem;
          border-radius: 6px;
          padding: 4px 8px;
          margin-top: 6px;
        }

        @media (max-width: 900px) {
          .modern-table,
          .modern-table thead,
          .modern-table tbody,
          .modern-table th,
          .modern-table td,
          .modern-table tr {
            display: block;
            width: 100%;
          }

          .modern-table tr {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 14px;
            margin-bottom: 18px;
            padding: 12px;
          }

          .modern-table td {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 0.95rem;
          }

          .modern-table td::before {
            content: attr(data-label);
            font-weight: 600;
            color: #2e7d32;
          }

          .modern-table thead {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default MyBookings;
