import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import "./index.css";

function Index() {
  const navigate = useNavigate();
  const [showLogo, setShowLogo] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
    const role = localStorage.getItem("role");
    if (token) navigate(role === "owner" ? "/owner/owner_home" : "/home", { replace: true });

    setTimeout(() => setFadeIn(true), 500);
    setTimeout(() => setShowLogo(false), 2500); // logo fades out after 2.5s
  }, [navigate]);

  return (
    <div className={`index-page ${fadeIn ? "fade-in" : ""}`}>
      {/* 🎥 Background Video */}
      <video autoPlay loop muted playsInline className="index-bg-video fade-video">
        <source src="https://spoto-turf-booker-backend.onrender.com/media/backgrounds/index-gif.mp4" type="video/mp4" />
      </video>
      <div className="index-overlay"></div>

      {/* 🌟 Fade-in Logo Intro */}
      {showLogo && (
        <div className="spoto-logo">
          <h1>Spoto Turf Booker</h1>
        </div>
      )}

      {/* Main content (appears after logo fades) */}
      {!showLogo && (
        <div className="index-content text-center">
          <h1>Welcome to Spoto Turf Booker </h1>
          <p>
            Book your favorite turf or manage your turf business effortlessly.
            Join thousands of players and owners making the game smoother with Spoto!
          </p>
          <div className="index-buttons d-flex justify-content-center gap-3">
            <Button variant="success" size="lg" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button variant="info" size="lg" onClick={() => navigate("/signup")}>
              Sign Up
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Index;
