import React, { useEffect } from "react";
import "./About.css";
import { useNavigate } from "react-router-dom";

function About() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isOwner = role === "owner";

  // 🌀 Parallax background effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY * 0.3;
      document.documentElement.style.setProperty("--scroll-offset", `${scrolled}px`);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`about-container ${isOwner ? "owner-theme" : "user-theme"}`}
    >
      {/* Header */}
      <section className="about-header">
        <h1 className="about-title">About Us</h1>
        <p className="about-text">
          TurfBooking Kerala helps sports enthusiasts and families find and book
          football turfs, swimming pools, and multi-sport facilities across
          Kerala. Our goal is to make facility booking easy, transparent, and
          reliable.
        </p>
      </section>

      {/* Mission */}
      <section className="about-mission center-section">
        <h2 className="section-title">Our Mission</h2>
        <p>
          To provide a seamless platform for booking sports and recreational
          facilities, empowering communities to enjoy healthy and fun activities
          without hassle.
        </p>
      </section>

      {/* How It Works */}
      <section className="about-how">
        <h2 className="section-title">How It Works</h2>
        <ul className="features-list">
          <li>1️⃣ Search for a turf by location or type</li>
          <li>2️⃣ Choose available time slots</li>
          <li>3️⃣ Confirm your booking online</li>
          <li>4️⃣ Enjoy a hassle-free sports experience!</li>
        </ul>
      </section>

      {/* ⚽ Team Shuffler Section */}
      <section className="about-teamshuffler">
        <h2 className="section-title">Team Shuffler</h2>
        <p className="about-text">
          The <strong>Team Shuffler</strong> is a unique feature that
          automatically creates balanced and fair teams for your turf matches.
          Whether you’re playing a friendly 5-a-side or a competitive 11-a-side
          game, the shuffler ensures teams are evenly distributed by skill,
          experience, and position.
        </p>
        <ul className="features-list">
          <li>⚖️ Create fair teams with one click</li>
          <li>🎮 Perfect for friends and local tournaments</li>
          <li>📊 Smart algorithm ensures balanced gameplay</li>
          <li>💬 Share your team instantly with others</li>
        </ul>
        {!isOwner && (
          <div className="teamshuffler-btn">
            <button
              className="apply-now-button"
              onClick={() => navigate("/TeamShuffler")}
            >
              Try Team Shuffler ⚽
            </button>
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="about-features">
        <h2 className="section-title">Why Choose Us?</h2>
        <ul className="features-list">
          <li>⚽ Book football turfs across Kerala</li>
          <li>🏊 Access multi-sport courts</li>
          <li>🕒 Select multiple time slots for your convenience</li>
          <li>💰 Transparent pricing per slot</li>
          <li>📱 Mobile-friendly platform</li>
          <li>🛡️ Verified and trusted facilities</li>
        </ul>
      </section>

      {/* Achievements */}
      <section className="about-stats">
        <h2 className="section-title">Our Achievements</h2>
        <div className="stats-container">
          <div>🏟️ <strong>20+</strong> Turfs Available</div>
          <div>📅 <strong>5000+</strong> Bookings Completed</div>
          <div>⭐ <strong>4.8/5</strong> User Ratings</div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="about-testimonials">
        <h2 className="section-title">What Users Say</h2>
        <ul className="features-list">
          <li>“Booking a turf has never been easier! Highly recommend.” – Rahul K.</li>
          <li>“Loved the multi-sport courts, very well maintained.” – Anjali S.</li>
          <li>“Great platform for families and kids to enjoy safely.” – Sameer P.</li>
        </ul>
      </section>

      {/* Categories */}
      <section className="about-categories">
        <h2 className="section-title">Facility Categories</h2>
        <div className="category-tags">
          <span>⚽ Football Turfs</span>
          <span>🏀 Multi-Sport Courts</span>
          <span>🌙 Night Turfs</span>
          <span>👶 Kids Turf</span>
        </div>
      </section>

      {/* CTA */}
      {!isOwner && (
        <section className="about-cta center-section">
          <h2 className="section-title">Ready to Book a Turf?</h2>
          <p>
            Join thousands of sports enthusiasts enjoying hassle-free facility
            bookings every day.
          </p>
          <button
            className="apply-now-button"
            onClick={() => navigate("/")}
          >
            Browse Turfs
          </button>
        </section>
      )}
    </div>
  );
}

export default About;
