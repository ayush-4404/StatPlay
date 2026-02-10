const mongoose = require('mongoose');

const quizSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    rounds: [{
        cricketerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cricketer',
            required: true
        },
        attemptsUsed: {
            type: Number,
            default: 0,
            min: 0,
            max: 3
        },
        attemptsLeft: {
            type: Number,
            default: 3,
            min: 0,
            max: 3
        },
        isCompleted: {
            type: Boolean,
            default: false
        },
        isWon: {
            type: Boolean,
            default: false
        },
        scoreAwarded: {
            type: Number,
            default: 0,
            min: 0
        },
        guesses: [{
            guess: String,
            timestamp: {
                type: Date,
                default: Date.now
            }
        }]
    }],
    currentRoundIndex: {
        type: Number,
        default: 0,
        min: 0
    },
    totalScore: {
        type: Number,
        default: 0,
        min: 0
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    }
}, { timestamps: true });

// Index for finding active quizzes
quizSessionSchema.index({ userId: 1, isCompleted: 1 });

// Method to get current round
quizSessionSchema.methods.getCurrentRound = function() {
    return this.rounds[this.currentRoundIndex];
};

// Method to check if quiz has more rounds
quizSessionSchema.methods.hasMoreRounds = function() {
    return this.currentRoundIndex < this.rounds.length;
};

// Method to move to next round
quizSessionSchema.methods.moveToNextRound = function() {
    this.currentRoundIndex++;
    if (!this.hasMoreRounds()) {
        this.isCompleted = true;
        this.completedAt = new Date();
    }
};

module.exports = mongoose.model('QuizSession', quizSessionSchema);
