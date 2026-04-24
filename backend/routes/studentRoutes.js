const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// GET ALL
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// ADD
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    const exists = await Student.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const student = new Student(req.body);
    await student.save();

    res.json({ message: "Student added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { email } = req.body;

    const exists = await Student.findOne({
      email,
      _id: { $ne: req.params.id }
    });

    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    await Student.findByIdAndUpdate(req.params.id, req.body);

    res.json({ message: "Student updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;