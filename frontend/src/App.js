import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Routes, Route, Link } from "react-router-dom";

function App() {
  const API = process.env.REACT_APP_API_URL;

  // ✅ RESPONSIVE & SIDEBAR STATES
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  const [students, setStudents] = useState([]);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

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
      // Auto-hide menu on mobile, auto-open on desktop
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
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API]);

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
    if (window.confirm("Delete this student?")) {
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
  };

  // Calculate Average Age
  const averageAge = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + Number(s.age || 0), 0) / students.length)
    : 0;

  // Generate dynamic styles based on screen size
  const styles = getStyles(isMobile);

  // ================= PAGES =================

  const Dashboard = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={styles.welcomeBox}>
        <h1 style={{ margin: 0, color: "#1e293b" }}>Dashboard 👋</h1>
        <p style={{ marginTop: "10px", color: "#64748b" }}>
          Welcome Back! Manage your student records easily.
        </p>
      </div>

      <div style={styles.cards}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Total Students</h3>
          <p style={styles.cardNumber}>{students.length}</p>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Total Courses</h3>
          <p style={styles.cardNumber}>4</p>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Average Age</h3>
          <p style={styles.cardNumber}>{averageAge}</p>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>New Students</h3>
          <p style={styles.cardNumber}>Today</p>
        </div>
      </div>

      <div style={styles.recentBox}>
        <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#1e293b" }}>Recent Students</h2>
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
                  <td style={styles.td}>{s.name}</td>
                  <td style={styles.td}>{s.email}</td>
                  <td style={styles.td}>{s.age}</td>
                  <td style={styles.td}>
                    <span style={styles.badge}>{s.course}</span>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                    No students found.
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 style={{ color: "#1e293b", marginBottom: "20px" }}>Manage Students</h1>

      {error && (
        <p style={{ color: "red", background: "#fee2e2", padding: "10px", borderRadius: "6px" }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} style={styles.input} required />
        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} style={styles.input} required />
        <input name="age" placeholder="Age" value={formData.age} onChange={handleChange} style={styles.input} required />
        <input name="course" placeholder="Course" value={formData.course} onChange={handleChange} style={styles.input} required />
        <button style={styles.btn}>{editId ? "Update" : "Add"}</button>
      </form>

      <div style={styles.recentBox}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Age</th>
                <th style={styles.th}>Course</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} style={styles.tr}>
                  <td style={styles.td}>{s.name}</td>
                  <td style={styles.td}>{s.email}</td>
                  <td style={styles.td}>{s.age}</td>
                  <td style={styles.td}>{s.course}</td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => editStudent(s)} style={styles.edit}>Edit</button>
                      <button onClick={() => deleteStudent(s._id)} style={styles.delete}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const AddStudent = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 style={{ color: "#1e293b" }}>Add Student</h1>
      <p style={{ color: "#64748b" }}>Please use the <b>Students</b> page to add and edit student records.</p>
    </motion.div>
  );

  return (
    <div style={styles.appContainer}>
      
      {/* SIDEBAR (Only renders if sidebarOpen is true) */}
      {sidebarOpen && (
        <div style={styles.sidebar}>
          <h2 style={styles.logo}>🎓 SMS</h2>
          <div style={styles.navMenu}>
            <Link to="/" style={styles.link}>Dashboard</Link>
            <Link to="/students" style={styles.link}>Students</Link>
            <Link to="/add" style={styles.link}>Add</Link>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={styles.main}>
        {/* MENU TOGGLE BUTTON */}
        <div style={{ marginBottom: "20px" }}>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            style={styles.toggleMenuBtn}
          >
            {sidebarOpen ? "✖ Close Menu" : "☰ Open Menu"}
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

/* ✅ DYNAMIC STYLES FUNCTION */
const getStyles = (isMobile) => ({
  appContainer: {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    minHeight: "100vh",
    width: "100%"
  },
  sidebar: {
    width: isMobile ? "100%" : "240px",
    background: "linear-gradient(180deg, #4f46e5, #1e3a8a)",
    color: "white",
    padding: isMobile ? "15px" : "30px 20px",
    display: "flex",
    flexDirection: isMobile ? "column" : "column",
    boxSizing: "border-box",
    transition: "0.3s"
  },
  logo: {
    margin: isMobile ? "0 0 15px 0" : "0 0 30px 0",
    fontWeight: "bold",
    textAlign: isMobile ? "center" : "left"
  },
  navMenu: {
    display: "flex",
    flexDirection: isMobile ? "row" : "column",
    gap: "10px",
    justifyContent: isMobile ? "center" : "flex-start",
    flexWrap: "wrap"
  },
  link: {
    display: "block",
    color: "white",
    textDecoration: "none",
    padding: "10px 15px",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.1)",
    fontWeight: "500",
    transition: "0.3s",
    flex: isMobile ? "1" : "none",
    textAlign: "center",
    fontSize: isMobile ? "14px" : "16px",
    minWidth: isMobile ? "80px" : "auto"
  },
  main: {
    flex: 1,
    padding: isMobile ? "20px 15px" : "40px",
    background: "#f4f6f9",
    overflowX: "hidden",
    boxSizing: "border-box",
    width: "100%"
  },
  toggleMenuBtn: {
    background: "#fff",
    color: "#4f46e5",
    border: "1px solid #4f46e5",
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "0.2s"
  },
  welcomeBox: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "25px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.03)"
  },
  cards: {
    display: "flex",
    gap: "15px",
    marginBottom: "30px",
    flexWrap: "wrap"
  },
  card: {
    flex: isMobile ? "1 1 45%" : "1",
    minWidth: "140px",
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
    textAlign: "center"
  },
  cardTitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500"
  },
  cardNumber: {
    fontSize: isMobile ? "24px" : "32px",
    fontWeight: "bold",
    marginTop: "8px",
    marginBottom: 0,
    color: "#4f46e5"
  },
  recentBox: {
    background: "#fff",
    padding: isMobile ? "15px" : "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
    width: "100%",
    boxSizing: "border-box"
  },
  form: {
    background: "#fff",
    padding: isMobile ? "15px" : "25px",
    borderRadius: "12px",
    marginBottom: "25px",
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: "15px",
    flexWrap: "wrap",
    boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
    boxSizing: "border-box"
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    flex: "1",
    width: "100%",
    minWidth: isMobile ? "100%" : "160px",
    outline: "none",
    boxSizing: "border-box"
  },
  btn: {
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    width: isMobile ? "100%" : "auto"
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    minWidth: "500px" 
  },
  tableHeader: {
    background: "#4f46e5",
    color: "#fff"
  },
  th: {
    padding: "15px",
    fontWeight: "500",
    fontSize: "14px"
  },
  tr: {
    borderBottom: "1px solid #f1f5f9"
  },
  td: {
    padding: "15px",
    color: "#334155",
    fontSize: "14px"
  },
  badge: {
    background: "#f1f5f9",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    border: "1px solid #e2e8f0"
  },
  edit: {
    background: "#22c55e",
    color: "#fff",
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    flex: 1
  },
  delete: {
    background: "#ef4444",
    color: "#fff",
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    flex: 1
  }
});

export default App;