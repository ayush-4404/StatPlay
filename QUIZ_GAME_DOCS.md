# Cricket Quiz Game - StatPlay

## 🎮 Quiz System Documentation

### Overview
A secure, backend-driven cricket quiz game where users guess cricketers based on masked images and visible stats.

---

## 📁 Files Created

### Models
- `src/models/cricketer.model.js` - Cricketer schema with stats and images
- `src/models/quizSession.model.js` - Quiz session with rounds and scoring

### Controllers
- `src/controllers/quiz.controller.js` - All quiz logic (start, guess, exit, status)

### Routes
- `src/routes/quiz.routes.js` - Quiz API endpoints

### Views
- `views/quiz.ejs` - Interactive quiz interface

### Scripts
- `src/scripts/seedCricketers.js` - Seed sample cricketers for testing

---

## 🎯 Game Rules

### Quiz Flow
1. User starts a quiz with 5 random cricketers
2. Each cricketer has 3 attempts maximum
3. User keeps guessing the same cricketer until correct or attempts exhausted
4. Quiz moves to next cricketer automatically
5. Quiz ends when all cricketers are completed

### Scoring
- **1st attempt correct**: 10 points ⭐⭐⭐
- **2nd attempt correct**: 7 points ⭐⭐
- **3rd attempt correct**: 5 points ⭐
- **Failed (all attempts used)**: 0 points ❌

### User Stats Update
- Stats updated ONLY when quiz session ends
- `gamesPlayed` += 1
- `totalScore` += quiz total score
- `highestScore` = max(current, quiz score)

---

## 🔐 Security Features

✅ **No answer leakage**: Correct names and hidden stats never sent to frontend until round ends  
✅ **Backend validation**: All quiz logic runs server-side  
✅ **Ownership checks**: Users can only access their own quizzes  
✅ **Completed quiz protection**: Can't reuse or modify completed quizzes  
✅ **Authentication required**: All quiz routes protected with JWT  

---

## 🛣️ API Endpoints

### 1. Start Quiz
```
POST /quiz/start
Auth: Required
Body: { numberOfPlayers: 5 }

Response:
{
  "quizSessionId": "...",
  "roundNumber": 1,
  "totalRounds": 5,
  "visibleStats": { ... },
  "imageHidden": "url",
  "attemptsLeft": 3,
  "totalScore": 0
}
```

### 2. Submit Guess
```
POST /quiz/guess
Auth: Required
Body: { quizSessionId: "...", guessedPlayerName: "..." }

Response (Wrong - Attempts Left):
{
  "correct": false,
  "attemptsLeft": 2,
  "totalScore": 0
}

Response (Correct):
{
  "correct": true,
  "scoreAwarded": 10,
  "totalScore": 10,
  "revealedData": {
    "correctName": "...",
    "imageRevealed": "url",
    "hiddenStats": { ... }
  },
  "nextRound": { ... } or "quizCompleted": true
}
```

### 3. Exit Quiz
```
POST /quiz/exit
Auth: Required
Body: { quizSessionId: "..." }

Response:
{
  "totalScore": 25,
  "roundsCompleted": 3,
  "totalRounds": 5
}
```

### 4. Get Quiz Status
```
GET /quiz/status
Auth: Required

Response:
{
  "hasActiveQuiz": true,
  "quizSessionId": "...",
  "roundNumber": 2,
  ...
}
```

### 5. View Quiz Page
```
GET /quiz
Auth: Required
Returns: EJS page with quiz interface
```

---

## 🚀 Setup Instructions

### 1. Seed Sample Cricketers
```bash
node src/scripts/seedCricketers.js
```

This will add 8 sample cricketers with placeholder images.

### 2. Update Images (Production)
Replace placeholder images in `seedCricketers.js` with real images:
- Use Cloudinary or another image service
- `imageHidden`: Blurred/masked version
- `imageRevealed`: Clear image

### 3. Add More Cricketers
You can add cricketers directly in MongoDB or create more seed scripts.

---

## 🎨 Frontend (EJS)

The quiz interface (`views/quiz.ejs`) includes:
- **Start screen** with rules
- **Quiz screen** with:
  - Cricketer image (masked initially)
  - Visible stats grid
  - Attempts indicator (3 dots)
  - Guess input with validation
  - Score board
  - Round counter
- **Result screen** after completion
- **Auto-progression** to next cricketer
- **Responsive design**

---

## 🧪 Testing the Quiz

1. **Login** to your account
2. Go to **Profile** and click "Play Cricket Quiz"
3. Click **Start Quiz**
4. Try guessing cricketers:
   - Correct guess → See revealed stats → Auto move to next
   - Wrong guess → Attempts decrease → Try again
   - Exhausted attempts → See answer → Auto move to next
5. Complete all rounds or **Exit Quiz** anytime
6. Check updated stats in your profile

---

## 📊 Data Flow

```
User Action → Frontend (EJS + JS)
     ↓
API Request (fetch)
     ↓
Backend Controller (quiz.controller.js)
     ↓
Quiz Logic & Validation
     ↓
Database Update (MongoDB)
     ↓
Response (only safe data)
     ↓
Frontend Update
```

---

## 🔧 Customization

### Change Number of Players
In `views/quiz.ejs`, modify:
```javascript
body: JSON.stringify({ numberOfPlayers: 10 }) // Change from 5 to 10
```

### Change Scoring
In `src/controllers/quiz.controller.js`, modify `calculateScore()`:
```javascript
const calculateScore = (attemptsUsed) => {
    switch(attemptsUsed) {
        case 1: return 15; // Change from 10
        case 2: return 10; // Change from 7
        case 3: return 5;  // Keep same
        default: return 0;
    }
};
```

### Add Difficulty Levels
In quiz start, filter by difficulty:
```javascript
const cricketers = await Cricketer.aggregate([
    { $match: { isActive: true, difficulty: 'hard' } },
    { $sample: { size: numberOfPlayers } }
]);
```

---

## 📝 Notes

- Quiz sessions are saved in database
- Users can only have ONE active quiz at a time
- Incomplete quizzes can be resumed
- All quiz logic is backend-driven for security
- Frontend only displays data and collects input

---

## 🐛 Troubleshooting

**No cricketers showing?**  
→ Run seed script: `node src/scripts/seedCricketers.js`

**Can't start quiz?**  
→ Check if you have an active quiz, exit it first

**Images not loading?**  
→ Update image URLs in seed data with real image links

**Stats not updating?**  
→ Complete or exit quiz for stats to update

---

## 🎯 Next Steps

1. ✅ Add real cricketer images (use Cloudinary)
2. ✅ Create admin panel to add/edit cricketers
3. ✅ Add leaderboard functionality
4. ✅ Add quiz history view
5. ✅ Add hints system (cost coins)
6. ✅ Add difficulty selection
7. ✅ Add timer per question
8. ✅ Add multiplayer mode

---

Enjoy your cricket quiz game! 🏏🎉
