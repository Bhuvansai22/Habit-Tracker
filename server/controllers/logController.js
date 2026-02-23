const Log = require('../models/Log');

// GET /api/logs?from=YYYY-MM-DD&to=YYYY-MM-DD
const getLogs = async (req, res) => {
    try {
        const { from, to } = req.query;
        const query = { userId: req.user._id };
        if (from && to) query.date = { $gte: from, $lte: to };
        const logs = await Log.find(query);

        // Return as { "YYYY-MM-DD": { habitId: true/false } } for easy frontend use
        const formatted = {};
        logs.forEach((log) => {
            if (!formatted[log.date]) formatted[log.date] = {};
            formatted[log.date][log.habitId.toString()] = log.completed;
        });
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/logs/toggle  { habitId, date }
const toggleLog = async (req, res) => {
    try {
        const { habitId, date } = req.body;
        if (!habitId || !date)
            return res.status(400).json({ message: 'habitId and date are required' });

        const existing = await Log.findOne({ userId: req.user._id, habitId, date });

        if (existing) {
            // Toggle completed or delete if was true and now clicking again
            if (existing.completed) {
                await Log.deleteOne({ _id: existing._id });
                return res.json({ completed: false, deleted: true });
            } else {
                existing.completed = true;
                await existing.save();
                return res.json({ completed: true });
            }
        } else {
            const log = await Log.create({ userId: req.user._id, habitId, date, completed: true });
            return res.json({ completed: true, log });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getLogs, toggleLog };
