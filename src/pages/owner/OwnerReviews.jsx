import React, { useEffect, useState } from "react";
import { Container, Card, Spinner, Alert } from "react-bootstrap";

function OwnerReviews() {
  const [loading, setLoading] = useState(true);
  const [turfReviews, setTurfReviews] = useState([]);
  const [error, setError] = useState("");

  const token =
    localStorage.getItem("access") ||
    localStorage.getItem("access_token") ||
    "";

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/owner/feedbacks/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load reviews.");
        setTurfReviews(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [token]);

  const renderStars = (rating) => {
    return (
      <>
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            style={{
              color: i < rating ? "#f5b50a" : "#bfc9d6",
              fontSize: "1.35rem",
              marginRight: "2px",
            }}
          >
            ★
          </span>
        ))}
      </>
    );
  };

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  return (
    <div className="owner-reviews-page">
      <Container className="py-5">
        <div className="reviews-header-card">
          <h2 className="fw-bold text-primary">🌟 Turf Reviews & Ratings</h2>
          <p className="text-muted">
            View all customer feedback & average ratings of your turfs.
          </p>
        </div>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        ) : turfReviews.length === 0 ? (
          <Alert variant="info" className="text-center">
            You don’t have any turfs or reviews yet.
          </Alert>
        ) : (
          turfReviews.map((turf) => {
            const avg = getAverageRating(turf.reviews);
            return (
              <Card key={turf.turf_id} className="turf-card shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="fw-bold text-primary mb-0">
                      🏟️ {turf.turf_name}
                    </h4>

                    <div className="rating-box">
                      ⭐ <strong>{avg}/5</strong>
                      <small className="text-muted ms-2">
                        ({turf.reviews.length} review
                        {turf.reviews.length !== 1 ? "s" : ""})
                      </small>
                    </div>
                  </div>

                  {turf.reviews.length === 0 ? (
                    <p className="text-muted">No reviews available.</p>
                  ) : (
                    turf.reviews.map((r, idx) => (
                      <Card key={idx} className="review-card shadow-sm">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong className="review-user">{r.user_name}</strong>
                          <div>{renderStars(r.rating)}</div>
                        </div>

                        <p className="review-text">{r.comment}</p>

                        <small className="text-muted review-date">
                          {new Date(r.created_at).toLocaleString()}
                        </small>
                      </Card>
                    ))
                  )}
                </Card.Body>
              </Card>
            );
          })
        )}
      </Container>

      {/* CSS */}
      <style>
        {`
          .owner-reviews-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #d8e9ff, #f2f7ff, #ffffff);
            animation: bgShift 18s ease infinite;
            background-size: 200% 200%;
            font-family: 'Segoe UI', sans-serif;
          }

          @keyframes bgShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .reviews-header-card {
            text-align: center;
            padding: 25px;
            border-radius: 20px;
            background: rgba(255,255,255,0.6);
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 20px rgba(0,123,255,0.15);
            margin-bottom: 40px;
          }

          .turf-card {
            border-radius: 20px;
            padding: 10px;
            background: rgba(255,255,255,0.85);
            backdrop-filter: blur(10px);
            margin-bottom: 35px;
            border: none;
            transition: all 0.3s ease;
          }

          .turf-card:hover {
            transform: scale(1.02);
            box-shadow: 0 8px 30px rgba(0,123,255,0.25);
          }

          .rating-box {
            font-size: 1.15rem;
            color: #ffb703;
            font-weight: 700;
          }

          .review-card {
            border-radius: 16px;
            background: rgba(255,255,255,0.95);
            border: none;
            padding: 18px;
            margin-bottom: 15px;
            transition: all 0.3s ease;
          }

          .review-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0,123,255,0.18);
          }

          .review-user {
            font-size: 1.05rem;
            color: #004b88;
          }

          .review-text {
            margin: 10px 0 5px 0;
            font-size: 0.95rem;
            color: #333;
          }

          .review-date {
            font-size: 0.8rem;
          }
        `}
      </style>
    </div>
  );
}

export default OwnerReviews;
