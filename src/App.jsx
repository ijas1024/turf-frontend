import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import NavbarComp from "./components/mynavbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import OwnerHome from "./pages/owner/owner_home";
import Login from "./pages/login";
import Signup from "./pages/SignUp";
import BookingPage from "./pages/BookingPage";
import ProtectedRoute from "./components/protectedRoutes";
import ProfilePage from "./pages/profilepage";
import Index from "./pages/index";
import AddTurf from "./pages/owner/AddTurf";
import EditTurf from "./pages/owner/EditTurf";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyBookings from "./pages/MyBookings";
import OwnerBookingRequests from "./pages/owner/OwnerBookingRequests";
import Notifications from "./pages/Notification";
import ManageSlots from "./pages/ManageSlots";
import OwnerBookingsSummary from "./pages/owner/OwnerBookingsSummary";
import TeamShuffler from "./pages/TeamShuffler";
import OwnerChat from "./pages/owner/OwnerChat";
import OwnerReviews from "./pages/owner/OwnerReviews";


// ✅ Layout wrapper to show/hide Navbar and Footer
function Layout() {
  const location = useLocation();

  // Hide navbar & footer on specific pages
  const hideNavbarFooter = ["/", "/login", "/signup"].includes(location.pathname);

  return (
    <>
      {!hideNavbarFooter && <NavbarComp />}
      <div style={{ paddingTop: hideNavbarFooter ? "0" : "70px" }}>
        <Routes>
          {/* 🌍 Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* 👤 Player Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={["player"]}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <ProtectedRoute allowedRoles={["player"]}>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={["player"]}>
                <MyBookings />
              </ProtectedRoute>
            }
          />
           <Route
            path="/TeamShuffler"
            element={
              <ProtectedRoute allowedRoles={["player"]}>
                <TeamShuffler />
              </ProtectedRoute>
            }
          />

          {/* 🧑‍💼 Owner Protected Routes */}
          <Route
            path="/owner/owner_home"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <OwnerHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/add-turf"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <AddTurf />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/edit-turf"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <EditTurf />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/bookings"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <OwnerBookingRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/bookings-summary"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <OwnerBookingsSummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/turfs/:turfId/slots"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <ManageSlots />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/chat"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <OwnerChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/reviews"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <OwnerReviews />
              </ProtectedRoute>
            }/>

          {/* 🛡 Common Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["owner", "player"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={["owner", "player"]}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* ❌ Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {!hideNavbarFooter && <Footer />}
    </>
  );
}

// ✅ Router wrapper
function AppWrapper() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default AppWrapper;
