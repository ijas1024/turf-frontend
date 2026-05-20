import React, { useState, useEffect } from "react";

const profileImageUrl = (img) => {
  if (!img) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
        <rect width='100%' height='100%' fill='#f3fdf3'/>
        <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
        fill='#4caf50' font-family='Arial' font-size='22'>No Image</text></svg>`
    )}`;
  }
  if (img.startsWith("http")) return img;
  if (!img.startsWith("/")) img = "/" + img;
  return `https://spoto-turf-booker-backend.onrender.com${img}`;
};

function ProfilePage({ setUsername, setProfileImage }) {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});
  const [profileFile, setProfileFile] = useState(null);
  const [errors, setErrors] = useState({});
  const token = localStorage.getItem("access");

  const fetchProfile = async () => {
    const res = await fetch("https://spoto-turf-booker-backend.onrender.com/api/me/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUser(data);
    setUpdatedUser(data);
    if (setProfileImage) setProfileImage(data.profile_image || "");
  };

  useEffect(() => {
    fetchProfile();
  }, [token, setProfileImage]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;

  const validateField = (name, value) => {
    let message = "";
    if (name === "username" && (!value || value.trim().length < 3)) {
      message = "Username must be at least 3 characters.";
    } else if (name === "email" && !emailRegex.test(value || "")) {
      message = "Invalid email address.";
    } else if (name === "phone_number" && value && !phoneRegex.test(value)) {
      message = "Phone number must be exactly 10 digits.";
    }
    return message;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const message = validateField(name, value);
    setUpdatedUser({ ...updatedUser, [name]: value });
    setErrors({ ...errors, [name]: message });
  };

  const handleFileChange = (e) => setProfileFile(e.target.files[0]);

  const validateForm = () => {
    const newErrors = {};
    Object.keys(updatedUser).forEach((key) => {
      const msg = validateField(key, updatedUser[key]);
      if (msg) newErrors[key] = msg;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    for (const key in updatedUser) {
      if (key !== "profile_image") formData.append(key, updatedUser[key]);
    }
    if (profileFile) formData.append("profile_image", profileFile);

    const res = await fetch("https://spoto-turf-booker-backend.onrender.com/api/update-profile/", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      alert("Profile updated successfully!");
      setEditMode(false);
      fetchProfile();
      if (setUsername) setUsername(updatedUser.username);
      localStorage.setItem("username", updatedUser.username);
    } else {
      const errorData = await res.json();
      alert("Error updating profile: " + JSON.stringify(errorData));
    }
  };

  const isOwner = user?.role === "owner";
  const mainColor = isOwner ? "#007bff" : "#2e7d32";
  const accentGradient = isOwner
    ? "linear-gradient(135deg, #d8e9ff, #f2f7ff, #ffffff)"
    : "linear-gradient(135deg, #d7f9dc, #f3fff5, #ffffff)";

  if (!user)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: accentGradient,
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            border: `5px solid ${mainColor}`,
            borderTop: "5px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`
          @keyframes spin {
            from { transform: rotate(0); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: accentGradient,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "3rem 1rem",
        backgroundSize: "200% 200%",
        animation: "bgShift 15s ease infinite",
      }}
    >
      <div
        style={{
          width: "95%",
          maxWidth: "1100px",
          display: "flex",
          alignItems: "stretch",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: `0 15px 40px ${
            isOwner ? "rgba(0,123,255,0.25)" : "rgba(46,125,50,0.25)"
          }`,
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(18px)",
          position: "relative",
          animation: "fadeIn 0.8s ease",
        }}
      >
        {/* -------- LEFT SECTION (IMAGE) -------- */}
        <div
          style={{
            flex: "1",
            position: "relative",
            background: `linear-gradient(120deg, ${mainColor}, ${
              isOwner ? "#6cb5ff" : "#a5d6a7"
            }, #fff)`,
            backgroundSize: "300% 300%",
            animation: "shimmerMove 12s ease-in-out infinite",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "2rem",
            flexDirection: "column",
          }}
        >
          {/* Fixed-height image box */}
          <div
            style={{
              width: "85%",
              maxWidth: "350px",
              height: "350px",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
              backgroundColor: "#fff",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <img
              src={profileImageUrl(user.profile_image)}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* FIXED upload button (now visible) */}
          {editMode && (
            <label
              style={{
                marginTop: "20px",
                display: "inline-block",
                padding: "8px 14px",
                background: "white",
                color: mainColor,
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                border: `2px solid ${mainColor}`,
                transition: "0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = mainColor;
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.color = mainColor;
              }}
            >
              📷 Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
          )}
        </div>

        {/* -------- RIGHT SECTION (FORM) -------- */}
        <div style={{ flex: "1.5", padding: "3rem 4rem" }}>
          <h2
            style={{
              color: mainColor,
              fontWeight: "800",
              marginBottom: "1.5rem",
              borderBottom: `2px solid ${mainColor}`,
              display: "inline-block",
              paddingBottom: "5px",
            }}
          >
            {editMode ? "Edit Profile" : "My Profile"}
          </h2>

          {Object.keys(updatedUser)
            .filter((f) => ["username", "email", "phone_number"].includes(f))
            .map((field) => {
              const isValid = !errors[field] && updatedUser[field];
              const borderColor = errors[field]
                ? "red"
                : isValid
                ? "green"
                : isOwner
                ? "#b3d9ff"
                : "#c8e6c9";
              return (
                <div key={field} style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      color: mainColor,
                      marginBottom: "5px",
                    }}
                  >
                    {field === "phone_number"
                      ? "Phone:"
                      : field.charAt(0).toUpperCase() + field.slice(1) + ":"}
                  </label>
                  <input
                    name={field}
                    value={updatedUser[field] || ""}
                    onChange={handleChange}
                    disabled={!editMode}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      border: `2px solid ${borderColor}`,
                      backgroundColor: editMode ? "#fff" : "#f9fdf9",
                      outline: "none",
                      transition: "border 0.3s ease, box-shadow 0.3s ease",
                    }}
                  />
                  {errors[field] && (
                    <small style={{ color: "red", fontWeight: "500" }}>
                      {errors[field]}
                    </small>
                  )}
                </div>
              );
            })}

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              gap: "1rem",
              marginTop: "2rem",
            }}
          >
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  style={{
                    padding: "10px 25px",
                    background: mainColor,
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: `0 4px 12px ${
                      isOwner ? "rgba(0,123,255,0.4)" : "rgba(46,125,50,0.4)"
                    }`,
                  }}
                >
                  💾 Save
                </button>

                <button
                  onClick={() => setEditMode(false)}
                  style={{
                    padding: "10px 25px",
                    background: "gray",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                style={{
                  padding: "12px 30px",
                  background: `linear-gradient(90deg, ${mainColor}, ${
                    isOwner ? "#339cff" : "#6fd37a"
                  })`,
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: `0 4px 12px ${
                    isOwner
                      ? "rgba(0,123,255,0.3)"
                      : "rgba(46,125,50,0.3)"
                  }`,
                  backgroundSize: "200% 200%",
                  transition: "all 0.4s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundPosition = "100% 0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundPosition = "0 0")
                }
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bgShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmerMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

export default ProfilePage;
