const express = require("express");
const router = express.Router();

// ✅ FIXED PATH (IMPORTANT)
const db = require("../db.js");


// =====================
// GET ALL STUDENTS
// =====================
router.get("/", (req, res) => {
  db.query("SELECT * FROM students", (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
});


// =====================
// ADD STUDENT
// =====================
router.post("/", (req, res) => {
  const { name, email, age, course } = req.body;

  const checkSql = "SELECT * FROM students WHERE email = ?";

  db.query(checkSql, [email], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const insertSql =
      "INSERT INTO students (name, email, age, course) VALUES (?, ?, ?, ?)";

    db.query(insertSql, [name, email, age, course], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Database error" });
      }

      res.json({
        message: "Student added successfully",
        id: result.insertId,
      });
    });
  });
});


// =====================
// UPDATE STUDENT
// =====================
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { name, email, age, course } = req.body;

  const checkSql =
    "SELECT * FROM students WHERE email = ? AND id != ?";

  db.query(checkSql, [email, id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const updateSql =
      "UPDATE students SET name=?, email=?, age=?, course=? WHERE id=?";

    db.query(updateSql, [name, email, age, course, id], (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Database error" });
      }

      res.json({ message: "Student updated successfully" });
    });
  });
});


// =====================
// DELETE STUDENT
// =====================
router.delete("/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM students WHERE id=?", [id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ message: "Student deleted successfully" });
  });
});

module.exports = router;