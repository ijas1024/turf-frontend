import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  ListGroup,
  Spinner,
} from "react-bootstrap";
import "./TeamShuffler.css";

function TeamShuffler() {
  const [playerNames, setPlayerNames] = useState("");
  const [numTeams, setNumTeams] = useState(2);
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [savedShuffles, setSavedShuffles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const token = localStorage.getItem("access");

  // --------------------------------------------------------
  // RANDOM SHUFFLE ONLY (Balanced removed)
  // --------------------------------------------------------
  const handleShuffle = () => {
    if (!playerNames.trim()) {
      alert("Please enter player names.");
      return;
    }

    const players = playerNames
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    if (players.length < numTeams) {
      alert("Players must be >= number of teams.");
      return;
    }

    const shuffled = players
      .map((v) => ({ value: v, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    const result = Array.from({ length: numTeams }, () => []);
    shuffled.forEach((player, index) => result[index % numTeams].push(player));

    setTeams(result);
  };

  // --------------------------------------------------------
  // SAVE TO SERVER
  // --------------------------------------------------------
  const handleSaveToServer = async () => {
    if (!token) return alert("Login required.");
    if (!teamName.trim()) return alert("Enter shuffle name.");
    if (teams.length === 0) return alert("Shuffle teams first.");

    setSaving(true);

    try {
      const bookingRes = await fetch("https://spoto-turf-booker-backend.onrender.com/api/bookings/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const bookings = await bookingRes.json();

      const latest = bookings.find(
        (b) =>
          b.booking_status === "confirmed" ||
          b.booking_status === "confirm_after_payment" ||
          b.payment_status === "paid"
      );

      if (!latest) {
        alert("No confirmed booking found.");
        setSaving(false);
        return;
      }

      const payload = {
        name: teamName,
        players: playerNames.split(",").map((p) => p.trim()),
        teams: Object.fromEntries(
          teams.map((t, i) => [`Team ${i + 1}`, t])
        ),
      };

      const res = await fetch(
        `https://spoto-turf-booker-backend.onrender.com/api/bookings/${latest.id}/team-shuffler/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        fetchSavedShuffles();
        setTeams([]);
        setTeamName("");
        setPlayerNames("");
      } else {
        alert("Failed to save.");
      }
    } catch {
      alert("Error saving shuffle.");
    }

    setSaving(false);
  };

  // --------------------------------------------------------
  // COPY + WHATSAPP SHARE
  // --------------------------------------------------------
  const formatTeamsText = () => {
    return teams
      .map(
        (team, index) =>
          `Team ${index + 1}:\n` + team.map((p) => `- ${p}`).join("\n")
      )
      .join("\n\n");
  };

  const copyTeamsToClipboard = () => {
    navigator.clipboard.writeText(formatTeamsText());
    alert("📋 Team list copied!");
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(formatTeamsText());
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // --------------------------------------------------------
  // FETCH SAVED SHUFFLES
  // --------------------------------------------------------
  const fetchSavedShuffles = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const resBooking = await fetch("https://spoto-turf-booker-backend.onrender.com/api/bookings/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const bookings = await resBooking.json();

      const latest = bookings.find(
        (b) =>
          b.booking_status === "confirmed" ||
          b.booking_status === "confirm_after_payment" ||
          b.payment_status === "paid"
      );

      if (!latest) return setLoading(false);

      const res = await fetch(
        `https://spoto-turf-booker-backend.onrender.com/api/bookings/${latest.id}/team-shuffler/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setSavedShuffles(
        Array.isArray(data.saved_shuffles) ? data.saved_shuffles : []
      );
    } catch {
      // ignore error
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSavedShuffles();
  }, []);

  return (
    <div className="ts-page-bg">
      <Container>
        <h1 className="ts-title">Team Shuffler</h1>

        {/* INPUT CARD */}
        <Card className="ts-card">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="ts-label">Shuffle Name</Form.Label>
              <Form.Control
                type="text"
                value={teamName}
                placeholder="Match name..."
                onChange={(e) => setTeamName(e.target.value)}
                className="ts-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="ts-label">Player Names</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={playerNames}
                placeholder="Rahul, Arjun, Sameer..."
                onChange={(e) => setPlayerNames(e.target.value)}
                className="ts-input"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="ts-label">Number of Teams</Form.Label>
              <Form.Control
                type="number"
                min="2"
                max="20"
                value={numTeams}
                onChange={(e) => setNumTeams(Number(e.target.value))}
                className="ts-input"
              />
            </Form.Group>

            <div className="text-center">
              <Button className="ts-btn" onClick={handleShuffle}>
                Shuffle Teams ⚡
              </Button>

              {teams.length > 0 && (
                <Button
                  className="ts-btn-outline ms-2"
                  onClick={handleSaveToServer}
                  disabled={saving}
                >
                  {saving ? <Spinner size="sm" /> : "Save"}
                </Button>
              )}
            </div>
          </Form>
        </Card>

        {/* GENERATED TEAMS */}
        {teams.length > 0 && (
          <div className="mb-4">
            <h3 className="ts-subtitle">Generated Teams</h3>

            <div className="ts-action-btns">
              <Button className="ts-btn" onClick={copyTeamsToClipboard}>
                📋 Copy Teams
              </Button>

              <Button className="ts-btn-outline" onClick={shareOnWhatsApp}>
                📲 Share on WhatsApp
              </Button>
            </div>

            <Row className="g-4">
              {teams.map((team, index) => (
                <Col key={index} xs={12} md={6} lg={4}>
                  <Card className="ts-card">
                    <Card.Body>
                      <Card.Title className="ts-team-title">
                        Team {index + 1}
                      </Card.Title>

                      <ListGroup variant="flush">
                        {team.map((player, i) => (
                          <ListGroup.Item key={i} className="ts-player-item">
                            {player}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* SAVED TEAMS */}
        <h3 className="ts-subtitle">Saved Team Shuffles</h3>

        {loading ? (
          <Spinner />
        ) : savedShuffles.length === 0 ? (
          <p className="text-center text-muted">No saved shuffles yet.</p>
        ) : (
          <Row className="g-4">
            {savedShuffles.map((shuffle, index) => (
              <Col key={index} xs={12} md={6} lg={4}>
                <Card className="ts-saved-card">
                  <Card.Body>
                    <Card.Title className="ts-team-title">
                      {shuffle.name}
                    </Card.Title>

                    {Object.entries(shuffle.teams).map(
                      ([teamName, members]) => (
                        <div key={teamName} className="mb-3">
                          <strong>{teamName}</strong>
                          <ListGroup variant="flush">
                            {members.map((m, i) => (
                              <ListGroup.Item
                                key={i}
                                className="ts-player-item"
                              >
                                {m}
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </div>
                      )
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {showToast && (
          <div className="ts-toast">
            ✅ Team Shuffle Saved Successfully!
          </div>
        )}
      </Container>
    </div>
  );
}

export default TeamShuffler;
