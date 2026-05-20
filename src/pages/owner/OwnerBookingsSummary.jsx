import React, { useEffect, useRef, useState } from "react";
import { Container, Button, Table, Spinner, Alert, Modal } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function OwnerBookingsSummary() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [income, setIncome] = useState(0);
  const [fade, setFade] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const reportRef = useRef(null);

  const fetchBookings = async (filterValue) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access");
      const res = await fetch(
        `http://127.0.0.1:8000/api/owner/bookings-summary/?filter=${filterValue}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch bookings");

      setBookings(data.bookings);
      setIncome(data.total_income);
      setFilter(data.filter);
      setFade(false);
      setTimeout(() => setFade(true), 100);
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings("today");
  }, []);

  const handleDownloadPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const date = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Add title and metadata
    pdf.setFontSize(18);
    pdf.setTextColor(0, 123, 255);
    pdf.text("🏟️ Owner Booking Summary Report", pageWidth / 2, 20, {
      align: "center",
    });

    pdf.setFontSize(12);
    pdf.setTextColor(60);
    pdf.text(`Generated on: ${date}`, 15, 30);
    pdf.text(`Report Period: ${filter.toUpperCase()}`, pageWidth - 60, 30);

    // Add captured section
    const imgHeight = (canvas.height * (pageWidth - 20)) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 40, pageWidth - 20, imgHeight);

    // Add watermark
    pdf.setFontSize(36);
    pdf.setTextColor(230);
    pdf.text("TurfBooking Kerala", pageWidth / 2, pageHeight - 20, {
      align: "center",
    });

    pdf.save(`Owner_Report_${filter}_${date}.pdf`);

    // ✅ Show success modal
    setShowModal(true);
  };

  if (loading)
    return (
      <div className="loading-screen">
        <Spinner animation="border" variant="primary" />
        <style>{`
          .loading-screen {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #d8e9ff, #f2f7ff, #ffffff);
          }
        `}</style>
      </div>
    );

  const chartData = Object.values(
    bookings.reduce((acc, booking) => {
      const date = booking.date;
      acc[date] = acc[date] || { date, income: 0 };
      acc[date].income += booking.total_price;
      return acc;
    }, {})
  );

  const COLORS = ["#007bff", "#339cff", "#6cb5ff", "#9fd0ff"];

  return (
    <div className="owner-summary-page">
      <Container className="py-5" ref={reportRef}>
        <div className="header-card">
          <h2 className="fw-bold text-primary">📊 Owner Booking Summary</h2>
          <p className="text-muted">
            Visualize your turf’s income growth and booking analytics.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="filter-section">
          {["today", "yesterday", "month"].map((f) => (
            <Button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => fetchBookings(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        <div className="income-card">
          <h5>
            💰 Total Income ({filter}):{" "}
            <span className="income-amount">₹{income.toFixed(2)}</span>
          </h5>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {bookings.length === 0 ? (
          <Alert variant="info" className="text-center">
            No bookings found for this period.
          </Alert>
        ) : (
          <div className={`fade-section ${fade ? "visible" : ""}`}>
            {/* Chart */}
            <div className="chart-card">
              <h5 className="chart-title">📈 Income Overview</h5>
              <p className="chart-subtitle">
                Each bar represents the total income for that date.
              </p>
              <ResponsiveContainer width="100%" height={330}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                  barSize={45}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#cde3ff" />
                  <XAxis dataKey="date" stroke="#007bff" />
                  <YAxis stroke="#007bff" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #007bff",
                      borderRadius: "10px",
                    }}
                  />
                  <Bar
                    dataKey="income"
                    radius={[10, 10, 0, 0]}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Table */}
            <div className="table-wrapper">
              <Table responsive bordered hover className="custom-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Turf</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr key={b.id}>
                      <td>{i + 1}</td>
                      <td>🏟️ {b.turf_name}</td>
                      <td>👤 {b.user_name}</td>
                      <td>📅 {b.date}</td>
                      <td>
                        ⏰ {b.start_time} - {b.end_time}
                      </td>
                      <td>₹{b.total_price}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}
      </Container>

      {/* PDF Download Button */}
      <div className="pdf-btn-container">
        <Button className="pdf-btn" onClick={handleDownloadPDF}>
          📄 Download Report (PDF)
        </Button>
      </div>

      {/* ✅ Success Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body className="text-center">
          <h4 style={{ color: "#007bff", fontWeight: "bold" }}>
            ✅ Report Generated Successfully!
          </h4>
          <p className="text-muted mt-2">
            Your PDF report has been downloaded.
          </p>
          <Button
            variant="primary"
            className="mt-3"
            onClick={() => setShowModal(false)}
          >
            OK
          </Button>
        </Modal.Body>
      </Modal>

      {/* CSS */}
      <style>{`
        .owner-summary-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #d8e9ff, #f2f7ff, #ffffff);
          font-family: 'Segoe UI', sans-serif;
          color: #003366;
          animation: bgShift 18s ease infinite;
          background-size: 200% 200%;
        }

        .header-card {
          text-align: center;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          padding: 25px;
          border-radius: 18px;
          box-shadow: 0 4px 20px rgba(0, 123, 255, 0.15);
          margin-bottom: 30px;
        }

        .filter-section {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-bottom: 30px;
        }

        .filter-btn {
          background: transparent;
          color: #007bff;
          border: 2px solid #007bff;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .filter-btn:hover,
        .filter-btn.active {
          background: linear-gradient(90deg, #007bff, #6cb5ff);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .income-card {
          background: rgba(255, 255, 255, 0.7);
          border-radius: 14px;
          padding: 15px 25px;
          box-shadow: 0 4px 16px rgba(0, 123, 255, 0.15);
          margin-bottom: 25px;
          text-align: center;
          color: #004e99;
          font-weight: 600;
        }

        .income-amount {
          font-size: 1.2rem;
          color: #007bff;
          font-weight: 700;
        }

        .chart-card {
          background: rgba(255, 255, 255, 0.85);
          border-radius: 18px;
          box-shadow: 0 8px 25px rgba(0, 123, 255, 0.15);
          padding: 25px;
          margin-bottom: 40px;
          text-align: center;
          transition: all 0.4s ease;
        }

        .chart-card:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 35px rgba(0, 123, 255, 0.25);
        }

        .chart-title {
          color: #007bff;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .chart-subtitle {
          color: #4a6fa5;
          font-size: 0.95rem;
          margin-bottom: 15px;
        }

        .custom-table thead {
          background: linear-gradient(90deg, #007bff, #6cb5ff);
          color: white;
        }

        .pdf-btn-container {
          display: flex;
          justify-content: center;
          margin-bottom: 40px;
        }

        .pdf-btn {
          background: linear-gradient(90deg, #007bff, #6cb5ff);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 12px 28px;
          font-weight: bold;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(0, 123, 255, 0.25);
        }

        .pdf-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0, 123, 255, 0.4);
        }

        @keyframes bgShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

export default OwnerBookingsSummary;
