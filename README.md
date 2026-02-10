# Cricket Quiz App

A full-stack cricket quiz application with user authentication, profile management, and interactive quizzes.

## 📁 Project Structure

```
Cricket_quiz_app/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── context/       # React context (Auth)
│   │   ├── pages/         # Page components
│   │   └── services/      # API service layer
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Express backend application
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── db/           # Database connection
│   │   ├── middlewares/  # Auth & multer middlewares
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── scripts/      # Database seed scripts
│   │   └── utils/        # Utility functions
│   ├── public/           # Static files & uploads
│   │   ├── images/      # Static images
│   │   └── temp/        # Temporary file uploads
│   ├── package.json
│   └── .env             # Environment variables
│
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Cricket_quiz_app
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   - Copy `.env.example` to `.env` in the server folder
   - Update the values with your configuration

### Running the Application

**Frontend and backend run independently on separate ports:**

#### ✅ Recommended: Run Separately (2 Terminals)

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```
Server runs on: **http://localhost:8000**

**Terminal 2 - Frontend Client:**
```bash
cd client
npm run dev
```
Client runs on: **http://localhost:3000**

---

#### Alternative: Run from Root Directory

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

## 🌐 Access Points

- **Frontend (React App):** http://localhost:3000
- **Backend (API Server):** http://localhost:8000
- **API Health Check:** http://localhost:8000/api/health

## 📋 Available Scripts

### Root Directory Commands
```bash
npm run install:all    # Install dependencies for both server & client
npm run install:server # Install only server dependencies
npm run install:client # Install only client dependencies
npm run server         # Start backend server (dev mode)
npm run client         # Start frontend client (dev mode)
npm run seed           # Seed database with cricket data
```

### Server Directory (`/server`)
```bash
npm run dev            # Start server with nodemon (auto-reload)
npm start              # Start server in production mode
npm run seed           # Seed cricketers data to MongoDB
```

### Client Directory (`/client`)
```bash
npm run dev            # Start Vite dev server
npm start              # Alias for dev
npm run build          # Build for production
npm run preview        # Preview production build
```

## 📚 API Documentation

See [QUIZ_GAME_DOCS.md](./QUIZ_GAME_DOCS.md) for detailed API documentation.

## 🔄 Route Redirects

See [ROUTE_REDIRECTS.md](./ROUTE_REDIRECTS.md) for routing information.

## 🧪 Features

- User authentication (register, login, email verification)
- Profile management with image upload
- Cricket quiz with random questions
- Score tracking and quiz sessions
- Protected routes

## 🛠️ Tech Stack

### Frontend
- React + Vite
- React Router
- Axios
- Context API

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (file uploads)
- Nodemailer (email verification)
- Cloudinary (image storage)

## 📝 License

ISC

## 👤 Author

Ayush
