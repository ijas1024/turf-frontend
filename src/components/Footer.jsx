import React, { useEffect, useRef } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

function Footer() {
  const role = localStorage.getItem("role");
  const isOwner = role === "owner";
  const mainColor = isOwner ? "#007bff" : "#43a047";
  const gradient = isOwner
    ? "linear-gradient(180deg, rgba(0,123,255,0.85) 0%, rgba(224,247,255,0.75) 100%)"
    : "linear-gradient(180deg, rgba(67,160,71,0.85) 0%, rgba(212,249,220,0.75) 100%)";

  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transform = "translateY(0)";
            entry.target.style.opacity = "1";
          }
        });
      },
      { threshold: 0.1 }
    );
    if (footerRef.current) observer.observe(footerRef.current);
  }, []);

  return (
    <footer
      ref={footerRef}
      style={{
        background: gradient,
        color: "#fff",
        padding: "60px 0 30px",
        marginTop: "80px",
        borderTop: `4px solid ${mainColor}`,
        boxShadow: "0px -4px 20px rgba(0,0,0,0.15)",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        transition: "all 0.6s ease",
        transform: "translateY(50px)",
        opacity: 0,
      }}
    >
      <Container>
        {/* 🌟 Top Section */}
        <Row className="align-items-center mb-4 text-center text-md-start">
          <Col md={6} className="mb-3 mb-md-0">
            <h4
              className="fw-bold mb-3"
              style={{
                color: isOwner ? "#004a99" : "#1b5e20",
                textShadow: "0 1px 4px rgba(255,255,255,0.4)",
              }}
            >
              🏟️ TurfBooking Kerala
            </h4>
            <p
              className="text-dark"
              style={{
                lineHeight: "1.8",
                fontSize: "0.95rem",
                opacity: 0.9,
              }}
            >
              Your one-stop platform to book football turfs and multi-sport
              facilities across Kerala.
            </p>
          </Col>

          {/* 🌐 Social Links */}
          <Col md={6} className="text-md-end">
            <h6 className="fw-semibold text-dark mb-3">Stay Connected</h6>
            <div className="d-flex justify-content-center justify-content-md-end">
              {[
                { name: "Facebook", icon: "bi-facebook", link: "https://facebook.com" },
                { name: "Instagram", icon: "bi-instagram", link: "https://instagram.com" },
                { name: "Twitter", icon: "bi-twitter", link: "https://twitter.com" },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-dark text-decoration-none me-4 fw-semibold"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.5)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    transition: "all 0.4s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = mainColor;
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.transform = "translateY(-5px) rotate(10deg)";
                    e.currentTarget.style.boxShadow = `0 6px 15px ${mainColor}80`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.5)";
                    e.currentTarget.style.color = "black";
                    e.currentTarget.style.transform = "translateY(0) rotate(0)";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
                  }}
                >
                  <i className={`bi ${item.icon}`} style={{ fontSize: "1.2rem" }}></i>
                </a>
              ))}
            </div>
          </Col>
        </Row>

        <hr className="border-light opacity-50" />

        {/* ⚡ Middle Section */}
        <Row className="mt-4 text-center text-md-start">
          <Col md={4} className="mb-4">
            <h6 className="fw-semibold text-dark mb-3" style={{ color: mainColor }}>
              Quick Links
            </h6>
            <ul className="list-unstyled">
              {[
                { to: "/TeamShuffler", text: "⚽ Team Shuffler" },
                { to: "/about", text: "ℹ️ About Us" },
                { to: "/contact", text: "📞 Contact" },
              ].map((link, i) => (
                <li key={i} style={{ position: "relative", overflow: "hidden" }}>
                  <Link
                    to={link.to}
                    className="text-dark text-decoration-none d-block mb-2 position-relative"
                    style={linkStyle(mainColor)}
                  >
                    {link.text}
                    <span
                      className="neon-line"
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: "-100%",
                        width: "100%",
                        height: "2px",
                        background: `linear-gradient(90deg, transparent, ${mainColor}, transparent)`,
                        transition: "all 0.4s ease",
                      }}
                    ></span>
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* 🏃 For Players (only for players) */}
          {!isOwner && (
            <Col md={4} className="mb-4">
              <h6 className="fw-semibold mb-3" style={{ color: mainColor }}>
                For Players
              </h6>
              <p className="text-dark mb-1">🏃 Browse and book nearby turfs instantly.</p>
              <p className="text-dark mb-1">📅 Manage your bookings with ease.</p>
              <p className="text-dark mb-1">⭐ Rate and review your favorite turfs.</p>
            </Col>
          )}

          {/* 🧱 For Owners (only for owners) */}
          {isOwner && (
            <Col md={4} className="mb-4">
              <h6 className="fw-semibold mb-3" style={{ color: mainColor }}>
                For Owners
              </h6>
              <p className="text-dark mb-1">🏗️ Manage turf listings efficiently.</p>
              <p className="text-dark mb-1">💬 Get instant booking notifications.</p>
              <p className="text-dark mb-1">📊 View booking and review analytics.</p>
            </Col>
          )}
        </Row>

        <hr className="border-light opacity-50 mt-4" />

        {/* 🧾 Bottom Section */}
        <p
          className="text-center text-dark mb-0 fw-light"
          style={{
            opacity: 0.8,
            letterSpacing: "0.3px",
          }}
        >
          © {new Date().getFullYear()}{" "}
          <strong style={{ color: mainColor }}>TurfBooking Kerala</strong>. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}

/* 💫 Hover Line Animation */
const linkStyle = (color) => ({
  transition: "all 0.3s ease",
  fontWeight: "500",
  cursor: "pointer",
  color: "black",
  textDecoration: "none",
  fontSize: "0.95rem",
  position: "relative",
  display: "inline-block",
  paddingBottom: "3px",
  overflow: "hidden",
  onMouseEnter: (e) => {
    const line = e.currentTarget.querySelector(".neon-line");
    if (line) line.style.left = "0";
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.color = color;
  },
  onMouseLeave: (e) => {
    const line = e.currentTarget.querySelector(".neon-line");
    if (line) line.style.left = "-100%";
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.color = "black";
  },
});

export default Footer;
