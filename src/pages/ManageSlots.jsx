// src/pages/ManageSlots.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  ListGroup,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

function ManageSlots() {
  const { turfId } = useParams();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [startHour, setStartHour] = useState("06:00");
  const [startPeriod, setStartPeriod] = useState("AM");
  const [endHour, setEndHour] = useState("07:00");
  const [endPeriod, setEndPeriod] = useState("AM");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access");
      const res = await fetch(
        `http://127.0.0.1:8000/api/owner/turfs/${turfId}/slots/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to load slots");
      const data = await res.json();
      setSlots(data);
    } catch {
      setError("Unable to load slots");
    } finally {
      setLoading(false);
    }
  };

  // Convert 12h → 24h
  const convertTo24h = (time, period) => {
    let [hour, minute] = time.split(":").map(Number);
    if (period === "PM" && hour < 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const start_time = convertTo24h(startHour, startPeriod);
      const end_time = convertTo24h(endHour, endPeriod);
      const token = localStorage.getItem("access");

      const res = await fetch(
        `http://127.0.0.1:8000/api/owner/turfs/${turfId}/slots/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ start_time, end_time }),
        }
      );

      if (!res.ok) throw new Error("Invalid or duplicate slot");
      const newSlot = await res.json();
      setSlots((s) => [...s, newSlot]);
    } catch {
      setError("Failed to add slot (check times or duplicate)");
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm("Delete this slot?")) return;

    try {
      const token = localStorage.getItem("access");
      const res = await fetch(
        `http://127.0.0.1:8000/api/owner/turfs/${turfId}/slots/${slotId}/delete/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error();
      setSlots(slots.filter((s) => s.id !== slotId));
    } catch {
      alert("Failed to delete slot.");
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <Spinner variant="primary" />
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 10px",
        background:
          "linear-gradient(135deg, #d6e9ff, #eef5ff, #ffffff, #e3f1ff)",
        backgroundSize: "200% 200%",
        animation: "bgMove 10s ease infinite",
      }}
    >
      {/* Animation for background */}
      <style>{`
        @keyframes bgMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          box-shadow: 0 8px 28px rgba(0, 123, 255, 0.18);
          padding: 25px;
          transition: transform 0.3s ease;
        }
        .glass-card:hover {
          transform: translateY(-6px);
        }

        .slot-item {
          border-radius: 14px !important;
          padding: 14px !important;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(5px);
          border: none !important;
          box-shadow: 0 3px 10px rgba(0,0,0,0.06);
        }

        .slot-item:hover {
          background: rgba(230,244,255,0.8);
        }
      `}</style>

      <Container style={{ maxWidth: "900px" }}>
        <h2
          className="fw-bold mb-4 text-center"
          style={{
            color: "#007bff",
            textShadow: "0px 3px 10px rgba(0,123,255,0.25)",
          }}
        >
          Manage Turf Slots
        </h2>

        {/* ─────────────────────── Add Slot Card ─────────────────────── */}
        <Card className="glass-card mb-4">
          <Form
            onSubmit={handleAdd}
            className="d-flex gap-3 flex-wrap align-items-end"
          >
            {/* Start Time */}
            <Form.Group style={{ flex: 1, minWidth: "200px" }}>
              <Form.Label className="fw-semibold" style={{ color: "#007bff" }}>
                Start Time
              </Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  type="time"
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                />
                <Form.Select
                  value={startPeriod}
                  onChange={(e) => setStartPeriod(e.target.value)}
                  style={{ width: "85px" }}
                >
                  <option>AM</option>
                  <option>PM</option>
                </Form.Select>
              </div>
            </Form.Group>

            {/* End Time */}
            <Form.Group style={{ flex: 1, minWidth: "200px" }}>
              <Form.Label className="fw-semibold" style={{ color: "#007bff" }}>
                End Time
              </Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  type="time"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                />
                <Form.Select
                  value={endPeriod}
                  onChange={(e) => setEndPeriod(e.target.value)}
                  style={{ width: "85px" }}
                >
                  <option>AM</option>
                  <option>PM</option>
                </Form.Select>
              </div>
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              className="px-4"
              style={{
                borderRadius: 12,
                padding: "10px 18px",
                fontWeight: "600",
                boxShadow: "0 4px 10px rgba(0,123,255,0.3)",
              }}
            >
              Add Slot
            </Button>
          </Form>

          {error && (
            <Alert variant="danger" className="mt-3 text-center">
              {error}
            </Alert>
          )}
        </Card>

        {/* ─────────────────────── Slots List ─────────────────────── */}
        <h5 className="mb-3 fw-semibold" style={{ color: "#005fcc" }}>
          Existing Slots
        </h5>

        <ListGroup>
          {slots.length === 0 && (
            <ListGroup.Item className="slot-item text-center">
              No slots yet. Add a slot above.
            </ListGroup.Item>
          )}

          {slots.map((s) => (
            <ListGroup.Item
              key={s.id}
              className="slot-item d-flex justify-content-between"
            >
              <div>
                <strong style={{ color: "#007bff" }}>
                  {s.start_time} - {s.end_time}
                </strong>
                <div className="text-muted small">
                  Active:{" "}
                  <span
                    style={{
                      color: s.is_active ? "green" : "red",
                      fontWeight: "600",
                    }}
                  >
                    {s.is_active ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleDelete(s.id)}
                style={{
                  borderRadius: "8px",
                  fontWeight: "600",
                }}
              >
                Delete
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>

        <div className="text-center mt-4">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            style={{ padding: "10px 25px", borderRadius: 12 }}
          >
            Back
          </Button>
        </div>
      </Container>
    </div>
  );
}

export default ManageSlots;
