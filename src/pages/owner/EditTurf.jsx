import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Container, Spinner, Image } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position ? <Marker position={position} /> : null;
}

function EditTurf() {
  const location = useLocation();
  const navigate = useNavigate();
  const turfFromState = location.state?.turf;
  const [turf] = useState(turfFromState || null);
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: turf?.name || "",
    location: turf?.location || "",
    address: turf?.address || "",
    amenities: turf?.amenities || "",
    price_per_hour: turf?.price_per_hour || "",
    image: null,
  });

  useEffect(() => {
    if (turf?.latitude && turf?.longitude) {
      setPosition({ lat: parseFloat(turf.latitude), lng: parseFloat(turf.longitude) });
    }
  }, [turf]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access");
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") form.append(key, value);
    });
    if (position) {
      form.append("latitude", position.lat.toFixed(7));
      form.append("longitude", position.lng.toFixed(7));
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/owner/turfs/${turf.id}/update/`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: form }
      );
      if (!res.ok) throw new Error("Failed to update turf");
      alert("✅ Turf updated successfully!");
      navigate("/owner/owner_home", { replace: true });
    } catch {
      alert("❌ Error updating turf");
    } finally {
      setLoading(false);
    }
  };

  if (!turf) {
    return (
      <div className="text-center mt-5">
        <p>No turf data provided. Go back to your turf list.</p>
        <Button variant="outline-primary" onClick={() => navigate("/owner/owner_home")}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="owner-futuristic-bg">
      <Container className="min-vh-100 d-flex justify-content-center align-items-center p-3">
        <div className="owner-glass-card animate-entry">
          <h2 className="owner-form-title">✏️ Edit Turf</h2>

          {turf?.image && (
            <div className="text-center mb-4">
              <Image
                src={
                  turf.image.startsWith("http")
                    ? turf.image
                    : `http://127.0.0.1:8000${turf.image}`
                }
                alt="Turf"
                fluid
                className="owner-turf-img"
              />
            </div>
          )}

          <Form onSubmit={handleSubmit} className="owner-form">
            <div className="form-floating mb-4">
              <Form.Control
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Turf Name"
                required
              />
              <Form.Label htmlFor="name">Turf Name</Form.Label>
            </div>

            <div className="form-floating mb-4">
              <Form.Control
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="Location"
                required
              />
              <Form.Label htmlFor="location">Location</Form.Label>
            </div>

            <div className="form-floating mb-4">
              <Form.Control
                as="textarea"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                style={{ height: "100px" }}
                required
              />
              <Form.Label htmlFor="address">Address</Form.Label>
            </div>

            <div className="map-container mb-4">
              <label className="form-label text-muted">📍 Pick Location on Map</label>
              <div className="owner-map">
                <MapContainer center={position || [10.0, 76.0]} zoom={13} style={{ height: "300px" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
            </div>

            <div className="form-floating mb-4">
              <Form.Control
                id="amenities"
                name="amenities"
                value={formData.amenities}
                onChange={handleChange}
                placeholder="Amenities"
              />
              <Form.Label htmlFor="amenities">Amenities (comma separated)</Form.Label>
            </div>

            <div className="form-floating mb-4">
              <Form.Control
                id="price"
                name="price_per_hour"
                type="number"
                value={formData.price_per_hour}
                onChange={handleChange}
                placeholder="Price per Hour"
                required
              />
              <Form.Label htmlFor="price">Price per Hour (₹)</Form.Label>
            </div>

            <Form.Group controlId="image" className="mb-4">
              <Form.Label className="text-muted">🖼️ Change Image (optional)</Form.Label>
              <Form.Control type="file" name="image" onChange={handleChange} />
            </Form.Group>

            <Button type="submit" className="owner-btn w-100 mb-3" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Update Turf"}
            </Button>
            <Button
              variant="outline-secondary w-100"
              onClick={() => navigate("/owner/owner_home")}
            >
              Cancel
            </Button>
          </Form>
        </div>
      </Container>

      <style>{`
        /* === Background === */
        .owner-futuristic-bg {
          background: linear-gradient(135deg, #e7f3ff, #f4f9ff, #ffffff);
          background-size: 300% 300%;
          animation: bgFlow 15s ease infinite;
          position: relative;
          overflow: hidden;
        }

        /* === Floating Particles === */
        .owner-futuristic-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(circle at 20% 30%, rgba(0,123,255,0.1), transparent 40%),
                            radial-gradient(circle at 80% 70%, rgba(0,180,255,0.1), transparent 40%);
          background-size: cover;
          animation: moveGlow 18s linear infinite;
          z-index: 0;
        }

        /* === Card === */
        .owner-glass-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 850px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 24px;
          backdrop-filter: blur(18px);
          padding: 2rem 2.5rem;
          box-shadow: 0 8px 35px rgba(0, 123, 255, 0.15);
          border: 1px solid rgba(0, 123, 255, 0.12);
        }

        .owner-glass-card:hover {
          transform: translateY(-5px);
          transition: 0.4s;
          box-shadow: 0 12px 45px rgba(0, 123, 255, 0.25);
        }

        .owner-form-title {
          color: #007bff;
          text-align: center;
          margin-bottom: 1.5rem;
          font-weight: 700;
          font-size: 1.9rem;
          text-shadow: 0 0 6px rgba(0, 123, 255, 0.2);
        }

        /* === Inputs === */
        .form-floating > .form-control {
          border: 1px solid rgba(0, 123, 255, 0.2);
          background: rgba(255, 255, 255, 0.6);
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.3s ease;
        }

        .form-floating > .form-control:focus {
          border-color: #007bff;
          box-shadow: 0 0 15px rgba(0, 123, 255, 0.25);
          background: rgba(255, 255, 255, 0.8);
        }

        .form-floating > label {
          color: #007bff;
          font-weight: 500;
        }

        .owner-turf-img {
          border-radius: 16px;
          max-height: 200px;
          box-shadow: 0 8px 20px rgba(0, 123, 255, 0.15);
          transition: 0.3s;
        }
        .owner-turf-img:hover {
          transform: scale(1.03);
        }

        /* === Map === */
        .owner-map {
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 0 18px rgba(0, 123, 255, 0.2);
        }

        /* === Buttons === */
        .owner-btn {
          background: linear-gradient(90deg, #007bff, #00b4ff);
          border: none;
          border-radius: 12px;
          font-weight: 600;
          padding: 12px 0;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
        }

        .owner-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(0, 123, 255, 0.4);
          background: linear-gradient(90deg, #339cff, #007bff);
        }

        .animate-entry {
          animation: fadeIn 0.9s ease;
        }

        @keyframes bgFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes moveGlow {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 20px); }
          100% { transform: translate(0, 0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* === Responsive === */
        @media (max-width: 768px) {
          .owner-glass-card {
            padding: 1.5rem;
          }
          .owner-form-title {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </div>
  );
}

export default EditTurf;
