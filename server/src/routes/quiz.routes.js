const { Router } = require('express');
const { verifyJWT } = require('../middlewares/auth.middleware');
const {
    startQuiz,
    submitGuess,
    exitQuiz,
    getQuizStatus
} = require('../controllers/quiz.controller');

const router = Router();

// All quiz routes require authentication
router.use(verifyJWT);

// API endpoints
router.route('/start').post(startQuiz);
router.route('/guess').post(submitGuess);
router.route('/exit').post(exitQuiz);
router.route('/status').get(getQuizStatus);

module.exports = router;
