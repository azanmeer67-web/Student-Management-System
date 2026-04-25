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

  // ================= PAGES =================

  const Dashboard = () => (
    <>
      <h1>Dashboard 👋</h1>

      <div style={styles.cards}>
        <div style={styles.card}>
          Students: {students.length}
        </div>

        <div style={styles.card}>
          Courses: 4
        </div>
      </div>
    </>
  );

  const StudentsPage = () => (
    <>
      <h1>Students</h1>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <motion.form
        onSubmit={handleSubmit}
        style={styles.form}
      >
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
      </motion.form>

      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th>Name</th>
            <th>Email</th>
            <th>Age</th>
            <th>Course</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.age}</td>
              <td>{s.course}</td>
              <td>
                <button
                  onClick={() => editStudent(s)}
                  style={styles.edit}
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteStudent(s._id)}
                  style={styles.delete}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  const AddStudent = () => (
    <>
      <h1>Add Student</h1>
      <p>Use Students page to add/edit students.</p>
    </>
  );

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2>🎓 SMS</h2>

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
          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/students"
            element={<StudentsPage />}
          />

          <Route
            path="/add"
            element={<AddStudent />}
          />
        </Routes>
      </div>
    </div>
  );
}

/* STYLES */
const styles = {
  sidebar: {
    width: "220px",
    background: "linear-gradient(180deg,#4f46e5,#1e3a8a)",
    color: "white",
    padding: "20px"
  },

  main: {
    flex: 1,
    padding: "30px",
    background: "#f5f7fb"
  },

  link: {
    display: "block",
    color: "white",
    textDecoration: "none",
    margin: "10px 0"
  },

  cards: {
    display: "flex",
    gap: "20px",
    margin: "20px 0"
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px"
  },

  form: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
    display: "flex",
    gap: "10px"
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd"
  },

  btn: {
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px"
  },

  table: {
    width: "100%",
    background: "#fff"
  },

  tableHeader: {
    background: "#4f46e5",
    color: "#fff"
  },

  edit: {
    background: "green",
    color: "#fff",
    marginRight: "5px"
  },

  delete: {
    background: "red",
    color: "#fff"
  }
};

export default App;