import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) return setError("Please enter both username and password.");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      navigate(data.role === "owner" ? "/owner/owner_home" : "/home", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", overflow: "hidden" }}>
      {/* 🎥 Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className={`fade-video ${loaded ? "visible" : ""}`}
        style={{
          position: "fixed",
          top: 0, left: 0, width: "100%", height: "100%",
          objectFit: "cover", opacity: 0, zIndex: 0,
          transition: "opacity 2s ease-in",
        }}
        onLoadedData={() => setLoaded(true)}
      >
        <source src="http://127.0.0.1:8000/media/backgrounds/ground-gif.mp4" type="video/mp4" />
      </video>
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        background: "linear-gradient(135deg, rgba(0,0,0,0.3), rgba(46,125,50,0.4))",
        zIndex: 1,
      }}></div>
      

      {/* Glass Form */}
      <form
        onSubmit={handleLogin}
        style={{
          background: "rgba(255,255,255,0.15)", backdropFilter: "blur(14px)",
          padding: "2.5rem", borderRadius: "20px", boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          width: "100%", maxWidth: "400px", color: "#fff", zIndex: 2, animation: "float 3s ease-in-out infinite"
        }}
      >
        <h2 style={{
          textAlign: "center", color: "#ffffff", marginBottom: "1.5rem",
          textShadow: "0 0 10px rgba(46,125,50,0.8)",
        }}>
          Welcome Back
        </h2>

        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
        <button type="submit" style={buttonStyle}>Login</button>

        {error && <p style={{ color: "#ffbaba", marginTop: "10px", textAlign: "center", fontWeight: "bold" }}>{error}</p>}

        <p style={{ textAlign: "center", marginTop: "15px", color: "#ffffff", fontWeight: "500" }}>
          Don’t have an account?{" "}
          <Link to="/signup" style={{ color: "#aeeaff", fontWeight: "bold", textDecoration: "none" }}>Signup</Link>
        </p>

        <style>{`
          @keyframes float {0%{transform:translateY(0)}50%{transform:translateY(-8px)}100%{transform:translateY(0)}}
          .fade-video.visible {opacity: 0.45;}
          input:focus{outline:none;box-shadow:0 0 8px rgba(46,125,50,0.6);}
          button:hover{box-shadow:0 0 25px rgba(46,125,50,0.7);transform:translateY(-2px);}
        `}</style>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "12px", marginBottom: "15px",
  borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.8)",
  color: "#000", fontWeight: "500", transition: "all 0.3s ease",
};

const buttonStyle = {
  width: "100%", padding: "12px", background: "linear-gradient(90deg, #2e7d32, #66bb6a)",
  color: "white", border: "none", borderRadius: "10px",
  fontWeight: "bold", cursor: "pointer", transition: "all 0.3s ease",
  boxShadow: "0 0 15px rgba(46,125,50,0.4)",
};

export default Login;
