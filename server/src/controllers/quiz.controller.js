const QuizSession = require('../models/quizSession.model');
const Cricketer = require('../models/cricketer.model');
const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// Scoring logic based on attempts
const calculateScore = (attemptsUsed) => {
    switch(attemptsUsed) {
        case 1: return 10;
        case 2: return 7;
        case 3: return 5;
        default: return 0;
    }
};

// Helper to normalize player names for comparison
const normalizeName = (name) => {
    return name.toLowerCase().trim().replace(/[^a-z\s]/g, '');
};

// Helper to safely convert Map to object
const mapToObject = (mapOrObject) => {
    if (!mapOrObject) return {};
    if (mapOrObject instanceof Map) {
        return Object.fromEntries(mapOrObject);
    }
    return mapOrObject;
};

// 1️⃣ START QUIZ
module.exports.startQuiz = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { forceNew = false } = req.body;

    // Check if user has an active quiz
    const activeQuiz = await QuizSession.findOne({ userId, isCompleted: false });
    if (activeQuiz) {
        // If forceNew is true, auto-complete the old quiz and continue
        if (forceNew) {
            activeQuiz.isCompleted = true;
            activeQuiz.completedAt = new Date();
            await activeQuiz.save();
            
            // Update user stats for the abandoned quiz
            await User.findByIdAndUpdate(userId, {
                $inc: {
                    gamesPlayed: 1,
                    totalScore: activeQuiz.totalScore
                },
                $max: {
                    highestScore: activeQuiz.totalScore
                }
            });
        } else {
            // Return info about active quiz so frontend can handle it
            throw new ApiError(400, "You already have an active quiz. Please complete or exit it first.");
        }
    }

    // Randomly select ONE cricketer to start (endless mode)
    const cricketers = await Cricketer.aggregate([
        { $match: { isActive: true } },
        { $sample: { size: 1 } }
    ]);

    if (cricketers.length === 0) {
        throw new ApiError(404, "No cricketers available for quiz");
    }

    // Create quiz session with first round only
    const rounds = [{
        cricketerId: cricketers[0]._id,
        attemptsUsed: 0,
        attemptsLeft: 3,
        isCompleted: false,
        isWon: false,
        scoreAwarded: 0,
        guesses: []
    }];

    const quizSession = await QuizSession.create({
        userId,
        rounds,
        currentRoundIndex: 0,
        totalScore: 0,
        isCompleted: false
    });

    // Get first cricketer data (convert from aggregate result)
    const firstCricketer = cricketers[0];
    const currentRound = quizSession.rounds[0];

    // Return ONLY safe data (no correct answer, no hidden stats)
    return res.status(201).json(
        new ApiResponse(200, {
            quizSessionId: quizSession._id,
            roundNumber: 1,
            endlessMode: true,
            visibleStats: mapToObject(firstCricketer.visibleStats),
            imageHidden: firstCricketer.imageHidden,
            attemptsLeft: currentRound.attemptsLeft,
            totalScore: quizSession.totalScore
        }, "Quiz started successfully")
    );
});

// 2️⃣ SUBMIT GUESS
module.exports.submitGuess = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { quizSessionId, guessedPlayerName } = req.body;

    if (!guessedPlayerName || !guessedPlayerName.trim()) {
        throw new ApiError(400, "Player name is required");
    }

    // Find quiz session
    const quizSession = await QuizSession.findById(quizSessionId).populate('rounds.cricketerId');

    if (!quizSession) {
        throw new ApiError(404, "Quiz session not found");
    }

    // Validate ownership
    if (quizSession.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized access to quiz session");
    }

    // Check if quiz is already completed
    if (quizSession.isCompleted) {
        throw new ApiError(400, "Quiz session is already completed");
    }

    // Get current round
    const currentRound = quizSession.getCurrentRound();
    if (!currentRound) {
        throw new ApiError(400, "No active round found");
    }

    // Check if current round is already completed
    if (currentRound.isCompleted) {
        throw new ApiError(400, "Current round is already completed");
    }

    const cricketer = currentRound.cricketerId;
    const normalizedGuess = normalizeName(guessedPlayerName);
    const normalizedCorrect = normalizeName(cricketer.name);

    // Record the guess
    currentRound.guesses.push({ guess: guessedPlayerName });
    currentRound.attemptsUsed++;
    currentRound.attemptsLeft--;

    let responseData = {
        quizSessionId: quizSession._id,
        roundNumber: quizSession.currentRoundIndex + 1,
        totalRounds: quizSession.rounds.length
    };

    // ✅ CORRECT GUESS
    if (normalizedGuess === normalizedCorrect) {
        const score = calculateScore(currentRound.attemptsUsed);
        currentRound.isCompleted = true;
        currentRound.isWon = true;
        currentRound.scoreAwarded = score;
        quizSession.totalScore += score;

        // Move to next round - In endless mode, add a new random cricketer
        quizSession.moveToNextRound();
        
        // Get a random cricketer for next round (exclude recently played ones)
        const recentCricketerIds = quizSession.rounds.slice(-5).map(r => r.cricketerId);
        const nextCricketers = await Cricketer.aggregate([
            { 
                $match: { 
                    isActive: true,
                    _id: { $nin: recentCricketerIds }
                } 
            },
            { $sample: { size: 1 } }
        ]);

        // If we couldn't find a new cricketer (all have been used recently), allow repeats
        const nextCricketer = nextCricketers.length > 0 
            ? nextCricketers[0]
            : (await Cricketer.aggregate([
                { $match: { isActive: true } },
                { $sample: { size: 1 } }
            ]))[0];

        // Add new round
        quizSession.rounds.push({
            cricketerId: nextCricketer._id,
            attemptsUsed: 0,
            attemptsLeft: 3,
            isCompleted: false,
            isWon: false,
            scoreAwarded: 0,
            guesses: []
        });

        await quizSession.save();

        responseData.correct = true;
        responseData.scoreAwarded = score;
        responseData.totalScore = quizSession.totalScore;
        responseData.revealedData = {
            correctName: cricketer.name,
            imageRevealed: cricketer.imageRevealed,
            visibleStats: mapToObject(cricketer.visibleStats),
            hiddenStats: mapToObject(cricketer.hiddenStats),
            allStats: { ...mapToObject(cricketer.visibleStats), ...mapToObject(cricketer.hiddenStats) }
        };

        // In endless mode, always load next cricketer
        responseData.nextRound = {
            roundNumber: quizSession.currentRoundIndex + 1,
            visibleStats: mapToObject(nextCricketer.visibleStats),
            imageHidden: nextCricketer.imageHidden,
            attemptsLeft: 3,
            endlessMode: true
        };

        return res.status(200).json(
            new ApiResponse(200, responseData, "Correct guess!")
        );
    }

    // ❌ WRONG GUESS - Check if attempts exhausted (GAME OVER in endless mode)
    if (currentRound.attemptsLeft === 0) {
        currentRound.isCompleted = true;
        currentRound.isWon = false;
        currentRound.scoreAwarded = 0;

        // Mark quiz as completed (endless mode ends on failure)
        quizSession.isCompleted = true;
        quizSession.completedAt = new Date();
        await quizSession.save();

        responseData.correct = false;
        responseData.attemptsExhausted = true;
        responseData.scoreAwarded = 0;
        responseData.totalScore = quizSession.totalScore;
        responseData.revealedData = {
            correctName: cricketer.name,
            imageRevealed: cricketer.imageRevealed,
            visibleStats: mapToObject(cricketer.visibleStats),
            hiddenStats: mapToObject(cricketer.hiddenStats),
            allStats: { ...mapToObject(cricketer.visibleStats), ...mapToObject(cricketer.hiddenStats) }
        };

        // Update user stats (game over)
        await User.findByIdAndUpdate(userId, {
            $inc: {
                gamesPlayed: 1,
                totalScore: quizSession.totalScore
            },
            $max: {
                highestScore: quizSession.totalScore
            }
        });

        responseData.quizCompleted = true;
        responseData.gameOver = true;
        responseData.message = "❌ Game Over! Failed to guess the cricketer.";

        return res.status(200).json(
            new ApiResponse(200, responseData, "Game Over - All attempts exhausted")
        );
    }

    // ❌ WRONG GUESS - Still has attempts left
    await quizSession.save();

    responseData.correct = false;
    responseData.attemptsLeft = currentRound.attemptsLeft;
    responseData.totalScore = quizSession.totalScore;
    // Do NOT send hidden stats or correct answer

    return res.status(200).json(
        new ApiResponse(200, responseData, `Wrong guess! ${currentRound.attemptsLeft} attempts remaining.`)
    );
});

// 3️⃣ EXIT QUIZ (Manual)
module.exports.exitQuiz = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { quizSessionId } = req.body;

    const quizSession = await QuizSession.findById(quizSessionId);

    if (!quizSession) {
        throw new ApiError(404, "Quiz session not found");
    }

    if (quizSession.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized access to quiz session");
    }

    // If quiz is already completed, just return the results
    if (quizSession.isCompleted) {
        return res.status(200).json(
            new ApiResponse(200, {
                totalScore: quizSession.totalScore,
                roundsCompleted: quizSession.rounds.length,
                totalRounds: quizSession.rounds.length,
                alreadyCompleted: true
            }, "Quiz was already completed")
        );
    }

    // Mark quiz as completed
    quizSession.isCompleted = true;
    quizSession.completedAt = new Date();
    await quizSession.save();

    // Update user stats
    await User.findByIdAndUpdate(userId, {
        $inc: {
            gamesPlayed: 1,
            totalScore: quizSession.totalScore
        },
        $max: {
            highestScore: quizSession.totalScore
        }
    });

    // Calculate summary statistics
    const completedRounds = quizSession.rounds.filter(r => r.isCompleted).length;
    const wonRounds = quizSession.rounds.filter(r => r.isWon).length;
    const lostRounds = quizSession.rounds.filter(r => r.isCompleted && !r.isWon).length;

    return res.status(200).json(
        new ApiResponse(200, {
            totalScore: quizSession.totalScore,
            roundsCompleted: completedRounds,
            totalRounds: quizSession.rounds.length,
            roundsWon: wonRounds,
            roundsLost: lostRounds,
            accuracy: completedRounds > 0 ? Math.round((wonRounds / completedRounds) * 100) : 0,
            message: quizSession.currentRoundIndex >= quizSession.rounds.length 
                ? "🎉 Quiz completed!" 
                : "Quiz exited early. Your progress has been saved!"
        }, "Quiz exited successfully")
    );
});

// 4️⃣ GET QUIZ STATUS (for resuming)
module.exports.getQuizStatus = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const activeQuiz = await QuizSession.findOne({ userId, isCompleted: false })
        .populate('rounds.cricketerId');

    if (!activeQuiz) {
        return res.status(200).json(
            new ApiResponse(200, { hasActiveQuiz: false }, "No active quiz found")
        );
    }

    const currentRound = activeQuiz.getCurrentRound();
    const cricketer = currentRound.cricketerId;

    return res.status(200).json(
        new ApiResponse(200, {
            hasActiveQuiz: true,
            quizSessionId: activeQuiz._id,
            roundNumber: activeQuiz.currentRoundIndex + 1,
            totalRounds: activeQuiz.rounds.length,
            visibleStats: mapToObject(cricketer.visibleStats),
            imageHidden: cricketer.imageHidden,
            attemptsLeft: currentRound.attemptsLeft,
            totalScore: activeQuiz.totalScore
        }, "Active quiz found")
    );
});
