import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const safeImageUrl = (image) => {
  if (!image) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200'>
        <rect width='100%' height='100%' fill='#e9f7ff'/>
        <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
          fill='#007bff' font-family='Arial' font-size='20'>No Image</text></svg>`
    )}`;
  }
  if (typeof image !== "string") return image;
  if (image.startsWith("http")) return image;
  if (!image.startsWith("/")) image = "/" + image;
  return `http://127.0.0.1:8000${image}`;
};

function OwnerHome() {
  const navigate = useNavigate();
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ownerName, setOwnerName] = useState("");

  useEffect(() => {
    const fetchOwnerData = async () => {
      const token = localStorage.getItem("access");
      if (!token) return;

      try {
        const userRes = await fetch("http://127.0.0.1:8000/api/me/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setOwnerName(userData.username || "Turf Owner");
        }

        const res = await fetch("http://127.0.0.1:8000/api/owner/turfs/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch your turfs");
        const data = await res.json();
        setTurfs(data);
      } catch (err) {
        console.error("Error fetching owner data:", err);
        setError("Unable to fetch your turfs. Please try logging in again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, []);

  const handleDelete = async (turfId) => {
    if (!window.confirm("Are you sure you want to delete this turf?")) return;
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(
        `http://127.0.0.1:8000/api/owner/turfs/${turfId}/delete/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete turf");
      setTurfs(turfs.filter((turf) => turf.id !== turfId));
      alert("Turf deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete turf");
    }
  };

  const handleEdit = (turf) => {
    navigate("/owner/edit-turf", { state: { turf } });
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{ backgroundColor: "#e0f7ff" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#e9f9ff",
        minHeight: "100vh",
        padding: "3rem 5rem",
      }}
    >
      <h2
        className="text-center mb-5 fw-bold"
        style={{ color: "#007bff", fontSize: "2rem", letterSpacing: "0.5px" }}
      >
        Welcome, {ownerName || "Turf Owner"}
      </h2>

      <div className="d-flex justify-content-end mb-4 flex-wrap">
        {error && (
          <p className="text-danger me-auto align-self-center mb-0">{error}</p>
        )}
        <Button
          variant="primary"
          className="rounded-pill"
          onClick={() => navigate("/owner/add-turf")}
          style={{
            backgroundColor: "#007bff",
            border: "none",
            fontWeight: "600",
            padding: "10px 22px",
            boxShadow: "0 4px 10px rgba(0,123,255,0.25)",
          }}
        >
          ➕ Add New Turf
        </Button>
      </div>

      <Container fluid className="px-0">
        <Row className="g-4 justify-content-center">
          {turfs.length === 0 ? (
            <p className="text-center" style={{ color: "#007bff" }}>
              You haven’t added any turfs yet.
            </p>
          ) : (
            turfs.map((turf) => (
              <Col key={turf.id} xs={12} md={6} lg={4}>
                <Card
                  className="border-0"
                  style={{
                    borderRadius: 18,
                    boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    height: "100%",
                    minHeight: "420px",
                    backgroundColor: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow =
                      "0 16px 32px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 18px rgba(0,0,0,0.08)";
                  }}
                >
                  <Card.Img
                    variant="top"
                    src={safeImageUrl(turf.image)}
                    alt={turf.name}
                    style={{
                      width: "100%",
                      height: "260px",
                      objectFit: "cover",
                      borderTopLeftRadius: 18,
                      borderTopRightRadius: 18,
                    }}
                  />
                  <Card.Body style={{ padding: "1.25rem" }}>
                    <Card.Title
                      style={{
                        color: "#007bff",
                        fontWeight: 700,
                        fontSize: "1.3rem",
                      }}
                    >
                      {turf.name}
                    </Card.Title>
                    <Card.Text className="text-muted mb-1">
                      📍 {turf.location}
                    </Card.Text>
                    <Card.Text className="small text-secondary mb-1">
                      {turf.address}
                    </Card.Text>
                    <Card.Text className="small text-secondary">
                      Amenities: {turf.amenities}
                    </Card.Text>
                    <Card.Text
                      className="fw-bold"
                      style={{ color: "#007bff" }}
                    >
                      ₹{turf.price_per_hour} / hour
                    </Card.Text>

                    <div className="d-flex justify-content-between mt-3 align-items-center">
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() =>
                            navigate(`/owner/turfs/${turf.id}/slots`)
                          }
                        >
                          🕒 Manage Slots
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(turf)}
                        >
                          ✏️ Edit
                        </Button>
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(turf.id)}
                      >
                        🗑 Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>
    </div>
  );
}

export default OwnerHome;
