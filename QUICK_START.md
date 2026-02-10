# 🚀 Quick Start Guide

## Running the Application

The frontend and backend are completely **separate** and run on different ports.

### 📋 Step-by-Step Instructions

#### 1️⃣ Start the Backend Server

Open Terminal 1:
```bash
cd server
npm run dev
```

✅ **Backend running on:** http://localhost:8000  
📊 **Health check:** http://localhost:8000/api/health

---

#### 2️⃣ Start the Frontend Client

Open Terminal 2:
```bash
cd client
npm run dev
```

✅ **Frontend running on:** http://localhost:3000

---

### 🎯 Quick Commands (from root)

```bash
# Backend only
npm run server

# Frontend only  
npm run client

# Install all dependencies
npm run install:all

# Seed database with cricket data
npm run seed
```

---

### 📝 Notes

- **Backend must be running** for frontend to work properly
- Backend serves API on port **8000**
- Frontend serves React app on port **3000**
- Both must be running simultaneously in separate terminals
- CORS is configured to allow localhost:3000 → localhost:8000 communication

---

### 🛠️ Individual Commands

#### Backend (from `/server` directory)
```bash
npm run dev      # Development mode with nodemon
npm start        # Production mode
npm run seed     # Seed database
```

#### Frontend (from `/client` directory)
```bash
npm run dev      # Development mode
npm run build    # Build for production
npm run preview  # Preview production build
```
