import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Routes, Route, Link } from "react-router-dom";

function App() {
  const API = process.env.REACT_APP_API_URL;

  const [students, setStudents] = useState([]);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    course: ""
  });

  // REFRESH DATA (same backend logic)
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

  // SUBMIT (same backend logic)
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
          setFormData({
            name: "",
            email: "",
            age: "",
            course: ""
          });
          setError("");
          refreshData();
        });
    } else {
      axios
        .post(`${API}/api/students`, formData)
        .then(() => {
          setFormData({
            name: "",
            email: "",
            age: "",
            course: ""
          });
          setError("");
          refreshData();
        });
    }
  };

  // DELETE (same backend logic)
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

  // Calculate Average Age for Dashboard
  const averageAge = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + Number(s.age || 0), 0) / students.length)
    : 0;

  // ================= PAGES =================

  const Dashboard = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Welcome Section */}
      <div style={styles.welcomeBox}>
        <h1 style={{ margin: 0, color: "#1e293b" }}>Dashboard 👋</h1>
        <p style={{ marginTop: "10px", color: "#64748b" }}>
          Welcome Back! Manage your student records easily.
        </p>
      </div>

      {/* Stats Cards */}
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

      {/* Recent Students Table */}
      <div style={styles.recentBox}>
        <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#1e293b" }}>Recent Students</h2>
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
            {/* Show only the 5 most recently added students */}
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
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          name="course"
          placeholder="Course"
          value={formData.course}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <button style={styles.btn}>
          {editId ? "Update" : "Add"}
        </button>
      </form>

      <div style={styles.recentBox}>
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
                  <button onClick={() => editStudent(s)} style={styles.edit}>
                    Edit
                  </button>
                  <button onClick={() => deleteStudent(s._id)} style={styles.delete}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={{ marginBottom: "30px", fontWeight: "bold" }}>🎓 SMS</h2>

        <Link to="/" style={styles.link}>
          Dashboard
        </Link>
        <Link to="/students" style={styles.link}>
          Students
        </Link>
        <Link to="/add" style={styles.link}>
          Add Student
        </Link>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <Routes>
          {/* ✅ FIX: Calling the components as functions here */}
          <Route path="/" element={Dashboard()} />
          <Route path="/students" element={StudentsPage()} />
          <Route path="/add" element={AddStudent()} />
        </Routes>
      </div>
    </div>
  );
}

/* STYLES */
const styles = {
  sidebar: {
    width: "240px",
    background: "linear-gradient(180deg, #4f46e5, #1e3a8a)",
    color: "white",
    padding: "30px 20px"
  },
  main: {
    flex: 1,
    padding: "40px",
    background: "#f4f6f9",
    overflowY: "auto"
  },
  link: {
    display: "block",
    color: "white",
    textDecoration: "none",
    margin: "15px 0",
    padding: "10px 15px",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.1)",
    fontWeight: "500",
    transition: "0.3s"
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
    gap: "20px",
    margin: "20px 0 30px 0",
    flexWrap: "wrap"
  },
  card: {
    flex: "1",
    minWidth: "180px",
    background: "#fff",
    padding: "25px 20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
    textAlign: "center"
  },
  cardTitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "15px",
    fontWeight: "500"
  },
  cardNumber: {
    fontSize: "32px",
    fontWeight: "bold",
    marginTop: "10px",
    marginBottom: 0,
    color: "#4f46e5"
  },
  recentBox: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
    overflowX: "auto"
  },
  form: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "25px",
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    boxShadow: "0 4px 10px rgba(0,0,0,0.03)"
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    flex: "1",
    minWidth: "160px",
    outline: "none"
  },
  btn: {
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left"
  },
  tableHeader: {
    background: "#4f46e5",
    color: "#fff"
  },
  th: {
    padding: "15px",
    fontWeight: "500"
  },
  tr: {
    borderBottom: "1px solid #f1f5f9"
  },
  td: {
    padding: "15px",
    color: "#334155"
  },
  badge: {
    background: "#f1f5f9",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "13px",
    border: "1px solid #e2e8f0"
  },
  edit: {
    background: "#22c55e",
    color: "#fff",
    marginRight: "8px",
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  delete: {
    background: "#ef4444",
    color: "#fff",
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }
};

export default App;