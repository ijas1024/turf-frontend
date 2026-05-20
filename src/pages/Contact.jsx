import React, { useState } from 'react';
import './Contact.css';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaUser, FaComment } from 'react-icons/fa';

function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Detect role for theme
  const role = localStorage.getItem("role");
  const isOwner = role === "owner";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    const token = localStorage.getItem("access") || localStorage.getItem("access_token");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/contact/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("✅ Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setStatus(""), 5000);
      } else {
        const err = await res.json();
        setStatus(`❌ ${err.error || "Failed to send message. Try again."}`);
      }
    } catch {
      setStatus("❌ Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`contact-container ${isOwner ? "owner-theme" : "user-theme"}`}>
      <div className="floating-bg"></div>

      <h1 className="contact-title">Get in Touch</h1>
      <p className="contact-description">
        We'd love to hear from you! Fill out the form below or reach us via our contact info.
      </p>

      <div className="contact-wrapper">
        {/* Glassy Form */}
        <form className="contact-form glass-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name"><FaUser /> Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email"><FaEnvelope /> Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message"><FaComment /> Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your message here..."
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>

          {status && (
            <p className="status-text" style={{ color: status.startsWith("✅") ? "green" : "red" }}>
              {status}
            </p>
          )}
        </form>

        {/* Contact Info with Themed Icons */}
        <div className="contact-info glass-card">
          <h2>Contact Info</h2>
          <p><FaPhoneAlt className="info-icon" /> +91 80897 32385</p>
          <p><FaEnvelope className="info-icon" /> info@turfbookingkerala.com</p>
          <p><FaMapMarkerAlt className="info-icon" /> Kochi, Kerala, India</p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
