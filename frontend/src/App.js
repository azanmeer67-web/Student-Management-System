import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Routes, Route, Link, useLocation } from "react-router-dom";

function App() {
  const API = process.env.REACT_APP_API_URL;
  const location = useLocation();

  // ✅ RESPONSIVE & SIDEBAR STATES
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  const [students, setStudents] = useState([]);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ CARD SCANNER HOOK STATES
  const [uploading, setUploading] = useState(false);
  const [scanError, setScanError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    course: ""
  });

  // ✅ LISTEN FOR WINDOW RESIZING
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // REFRESH DATA
  const refreshData = () => {
    axios
      .get(`${API}/api/students`)
      .then((res) => setStudents(res.data))
      .catch(() => console.log("Fetch failed"));
  };

  // FETCH STUDENTS
  useEffect(() => {
    if (API) refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API]);

  // HANDLE FILE UPLOAD SCAN
  const handleCardUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setScanError("");
    setError("");

    const dataPayload = new FormData();
    dataPayload.append("cardImage", file);

    axios
      .post(`${API}/api/students/scan`, dataPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        setUploading(false);
        refreshData();
        alert(`Successfully scanned and verified UMT Student: ${res.data.name}`);
      })
      .catch((err) => {
        setUploading(false);
        const serverMessage = err.response?.data?.message || "Card verification processing failed.";
        setScanError(serverMessage);
      });
  };

  // HANDLE INPUT
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();

    const emailExists = students.some(
      (s) =>
        s.email.toLowerCase() === formData.email.toLowerCase() &&
        s._id !== editId
    );

    if (emailExists) {
      setError("Email already exists!");
      return;
    }

    if (editId) {
      axios
        .put(`${API}/api/students/${editId}`, formData)
        .then(() => {
          setEditId(null);
          setFormData({ name: "", email: "", age: "", course: "" });
          setError("");
          refreshData();
        });
    } else {
      axios
        .post(`${API}/api/students`, formData)
        .then(() => {
          setFormData({ name: "", email: "", age: "", course: "" });
          setError("");
          refreshData();
        });
    }
  };

  // DELETE
  const deleteStudent = (id) => {
    if (window.confirm("Delete this student permanently?")) {
      axios
        .delete(`${API}/api/students/${id}`)
        .then(() => refreshData());
    }
  };

  // EDIT
  const editStudent = (s) => {
    setFormData({
      name: s.name,
      email: s.email,
      age: s.age,
      course: s.course
    });
    setEditId(s._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter Students based on search term
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.course && s.course.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate Average Age
  const averageAge = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + Number(s.age || 0), 0) / students.length)
    : 0;

  // Unique Courses count
  const uniqueCourses = [...new Set(students.map((s) => s.course?.trim().toLowerCase()))].filter(Boolean).length;

  const styles = getStyles(isMobile);

  // ================= PAGES =================

  const Dashboard = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div style={styles.welcomeBox}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h1 style={{ margin: 0, color: "#0f172a", fontSize: isMobile ? "24px" : "30px", fontWeight: "800", letterSpacing: "-0.025em" }}>
              Welcome back, Admin 👋
            </h1>
            <p style={{ marginTop: "6px", marginBottom: 0, color: "#64748b", fontSize: "14px" }}>
              Here is a quick overview of your institution's metrics and data.
            </p>
          </div>
          <Link to="/students" style={styles.btnLink}>Manage Data</Link>
        </div>
      </div>

      {/* 🛡️ AI CARD SCANNING COMPONENT ENTRY */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.scannerContainer}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <span style={{ fontSize: "22px" }}>🛡️</span>
          <h3 style={{ margin: 0, color: "#0f172a", fontSize: "16px", fontWeight: "700" }}>
            AI Student Card Verification Gateway
          </h3>
        </div>
        <p style={{ color: "#64748b", fontSize: "13.5px", margin: "0 0 16px 0", lineHeight: "1.5" }}>
          Scan a student ID card image. The OCR system runs visual text stream extractions, maps student profiles dynamically, and strictly rejects any non-UMT card layouts.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleCardUpload} 
              id="card-scanner-upload" 
              style={{ display: "none" }}
              disabled={uploading}
            />
            <label 
              htmlFor="card-scanner-upload" 
              style={{
                ...styles.btn,
                background: uploading ? "#94a3b8" : "#4f46e5",
                cursor: uploading ? "not-allowed" : "pointer",
                margin: 0,
                textAlign: "center"
              }}
            >
              {uploading ? "Extracting & Verifying Text..." : "📸 Upload Card Front Image"}
            </label>
          </div>

          {scanError && (
            <motion.div 
              initial={{ opacity: 0, x: -5 }} 
              animate={{ opacity: 1, x: 0 }} 
              style={styles.scannerError}
            >
              ⚠️ {scanError}
            </motion.div>
          )}
        </div>
      </motion.div>

      <div style={styles.cards}>
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h3 style={styles.cardTitle}>Total Students</h3>
            <span style={{ fontSize: "20px" }}>👥</span>
          </div>
          <p style={styles.cardNumber}>{students.length}</p>
        </div>
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h3 style={styles.cardTitle}>Active Courses</h3>
            <span style={{ fontSize: "20px" }}>📚</span>
          </div>
          <p style={styles.cardNumber}>{uniqueCourses || 0}</p>
        </div>
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h3 style={styles.cardTitle}>Average Age</h3>
            <span style={{ fontSize: "20px" }}>⏳</span>
          </div>
          <p style={styles.cardNumber}>{averageAge}</p>
        </div>
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h3 style={styles.cardTitle}>New Enrollment</h3>
            <span style={{ fontSize: "20px" }}>✨</span>
          </div>
          <p style={styles.cardNumber}>Active</p>
        </div>
      </div>

      <div style={styles.recentBox}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: "18px", fontWeight: "700" }}>Recent Registrations</h2>
          <Link to="/students" style={{ color: "#4f46e5", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
            View all →
          </Link>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Age</th>
                <th style={styles.th}>Course</th>
              </tr>
            </thead>
            <tbody>
              {[...students].reverse().slice(0, 5).map((s) => (
                <tr key={s._id} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: "600", color: "#0f172a" }}>{s.name}</td>
                  <td style={styles.td}>{s.email}</td>
                  <td style={styles.td}>{s.age}</td>
                  <td style={styles.td}>
                    <span style={styles.badge}>{s.course}</span>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "14px" }}>
                    No students registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const StudentsPage = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div style={{ marginBottom: "25px" }}>
        <h1 style={{ color: "#0f172a", margin: 0, fontSize: isMobile ? "24px" : "30px", fontWeight: "800", letterSpacing: "-0.025em" }}>
          Student Registry
        </h1>
        <p style={{ marginTop: "6px", color: "#64748b", fontSize: "14px" }}>
          Add, modify, or delete your institution's active student records.
        </p>
      </div>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.errorBox}>
          ⚠️ {error}
        </motion.p>
      )}

      {/* SEARCH AND ADD FORM */}
      <div style={styles.formSection}>
        <h3 style={{ margin: "0 0 15px 0", color: "#0f172a", fontSize: "16px", fontWeight: "700" }}>
          {editId ? "✏️ Edit Student Details" : "➕ Register New Student"}
        </h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} style={styles.input} required />
          <input name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} style={styles.input} required />
          <input name="age" placeholder="Age" type="number" value={formData.age} onChange={handleChange} style={styles.input} required />
          <input name="course" placeholder="Course / Degree" value={formData.course} onChange={handleChange} style={styles.input} required />
          <div style={{ display: "flex", gap: "10px", width: isMobile ? "100%" : "auto" }}>
            <button style={styles.btn}>{editId ? "Update" : "Register"}</button>
            {editId && (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setFormData({ name: "", email: "", age: "", course: "" });
                  setError("");
                }}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* TABLE DATA LIST CARD */}
      <div style={styles.recentBox}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", background: "#f8fafc", padding: "10px 15px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <span style={{ color: "#94a3b8" }}>🔍</span>
          <input
            type="text"
            placeholder="Filter students by name, email, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "14px", color: "#334155" }}
          />
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Age</th>
                <th style={styles.th}>Course</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s._id} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: "600", color: "#0f172a" }}>{s.name}</td>
                  <td style={styles.td}>{s.email}</td>
                  <td style={styles.td}>{s.age}</td>
                  <td style={styles.td}>
                    <span style={styles.badge}>{s.course}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button onClick={() => editStudent(s)} style={styles.edit}>Edit</button>
                      <button onClick={() => deleteStudent(s._id)} style={styles.delete}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "35px", color: "#94a3b8", fontSize: "14px" }}>
                    No student records matching your query were found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const AddStudent = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div style={styles.welcomeBox}>
        <h1 style={{ color: "#0f172a", margin: "0 0 10px 0", fontSize: "24px", fontWeight: "800" }}>Manage Enrollment</h1>
        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
          Please head to the <b>Students</b> tab where you can add and modify student profiles directly in your registry.
        </p>
        <div style={{ marginTop: "20px" }}>
          <Link to="/students" style={styles.btnLink}>Go to Registry</Link>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div style={styles.appContainer}>
      {/* MODERN SIDEBAR */}
      {sidebarOpen && (
        <div style={styles.sidebar}>
          <div style={styles.logoWrapper}>
            <span style={{ fontSize: "24px" }}>🎓</span>
            <h2 style={styles.logo}>Portal</h2>
          </div>
          <div style={styles.navMenu}>
            <Link to="/" style={{ ...styles.link, background: location.pathname === "/" ? "rgba(255, 255, 255, 0.15)" : "transparent" }}>
              📊 Dashboard
            </Link>
            <Link to="/students" style={{ ...styles.link, background: location.pathname === "/students" ? "rgba(255, 255, 255, 0.15)" : "transparent" }}>
              👥 Students
            </Link>
            <Link to="/add" style={{ ...styles.link, background: location.pathname === "/add" ? "rgba(255, 255, 255, 0.15)" : "transparent" }}>
              ✨ Add New
            </Link>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT SECTION */}
      <div style={styles.main}>
        <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "24px" }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.toggleMenuBtn}>
            {sidebarOpen ? "✕ Minimize" : "☰ Sidebar Menu"}
          </button>
        </div>

        <Routes>
          <Route path="/" element={Dashboard()} />
          <Route path="/students" element={StudentsPage()} />
          <Route path="/add" element={AddStudent()} />
        </Routes>
      </div>
    </div>
  );
}

/* ✅ ENHANCED VISUAL SYSTEM WITH NEW SCANNER CLASSES */
const getStyles = (isMobile) => ({
  appContainer: {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    minHeight: "100vh",
    width: "100%",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    background: "#f8fafc"
  },
  sidebar: {
    width: isMobile ? "100%" : "260px",
    background: "linear-gradient(135deg, #1e1b4b, #312e81)",
    color: "white",
    padding: isMobile ? "16px" : "32px 20px",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    borderRight: "1px solid rgba(255, 255, 255, 0.1)"
  },
  logoWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: isMobile ? "16px" : "36px",
    justifyContent: isMobile ? "center" : "flex-start"
  },
  logo: {
    margin: 0,
    fontWeight: "800",
    fontSize: "20px",
    letterSpacing: "-0.03em",
    color: "#fff"
  },
  navMenu: {
    display: "flex",
    flexDirection: isMobile ? "row" : "column",
    gap: "8px",
    justifyContent: isMobile ? "center" : "flex-start",
    flexWrap: "wrap"
  },
  link: {
    display: "block",
    color: "white",
    textDecoration: "none",
    padding: "12px 16px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: isMobile ? "13px" : "15px",
    transition: "all 0.2s ease",
    flex: isMobile ? "1" : "none",
    textAlign: isMobile ? "center" : "left",
    minWidth: isMobile ? "85px" : "auto"
  },
  main: {
    flex: 1,
    padding: isMobile ? "16px" : "40px",
    background: "#f8fafc",
    overflowX: "hidden",
    boxSizing: "border-box",
    width: "100%"
  },
  toggleMenuBtn: {
    background: "#ffffff",
    color: "#334155",
    border: "1px solid #e2e8f0",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  welcomeBox: {
    background: "#ffffff",
    padding: isMobile ? "20px" : "28px",
    borderRadius: "16px",
    marginBottom: "28px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
    border: "1px solid #e2e8f0"
  },
  scannerContainer: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "16px",
    marginBottom: "28px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
    border: "1px solid #e2e8f0"
  },
  scannerError: {
    padding: "12px 16px",
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fee2e2",
    borderRadius: "10px",
    fontSize: "13.5px",
    fontWeight: "500"
  },
  cards: {
    display: "flex",
    gap: "16px",
    marginBottom: "32px",
    flexWrap: "wrap"
  },
  card: {
    flex: isMobile ? "1 1 45%" : "1",
    minWidth: "160px",
    background: "#ffffff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
    border: "1px solid #e2e8f0",
    transition: "transform 0.2s ease",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  cardTitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  cardNumber: {
    fontSize: isMobile ? "28px" : "36px",
    fontWeight: "800",
    marginTop: "8px",
    marginBottom: 0,
    color: "#4f46e5",
    letterSpacing: "-0.04em"
  },
  recentBox: {
    background: "#ffffff",
    padding: isMobile ? "20px" : "28px",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
    width: "100%",
    border: "1px solid #e2e8f0",
    boxSizing: "border-box"
  },
  formSection: {
    background: "#ffffff",
    padding: isMobile ? "20px" : "28px",
    borderRadius: "16px",
    marginBottom: "28px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
    border: "1px solid #e2e8f0",
    boxSizing: "border-box"
  },
  form: {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: "12px",
    flexWrap: "wrap",
    boxSizing: "border-box"
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    flex: "1",
    width: "100%",
    minWidth: isMobile ? "100%" : "175px",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "14px",
    color: "#0f172a",
    transition: "border 0.2s ease"
  },
  btn: {
    background: "#4f46e5",
    color: "#ffffff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    width: isMobile ? "100%" : "auto",
    fontSize: "14px",
    boxShadow: "0 1px 2px rgba(79, 70, 229, 0.15)",
    transition: "all 0.2s ease"
  },
  cancelBtn: {
    background: "#ffffff",
    color: "#475569",
    border: "1px solid #e2e8f0",
    padding: "12px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s ease"
  },
  btnLink: {
    display: "inline-block",
    background: "#4f46e5",
    color: "#ffffff",
    textDecoration: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
    textAlign: "center",
    transition: "all 0.2s ease"
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    textAlign: "left",
    minWidth: "500px"
  },
  tableHeader: {
    background: "#f8fafc",
    color: "#475569"
  },
  th: {
    padding: "16px 20px",
    fontWeight: "600",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #e2e8f0"
  },
  tr: {
    transition: "background 0.15s ease"
  },
  td: {
    padding: "16px 20px",
    color: "#334155",
    fontSize: "14px",
    borderBottom: "1px solid #f1f5f9"
  },
  badge: {
    background: "#eef2ff",
    color: "#4338ca",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.01em",
    display: "inline-block"
  },
  edit: {
    background: "#f0fdf4",
    color: "#166534",
    padding: "6px 14px",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    transition: "all 0.2s ease",
    flex: 1
  },
  delete: {
    background: "#fef2f2",
    color: "#991b1b",
    padding: "6px 14px",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    transition: "all 0.2s ease",
    flex: 1
  },
  errorBox: {
    color: "#991b1b",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "20px"
  }
});

export default App;