import React, { useEffect, useState } from "react";
import axios from "axios";

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
  const fetchStudents = () => {
    axios
      .get(`${API}/api/students`)
      .then((res) => setStudents(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

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
      alert("❌ Email already exists!");
      return;
    }

    // UPDATE
    if (editId) {
      axios
        .put(`${API}/api/students/${editId}`, formData)
        .then(() => {
          fetchStudents();
          setEditId(null);
          setFormData({ name: "", email: "", age: "", course: "" });
          setError("");
          alert("Student updated successfully");
        })
        .catch((err) => {
          const msg =
            err.response?.data?.message ||
            err.response?.data?.error ||
            "Something went wrong";

          setError(msg);
          alert(msg);
        });
    }

    // ADD
    else {
      axios
        .post(`${API}/api/students`, formData)
        .then(() => {
          fetchStudents();
          setFormData({ name: "", email: "", age: "", course: "" });
          setError("");
          alert("Student added successfully");
        })
        .catch((err) => {
          const msg =
            err.response?.data?.message ||
            err.response?.data?.error ||
            "Something went wrong";

          setError(msg);
          alert(msg);
        });
    }
  };

  // DELETE
  const deleteStudent = (id) => {
    if (window.confirm("Are you sure?")) {
      axios
        .delete(`${API}/api/students/${id}`)
        .then(() => fetchStudents())
        .catch(() => alert("Delete failed"));
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
    <div style={styles.container}>
      <h1 style={styles.title}>Student Management System</h1>

      {error && <p style={styles.error}>{error}</p>}

      {/* FORM */}
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

        <button type="submit" style={styles.primaryBtn}>
          {editId ? "Update Student" : "Add Student"}
        </button>
      </form>

      {/* TABLE */}
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
            <tr key={s._id} style={styles.row}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.age}</td>
              <td>{s.course}</td>
              <td>
                <button onClick={() => editStudent(s)} style={styles.editBtn}>
                  Edit
                </button>
                <button
                  onClick={() => deleteStudent(s._id)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* STYLES */
const styles = {
  container: {
    minHeight: "100vh",
    background: "#f4f6f9",
    padding: "40px 20px",
    fontFamily: "Segoe UI, sans-serif"
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#2c3e50"
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: "15px",
    fontWeight: "bold"
  },
  form: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    marginBottom: "30px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    flex: "1",
    minWidth: "160px"
  },
  primaryBtn: {
    padding: "12px 20px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
  },
  tableHeader: {
    background: "#007bff",
    color: "#fff"
  },
  row: {
    textAlign: "center",
    borderBottom: "1px solid #eee"
  },
  editBtn: {
    marginRight: "5px",
    padding: "6px 12px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  deleteBtn: {
    padding: "6px 12px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default App;