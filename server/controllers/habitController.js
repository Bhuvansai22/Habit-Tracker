const Habit = require('../models/Habit');
const Log = require('../models/Log');

// GET /api/habits
const getHabits = async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: 1 });
        res.json(habits);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/habits
const createHabit = async (req, res) => {
    try {
        const { name, timeSlot } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });
        const habit = await Habit.create({ userId: req.user._id, name, timeSlot });
        res.status(201).json(habit);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/habits/:id
const updateHabit = async (req, res) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
        if (!habit) return res.status(404).json({ message: 'Habit not found' });

        const { name, timeSlot } = req.body;
        if (name) habit.name = name;
        if (timeSlot) habit.timeSlot = timeSlot;
        await habit.save();
        res.json(habit);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/habits/:id
const deleteHabit = async (req, res) => {
    try {
        const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!habit) return res.status(404).json({ message: 'Habit not found' });
        // Remove all logs for this habit
        await Log.deleteMany({ habitId: req.params.id, userId: req.user._id });
        res.json({ message: 'Habit deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getHabits, createHabit, updateHabit, deleteHabit };
