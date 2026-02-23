const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: [true, 'Habit name is required'],
        trim: true,
        maxlength: 60,
    },
    timeSlot: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'anytime'],
        default: 'anytime',
    },
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
