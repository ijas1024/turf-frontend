// frontend/src/pages/BookingPage.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Card,
  ListGroup,
  Button,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import "./bookingPage.css"; 

const safeTurfImage = (image) => {
  if (!image) return null;
  if (typeof image !== "string") return image;
  if (image.startsWith("http")) return image;
  if (!image.startsWith("/")) image = "/" + image;
  return `https://spoto-turf-booker-backend.onrender.com${image}`;
};

function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { turf, bookingId } = location.state || {};

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [error, setError] = useState("");

  // Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem("username") ||
      localStorage.getItem("user_id") ||
      ""
  );

  const messagesEndRef = useRef(null);
  const getToken = () =>
    localStorage.getItem("access") ||
    localStorage.getItem("access_token") ||
    "";

  useEffect(() => {
    if (turf && date) fetchSlots(date);
  }, [turf, date]);

  useEffect(() => {
    let interval;
    if (turf) {
      fetchMergedChats(false);
      interval = setInterval(() => fetchMergedChats(true), 3000);
    }
    return () => clearInterval(interval);
  }, [turf, bookingId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSlots = async (d) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://spoto-turf-booker-backend.onrender.com/api/turfs/${turf.id}/available-slots/?date=${d}`
      );
      if (!res.ok) throw new Error("Failed to load slots");
      const data = await res.json();
      setSlots(data.slots || []);
    } catch (err) {
      setError("Unable to load slots. Try again later.");
    } finally {
      setLoading(false);
      setSelectedSlotId(null);
    }
  };

  const handleBook = async () => {
    setError("");
    const token = getToken();
    if (!token) {
      alert("Please login to confirm booking!");
      return;
    }
    if (!selectedSlotId) {
      alert("Please choose a slot");
      return;
    }
    try {
      const payload = { turf: turf.id, slot: selectedSlotId, date };
      const res = await fetch("https://spoto-turf-booker-backend.onrender.com/api/bookings/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      alert("✅ Booking request sent — waiting for owner approval!");
      navigate("/my-bookings");
    } catch (err) {
      setError(err.message || "Failed to book slot");
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    let [hours, minutes] = timeStr.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const totalPrice = (() => {
    if (!selectedSlotId) return 0;
    const s = slots.find((x) => x.id === selectedSlotId);
    if (!s) return 0;
    const [sh, sm] = s.start_time.split(":").map(Number);
    const [eh, em] = s.end_time.split(":").map(Number);
    let hours = eh - sh;
    if (hours <= 0) hours = 1;
    return (turf.price_per_hour || 0) * hours;
  })();

  const fetchMergedChats = async (autoRefresh = false) => {
    try {
      const token = getToken();
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const turfRes = await fetch(
        `https://spoto-turf-booker-backend.onrender.com/api/turfs/${turf.id}/chat/`,
        { headers }
      );
      const turfChats = turfRes.ok ? await turfRes.json() : [];

      let bookingChats = [];
      if (bookingId) {
        const bRes = await fetch(
          `https://spoto-turf-booker-backend.onrender.com/api/bookings/${bookingId}/chat/`,
          { headers }
        );
        bookingChats = bRes.ok ? await bRes.json() : [];
      }

      const merged = [...turfChats, ...bookingChats].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );

      setChatMessages((prev) => {
        const isFirstLoad = prev.length === 0;
        if (isFirstLoad && !autoRefresh) scrollToBottom();
        return merged;
      });
    } catch (err) {
      console.error("Chat fetch error:", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const token = getToken();
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      if (bookingId) {
        const res = await fetch(
          `https://spoto-turf-booker-backend.onrender.com/api/bookings/${bookingId}/chat/`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({ message: newMessage }),
          }
        );
        if (res.ok) {
          setNewMessage("");
          await fetchMergedChats();
          return;
        }
      }

      const res2 = await fetch(
        `https://spoto-turf-booker-backend.onrender.com/api/turfs/${turf.id}/chat/`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ message: newMessage }),
        }
      );
      if (res2.ok) {
        setNewMessage("");
        await fetchMergedChats();
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  // Reviews
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);

  const fetchReviews = async () => {
    if (!turf?.id) return;
    try {
      const res = await fetch(
        `https://spoto-turf-booker-backend.onrender.com/api/turfs/${turf.id}/feedback/`
      );
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  useEffect(() => {
    if (turf?.id) fetchReviews();
  }, [turf?.id]);

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const res = await fetch(
        `https://spoto-turf-booker-backend.onrender.com/api/turfs/${turf.id}/feedback/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating, comment }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("✅ " + (data.message || "Review submitted!"));
        setRating(0);
        setComment("");
        fetchReviews();
      } else {
        alert("❌ " + (data.error || "Failed to submit review."));
      }
    } catch (err) {
      alert("❌ Error submitting review.");
    }
  };

  const checkCanReview = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(
        `https://spoto-turf-booker-backend.onrender.com/api/turfs/${turf.id}/can-review/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setCanReview(data.can_review);
      }
    } catch (err) {
      console.error("Failed to check review permission:", err);
    }
  };

  useEffect(() => {
    if (turf?.id) checkCanReview();
  }, [turf?.id]);

  if (!turf) {
    return (
      <Container className="my-5 text-center">
        <h2>No booking data found!</h2>
        <Button variant="primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container className="booking-container theme-green-glass">
      <h2 className="booking-title">Booking - {turf.name}</h2>

      {/* TURF CARD */}
      <Card className="booking-card hover-lift">
        <Card.Img
          variant="top"
          src={safeTurfImage(turf.image)}
          alt={turf.name}
          className="booking-card-img"
        />

        <Card.Body>
          <Card.Title className="booking-card-title">
            {turf.name}
          </Card.Title>

          <p className="booking-location">📍 {turf.location}</p>

          <div className="date-picker-block">
            <Form.Label>Select Date</Form.Label>
            <Form.Control
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="date-input"
            />
          </div>

          <h5 className="slot-title">Available Slots</h5>

          {loading ? (
            <Spinner />
          ) : (
            <>
              {error && <Alert variant="danger">{error}</Alert>}
              <ListGroup className="slot-list">
                {slots.length === 0 && (
                  <ListGroup.Item>No slots available.</ListGroup.Item>
                )}

                {slots.map((s) => (
                  <ListGroup.Item
                    key={s.id}
                    className={`slot-item ${
                      !s.is_available ? "slot-unavailable" : ""
                    }`}
                  >
                    <div className="slot-time">
                      {formatTime(s.start_time)} — {formatTime(s.end_time)}
                    </div>

                    <Button
                      variant={
                        s.is_available
                          ? selectedSlotId === s.id
                            ? "success"
                            : "outline-success"
                          : "outline-secondary"
                      }
                      disabled={!s.is_available}
                      className="slot-btn"
                      onClick={() => setSelectedSlotId(s.id)}
                    >
                      {s.is_available
                        ? selectedSlotId === s.id
                          ? "Selected"
                          : "Select"
                        : "Booked"}
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}

          <div className="price-section">
            <span className="total-price">
              Total: ₹{totalPrice}
            </span>

            <Button className="confirm-btn" onClick={handleBook}>
              Confirm Booking
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* CHAT CARD */}
      <Card className="booking-card hover-lift">
        <Card.Body>
          <h5 className="chat-title">Chat with Turf Owner</h5>

          <div className="chat-box">
            {chatMessages.length === 0 ? (
              <div className="text-center text-muted">No messages yet.</div>
            ) : (
              chatMessages.map((msg) => {
                const isMine = msg.sender_name === currentUser;
                return (
                  <div
                    key={msg.id}
                    className={`chat-msg ${isMine ? "mine" : "theirs"}`}
                  >
                    {!isMine && (
                      <div className="chat-sender">{msg.sender_name}</div>
                    )}
                    <div className="chat-bubble">{msg.message}</div>
                    <div className="chat-time">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          <Form
            className="chat-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <Form.Control
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              className="chat-input"
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button type="submit" className="chat-send-btn">
              Send
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* REVIEWS CARD */}
      <Card className="booking-card hover-lift p-3">
        <h5 className="review-title">Ratings & Reviews</h5>

        <div className="review-list">
          {reviews.length === 0 ? (
            <p className="text-muted">No reviews yet.</p>
          ) : (
            reviews.map((r, i) => (
              <Card key={i} className="review-item">
                <div className="review-head">
                  <strong>{r.user_name}</strong>
                  <div className="stars">
                    {[...Array(5)].map((_, index) => (
                      <span
                        key={index}
                        className={
                          index < r.rating ? "star filled" : "star"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <p>{r.comment}</p>
                <small className="text-muted">
                  {new Date(r.created_at).toLocaleString()}
                </small>
              </Card>
            ))
          )}
        </div>

        {canReview ? (
          <>
            <h5 className="leave-review">Rate this Turf</h5>

            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star-select ${
                    star <= rating ? "active" : ""
                  }`}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>

            <Form onSubmit={submitReview}>
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="review-input"
                />
              </Form.Group>

              <Button type="submit" className="submit-review-btn">
                Submit Review
              </Button>
            </Form>
          </>
        ) : (
          <p className="cannot-review-msg">
            ⭐ You can rate this turf only after payment and confirmation.
          </p>
        )}
      </Card>
    </Container>
  );
}

export default BookingPage;
