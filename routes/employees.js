// routes/employees.js
const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Validation helper (simple)
function validateEmployee(payload) {
  const { name, email, position, department, salary } = payload;
  if (!name || typeof name !== 'string') return 'name is required and must be a string';
  if (!email || typeof email !== 'string') return 'email is required and must be a string';
  if (!position || typeof position !== 'string') return 'position is required and must be a string';
  if (!department || typeof department !== 'string') return 'department is required and must be a string';
  if (salary === undefined || typeof salary !== 'number') return 'salary is required and must be a number';
  return null;
}

// Create
router.post('/', async (req, res) => {
  try {
    const err = validateEmployee(req.body);
    if (err) return res.status(400).json({ error: err });

    const employee = new Employee(req.body);
    await employee.save();
    return res.status(201).json(employee.toJSON());
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Read all with optional query ?q=
router.get('/', async (req, res) => {
  try {
    const q = req.query.q ? String(req.query.q).toLowerCase() : null;
    const filter = {};
    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { name: re },
        { position: re },
        { department: re },
        { email: re }
      ];
    }
    const list = await Employee.find(filter).sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Read one
router.get('/:id', async (req, res) => {
  try {
    const e = await Employee.findById(req.params.id).lean();
    if (!e) return res.status(404).json({ error: 'Employee not found' });
    res.json(e);
  } catch (e) {
    console.error(e);
    res.status(404).json({ error: 'Employee not found' });
  }
});

// Replace (PUT)
router.put('/:id', async (req, res) => {
  try {
    const err = validateEmployee(req.body);
    if (err) return res.status(400).json({ error: err });

    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Partial update (PATCH)
router.patch('/:id', async (req, res) => {
  try {
    const allowed = ['name', 'email', 'position', 'department', 'salary'];
    const payload = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Employee not found' });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
