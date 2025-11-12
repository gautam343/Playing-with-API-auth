// routes/employees.js
const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// validation
function validateEmployee(payload) {
  const { name, email, position, department, salary } = payload;
  if (!name || typeof name !== 'string') return 'name is required and must be a string';
  if (!email || typeof email !== 'string') return 'email is required and must be a string';
  if (!position || typeof position !== 'string') return 'position is required and must be a string';
  if (!department || typeof department !== 'string') return 'department is required and must be a string';
  if (salary === undefined || typeof salary !== 'number') return 'salary is required and must be a number';
  return null;
}

// CREATE
router.post('/', async (req, res) => {
  try {
    const err = validateEmployee(req.body);
    if (err) return res.status(400).json({ error: err });
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee.toJSON());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const list = await Employee.find().sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const e = await Employee.findById(req.params.id).lean();
    if (!e) return res.status(404).json({ error: 'Employee not found' });
    res.json(e);
  } catch {
    res.status(404).json({ error: 'Employee not found' });
  }
});

// UPDATE (PUT)
router.put('/:id', async (req, res) => {
  try {
    const err = validateEmployee(req.body);
    if (err) return res.status(400).json({ error: err });
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH (partial)
router.patch('/:id', async (req, res) => {
  try {
    const allowed = ['name','email','position','department','salary'];
    const payload = {};
    for (const k of allowed) if (req.body[k] !== undefined) payload[k] = req.body[k];
    if (Object.keys(payload).length === 0) return res.status(400).json({ error: 'No valid fields provided' });
    const updated = await Employee.findByIdAndUpdate(req.params.id, { $set: payload }, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Employee not found' });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
