# StatPlay - Route Redirects Flow

This document explains how routes redirect after completing their actions.

## 📍 Route Redirect Flow

### 1. **User Registration** (`POST /api/v1/users/register`)
- **Action**: User submits registration form with profile picture
- **Process**: 
  - Creates user account
  - Generates email verification token
  - Sends verification email
- **Redirects to**: `/check-email` page
- **User sees**: Instructions to check their email inbox

---

### 2. **Check Email Page** (`GET /check-email`)
- **Purpose**: Inform user to check their email
- **Features**:
  - Shows verification instructions
  - Provides resend verification email form
  - Link to go back to login
- **Next step**: User clicks link in email

---

### 3. **Email Verification** (`GET /api/v1/users/verify-email/:token`)
- **Action**: User clicks verification link from email
- **Process**:
  - Validates token and expiry
  - Marks email as verified
  - Clears verification token
- **Redirects to**: Email verified success page (renders `email-verified.ejs`)
- **User sees**: Success message with button to login

---

### 4. **Resend Verification Email** (`POST /api/v1/users/resend-verification`)
- **Action**: User submits email to resend verification
- **Process**:
  - Validates user exists and email not verified
  - Generates new token
  - Sends new verification email
- **Redirects to**: `/check-email` page
- **User sees**: Same check email instructions

---

### 5. **User Login** (`POST /api/v1/users/login`)
- **Action**: User submits login credentials
- **Process**:
  - Validates credentials
  - Checks if email is verified
  - Generates access and refresh tokens
  - Sets cookies
- **Redirects to**: `/api/v1/users/profile` page
- **User sees**: Their profile page

---

### 6. **User Logout** (`POST /api/v1/users/logout`)
- **Action**: User clicks logout button
- **Process**:
  - Clears refresh token from database
  - Clears authentication cookies
- **Redirects to**: `/login` page
- **User sees**: Login form

---

### 7. **Profile Page** (`GET /api/v1/users/profile`)
- **Action**: Authenticated user accesses profile
- **Protected**: Requires JWT authentication
- **Shows**: User profile information

---

## 🗺️ Complete User Journey

```
1. User visits → / → Redirects to /login

2. New user clicks register → /register → Fills form → POST /api/v1/users/register
   ↓
   Redirects to /check-email → User checks email

3. User clicks email link → GET /api/v1/users/verify-email/:token
   ↓
   Shows email-verified.ejs with "Go to Login" button

4. User clicks login → /login → Submits form → POST /api/v1/users/login
   ↓
   Redirects to /api/v1/users/profile (if email verified)

5. User plays quizzes... then clicks logout → POST /api/v1/users/logout
   ↓
   Redirects to /login
```

---

## 🔐 Email Verification Check

- Login requires verified email (can be disabled by commenting out the check in `loginUser`)
- Unverified users get error: "Please verify your email before logging in"
- Users can resend verification email from `/check-email` page

---

## 🎨 View Templates

- `/login` → `views/login.ejs`
- `/register` → `views/register.ejs`
- `/check-email` → `views/check-email.ejs`
- Email verified → `views/email-verified.ejs`
- `/api/v1/users/profile` → `views/profile.ejs`

---

## ⚙️ Configuration

Make sure to set up email configuration in `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=StatPlay
```
