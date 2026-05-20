import React, { useEffect, useRef, useState } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";

function NavbarComp() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("access");
  const role = localStorage.getItem("role");
  const [animate, setAnimate] = useState(false);
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const bgGradient =
    role === "owner"
      ? "linear-gradient(90deg, #007bff, #339cff)"
      : "linear-gradient(90deg, #43a047, #66bb6a)";
  const textColor = "white";

  // THEME COLORS FOR DROPDOWN
  const notifBg = role === "owner" ? "#E3F2FD" : "#E8F5E9";      // light theme
  const unreadBg = role === "owner" ? "#CFE2FF" : "#C8E6C9";     // unread background

  const fetchNotifications = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/notifications/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data);
      setUnread(data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 2000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const markAsRead = async () => {
    if (unread === 0) return;
    try {
      await fetch("http://127.0.0.1:8000/api/notifications/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnread(0);
    } catch (err) {
      console.error("Error marking notifications:", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
        markAsRead();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef, unread]);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  return (
    <Navbar
      expand="lg"
      fixed="top"
      style={{
        background: bgGradient,
        boxShadow: "0 3px 12px rgba(0,0,0,0.15)",
        backdropFilter: "blur(10px)",
        transform: animate ? "translateY(0)" : "translateY(-100%)",
        opacity: animate ? 1 : 0,
        transition:
          "transform 0.8s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.8s ease",
      }}
    >
      <Container fluid className="px-4">
        <Navbar.Brand
          as={Link}
          to={
            isLoggedIn
              ? role === "owner"
                ? "/owner/owner_home"
                : "/home"
              : "/"
          }
          style={{
            color: textColor,
            fontWeight: "800",
            fontSize: "1.5rem",
            textShadow: "0 1px 4px rgba(0,0,0,0.25)",
            letterSpacing: "0.5px",
          }}
        >
          Spoto Turf Booker
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="navbarScroll"
          style={{
            backgroundColor: "rgba(255,255,255,0.9)",
            border: "none",
          }}
        />

        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto align-items-center">
            {isLoggedIn && role === "player" && (
              <>
                <NavLink to="/home">Browse Turfs</NavLink>
                <NavLink to="/my-bookings">My Bookings</NavLink>
                <NavLink to="/TeamShuffler">Team Shuffler</NavLink>
                <NavLink to="/about">About</NavLink>
                <NavLink to="/contact">Contact</NavLink>
              </>
            )}

            {isLoggedIn && role === "owner" && (
              <>
                <NavLink to="/owner/owner_home">My Turfs</NavLink>
                <NavLink to="/owner/add-turf">Add Turf</NavLink>
                <NavLink to="/owner/bookings">Booking Requests</NavLink>
                <NavLink to="/owner/bookings-summary">Summary</NavLink>
                <NavLink to="/owner/reviews">Reviews</NavLink>
                <NavLink to="/owner/chat">Chat</NavLink>
                <NavLink to="/about">About</NavLink>
                <NavLink to="/contact">Contact</NavLink>
              </>
            )}
          </Nav>

          <Nav className="align-items-center">
            {isLoggedIn ? (
              <>
                {/* 🔔 Notification Dropdown */}
                <div ref={dropdownRef} className="position-relative me-3">
                  <div
                    onClick={() => setOpen(!open)}
                    className="position-relative d-flex align-items-center justify-content-center"
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: open
                        ? "0 0 10px rgba(255,255,255,0.5)"
                        : "0 2px 6px rgba(0,0,0,0.2)",
                    }}
                  >
                    <Bell color="white" size={22} />

                    {unread > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: "0.65rem" }}
                      >
                        {unread}
                      </span>
                    )}
                  </div>

                  {open && (
                    <div
                      className="position-absolute end-0 mt-2 shadow rounded"
                      style={{
                        background: notifBg,
                        width: "280px",
                        zIndex: 9999,
                        maxHeight: "320px",
                        overflowY: "auto",
                        borderRadius: "10px",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                      }}
                    >
                      <div
                        className="p-2 border-bottom fw-bold"
                        style={{
                          color: role === "owner" ? "#007bff" : "#2e7d32",
                        }}
                      >
                        Notifications
                      </div>

                      {notifications.length === 0 ? (
                        <div className="p-3 text-center text-muted">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className="p-2 border-bottom"
                            style={{
                              background: n.is_read ? notifBg : unreadBg,
                              transition: "background 0.3s",
                              cursor: "pointer",
                            }}
                          >
                            <div className="fw-semibold">{n.message}</div>
                            <small className="text-muted">
                              {new Date(n.created_at).toLocaleString()}
                            </small>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* 👤 Profile & Logout */}
                <Button
                  as={Link}
                  to="/profile"
                  variant="light"
                  className="me-2 rounded-pill fw-semibold"
                  style={{
                    padding: "8px 16px",
                    boxShadow: "0 2px 6px rgba(255,255,255,0.3)",
                  }}
                >
                  Profile
                </Button>

                <Button
                  onClick={handleLogout}
                  variant="outline-light"
                  className="fw-semibold rounded-pill"
                  style={{
                    borderColor: "white",
                    color: "white",
                    padding: "8px 16px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.25)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  as={Link}
                  to="/login"
                  variant="light"
                  className="me-2 rounded-pill fw-semibold"
                  style={{
                    padding: "8px 16px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}
                >
                  Login
                </Button>

                <Button
                  as={Link}
                  to="/signup"
                  variant="outline-light"
                  className="rounded-pill fw-semibold"
                  style={{
                    borderColor: "white",
                    color: "white",
                    padding: "8px 16px",
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

const NavLink = ({ to, children }) => (
  <Nav.Link
    as={Link}
    to={to}
    style={{
      color: "white",
      fontWeight: "500",
      marginRight: "15px",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      position: "relative",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = "#dfffe0";
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = "white";
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    {children}
  </Nav.Link>
);

export default NavbarComp;
