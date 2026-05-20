import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
  Alert,
  Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Default blue icon (your location)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// 🟢 Green Turf Marker Icon
const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function UserHome() {
  const navigate = useNavigate();
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [recommendedTurf, setRecommendedTurf] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/turfs/", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch turfs");
        const data = await res.json();
        setTurfs(data);
      } catch (err) {
        console.error(err);
        alert("Unable to fetch turfs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchTurfs();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(location);

        if (turfs.length > 0) {
          let nearest = null;
          let minDist = Infinity;

          turfs.forEach((turf) => {
            if (turf.latitude && turf.longitude) {
              const dist = calculateDistance(
                location.lat,
                location.lng,
                turf.latitude,
                turf.longitude
              );
              if (dist < minDist) {
                minDist = dist;
                nearest = { ...turf, distance: dist };
              }
            }
          });

          if (nearest) {
            setRecommendedTurf(nearest);
            setShowModal(true);
          }
        }
      },
      () => setLocationError("Unable to retrieve your location.")
    );
  };

  const filteredTurfs = turfs.filter(
    (turf) =>
      turf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turf.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{ backgroundColor: "#f8fff8" }}
      >
        <Spinner animation="border" variant="success" />
      </div>
    );

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200'>
          <rect width='100%' height='100%' fill='#f8fff8'/>
          <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' 
            fill='#4caf50' font-family='Arial' font-size='20'>No Image</text></svg>`
      )}`;
    }
    if (imagePath.startsWith("http")) return imagePath;
    if (!imagePath.startsWith("/")) imagePath = "/" + imagePath;
    return `http://127.0.0.1:8000${imagePath}`;
  };

  return (
    <div
      style={{
        backgroundColor: "#f8fff8",
        minHeight: "100vh",
        padding: "3rem 5rem",
      }}
    >
      <h2
        className="text-center mb-5 fw-bold"
        style={{ color: "#2e7d32", fontSize: "2rem", letterSpacing: "0.5px" }}
      >
        All Kerala Turfs
      </h2>

      {/* Search */}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap">
        <Form.Control
          type="text"
          placeholder="Search by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: "280px",
            maxWidth: "70%",
            borderRadius: 10,
            border: "1px solid rgba(76,175,80,0.2)",
            boxShadow: "0 2px 6px rgba(76,175,80,0.05)",
            padding: "12px 16px",
          }}
        />
        <Button
          variant="success"
          onClick={handleUseLocation}
          style={{
            borderRadius: 10,
            fontWeight: 600,
            padding: "10px 20px",
            marginTop: "10px",
            marginLeft: "10px",
            boxShadow: "0 4px 10px rgba(76,175,80,0.2)",
            border: "none",
          }}
        >
          📍 Use My Location
        </Button>
      </div>

      {locationError && (
        <Alert variant="warning" className="text-center">
          {locationError}
        </Alert>
      )}

      {/* Map */}
      {userLocation && (
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={13}
          style={{
            height: "420px",
            width: "100%",
            marginBottom: "2.5rem",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* 🟢 Green Turf Markers */}
          {filteredTurfs.map(
            (turf) =>
              turf.latitude &&
              turf.longitude && (
                <Marker
                  key={turf.id}
                  position={[turf.latitude, turf.longitude]}
                  icon={greenIcon}
                >
                  <Popup>
                    <strong>{turf.name}</strong>
                    <br />
                    {turf.location}
                    <br />₹{turf.price_per_hour}/hour
                  </Popup>
                </Marker>
              )
          )}

          {/* 🔵 Your Location Marker */}
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>Your location</Popup>
          </Marker>
        </MapContainer>
      )}

      {/* Turf Cards */}
      <Container fluid className="px-0">
        <Row className="g-4 justify-content-center">
          {filteredTurfs.length === 0 ? (
            <p className="text-center text-muted">No turfs found.</p>
          ) : (
            filteredTurfs.map((turf) => (
              <Col key={turf.id} xs={12} md={6} lg={4}>
                <Card
                  className="border-0"
                  style={{
                    borderRadius: 18,
                    boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    height: "100%",
                    minHeight: "420px",
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
                    src={getImageUrl(turf.image)}
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
                        color: "#2e7d32",
                        fontWeight: 700,
                        fontSize: "1.3rem",
                      }}
                    >
                      {turf.name}
                    </Card.Title>
                    <Card.Text className="text-muted mb-1">
                      📍 {turf.location}
                    </Card.Text>
                    <Card.Text className="fw-semibold text-success mb-1">
                      ₹{turf.price_per_hour} / hour
                    </Card.Text>
                    {userLocation && turf.latitude && turf.longitude && (
                      <Card.Text className="text-muted small">
                        Distance:{" "}
                        {calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          turf.latitude,
                          turf.longitude
                        ).toFixed(1)}{" "}
                        km
                      </Card.Text>
                    )}
                    <Button
                      variant="success"
                      className="w-100 mt-3"
                      onClick={() =>
                        navigate("/booking", { state: { turf } })
                      }
                      style={{
                        borderRadius: 12,
                        fontWeight: 600,
                        padding: "10px 0",
                        boxShadow: "0 4px 12px rgba(76,175,80,0.25)",
                        border: "none",
                      }}
                    >
                      Book Now
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>

      {/* Recommended Turf Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton style={{ borderBottom: "none" }}>
          <Modal.Title style={{ color: "#2e7d32", fontWeight: "700" }}>
            🏆 Recommended for You
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-center">
          {recommendedTurf && (
            <>
              <img
                src={getImageUrl(recommendedTurf.image)}
                alt={recommendedTurf.name}
                style={{
                  width: "100%",
                  height: "220px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  marginBottom: "1rem",
                }}
              />

              <h5 className="fw-bold text-success">{recommendedTurf.name}</h5>
              <p className="text-muted mb-1">📍 {recommendedTurf.location}</p>
              <p className="fw-semibold text-dark">
                Distance: {recommendedTurf.distance.toFixed(1)} km
              </p>
            </>
          )}
        </Modal.Body>

        <Modal.Footer style={{ borderTop: "none" }}>
          <Button
            variant="success"
            onClick={() =>
              navigate("/booking", { state: { turf: recommendedTurf } })
            }
            className="w-100"
            style={{
              borderRadius: 10,
              padding: "10px 0",
              fontWeight: 600,
            }}
          >
            Book Now
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default UserHome;
