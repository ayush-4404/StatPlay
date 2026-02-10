const mongoose = require('mongoose');

const cricketerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    imageHidden: {
        type: String,
        required: true,
        // URL to masked/blurred image
    },
    imageRevealed: {
        type: String,
        required: true,
        // URL to clear image
    },
    visibleStats: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: true,
        // Stats visible to user during guessing
        // Example: { "Matches Played": "200+", "Format": "All-Rounder" }
    },
    hiddenStats: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: true,
        // Stats revealed only after cricketer ends
        // Example: { "Debut Year": "2008", "Country": "India", "Best Score": "183" }
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Index for efficient random selection
cricketerSchema.index({ isActive: 1, difficulty: 1 });

module.exports = mongoose.model('Cricketer', cricketerSchema);
