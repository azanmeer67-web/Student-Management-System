import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

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

  // FETCH STUDENTS
  useEffect(() => {
    const fetchStudents = () => {
      axios
        .get(`${API}/api/students`)
        .then((res) => setStudents(res.data))
        .catch((err) => console.log(err));
    };

    fetchStudents();
  }, [API]);

  // HANDLE INPUT
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // SUBMIT (ADD / UPDATE)
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

    // UPDATE
    if (editId) {
      axios
        .put(`${API}/api/students/${editId}`, formData)
        .then(() => {
          setEditId(null);
          setFormData({ name: "", email: "", age: "", course: "" });
          setError("");
          refreshData();
        })
        .catch(() => setError("Update failed"));
    }

    // ADD
    else {
      axios
        .post(`${API}/api/students`, formData)
        .then(() => {
          setFormData({ name: "", email: "", age: "", course: "" });
          setError("");
          refreshData();
        })
        .catch(() => setError("Add failed"));
    }
  };

  // REFRESH DATA
  const refreshData = () => {
    axios
      .get(`${API}/api/students`)
      .then((res) => setStudents(res.data))
      .catch(() => console.log("Fetch failed"));
  };

  // DELETE
  const deleteStudent = (id) => {
    if (window.confirm("Delete this student?")) {
      axios
        .delete(`${API}/api/students/${id}`)
        .then(() => refreshData())
        .catch(() => setError("Delete failed"));
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

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2>🎓 SMS</h2>
        <p>Dashboard</p>
        <p>Students</p>
        <p>Add Student</p>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <h1>Dashboard 👋</h1>

        {/* ERROR MESSAGE */}
        {error && (
          <p style={{ color: "red", marginBottom: "10px" }}>
            {error}
          </p>
        )}

        {/* CARDS */}
        <div style={styles.cards}>
          <div style={styles.card}>Students: {students.length}</div>
          <div style={styles.card}>Courses: 4</div>
        </div>

        {/* FORM */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.form}
        >
          <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} style={styles.input} required />
          <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} style={styles.input} required />
          <input name="age" placeholder="Age" value={formData.age} onChange={handleChange} style={styles.input} required />
          <input name="course" placeholder="Course" value={formData.course} onChange={handleChange} style={styles.input} required />

          <button style={styles.btn}>
            {editId ? "Update" : "Add"}
          </button>
        </motion.form>

        {/* TABLE */}
        <motion.table
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.table}
        >
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
              <tr key={s._id} style={styles.row}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.age}</td>
                <td>{s.course}</td>
                <td>
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
        </motion.table>
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
  cards: {
    display: "flex",
    gap: "20px",
    margin: "20px 0"
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    flex: 1,
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
  },
  form: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
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
    borderRadius: "6px",
    cursor: "pointer"
  },
  table: {
    width: "100%",
    background: "#fff",
    borderRadius: "10px"
  },
  tableHeader: {
    background: "#4f46e5",
    color: "#fff"
  },
  row: {
    textAlign: "center",
    borderBottom: "1px solid #eee"
  },
  edit: {
    background: "#22c55e",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    marginRight: "5px",
    borderRadius: "5px",
    cursor: "pointer"
  },
  delete: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default App;