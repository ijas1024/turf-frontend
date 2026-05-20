import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LandingRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/login", { replace: true });
    } else if (role === "owner") {
      navigate("/owner/owner_home", { replace: true });
    } else {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  return null;
};

export default LandingRedirect;
