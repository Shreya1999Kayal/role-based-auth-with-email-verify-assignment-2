# 🔐 Role-Based Authentication System with Email OTP Verification

## 📌 Project Overview

This project is a secure authentication system built using Express.js and MongoDB.
It supports user registration, email OTP verification, login, and role-based access control (RBAC).

---

## Features

* User Registration with Email OTP Verification
* Secure Login with JWT Authentication
* Role-Based Access Control (Admin/User)
* Protected Routes using Middleware
* OTP Expiry (5 minutes)
* Handles invalid or expired OTP
* Deletes old OTPs before generating new ones
* Logout functionality
* Secure password hashing using bcrypt
* Resend OTP functionality

---

## Tech Stack

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT (jsonwebtoken)
* Nodemailer (Email OTP)
* bcryptjs (Password hashing)

---

## Setup Instructions

### 1. Clone the Repository

```
git clone 
cd role-based-auth-assignment-2
```

### 2. Install Dependencies

```
npm install bcryptjs cookie-parser dotenv express helmet jsonwebtoken mongoose morgan nodemailer nodemon
```

### 3. Create `.env` File

Create a `.env` file in the root folder and add:

```env
PORT=3000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET_KEY=your_secret_key

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com

```
### 4. 🔑 Environment Variables Template

A sample environment file is provided as `.env.example`.

Copy it to create your own `.env` file:

```
cp .env.example .env
```

### 5. Run the Server

Development:

```
npm run dev
```

Production:

```
npm start
```

---

## 📬 API Endpoints (Tested with Postman)

1. POST  http://localhost:3775/api/v1/register

Request:

{
  "name": "Sulokna Dey",
  "email": "sulokna@yopmail.com",
  "password":"123456789",
  "role":"user"
}

Response:

{
    "success": true,
    "message": "User has registered successfully and otp sent to your email. Please verify your email. ",
    "data": {
        "id": "69d74408ad07f9a715b51ae2",
        "name": "Sulokna Dey",
        "email": "sulokna@yopmail.com"
    }
}

2. POST  http://localhost:3775/api/v1/verify

Request:

{
    "email": "sulokna@yopmail.com",
    "otp":"190518"
}

Response:

{
    "status": true,
    "message": "Email verified successfully"
}

3. POST http://localhost:3775/api/v1/login

Request:

{
    "email": "sulokna@yopmail.com",
    "password":"123456789"
}

Response:

{
    "success": true,
    "message": "user login successfully",
    "data": {
        "id": "69d74408ad07f9a715b51ae2",
        "name": "Sulokna Dey",
        "email": "sulokna@yopmail.com",
        "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDc0NDA4YWQwN2Y5YTcxNWI1MWFlMiIsIm5hbWUiOiJTdWxva25hIERleSIsImVtYWlsIjoic3Vsb2tuYUB5b3BtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzc1NzE2MTUyLCJleHAiOjE3NzU3MTk3NTJ9.luOwcisl5-Oj2zxrMGjp8SIQSwXOFX5JEvJ4uAqvgXs"
}

4. GET http://localhost:3775/api/v1/dashboard

    Token is put in Authorization header.  

Response:

{
    "success": true,
    "message": "Welcome User. Helllo Sulokna Dey. ",
    "user": {
        "id": "69d74408ad07f9a715b51ae2",
        "name": "Sulokna Dey",
        "email": "sulokna@yopmail.com",
        "role": "user"
    }
}

5. GET http://localhost:3775/api/v1/dashboard/admin

   Token is put in Authorization header.

Response:

{
    "success": false,
    "message": "Role (user) not allowed to access this resource"
}

6. GET  http://localhost:3775/api/v1/dashboard/user 

   Token is put in Authorization header.

Response:

{
    "success": true,
    "message": "Welcome User. Helllo Sulokna Dey. ",
    "user": {
        "id": "69d74408ad07f9a715b51ae2",
        "name": "Sulokna Dey",
        "email": "sulokna@yopmail.com",
        "role": "user"
    }
}

7. POST http://localhost:3775/api/v1/resend-otp

Request:

{
   "email": "sulokna@yopmail.com"
}

Response:

{
  "success": true,
  "message": "New OTP sent to your email"
}

8. POST http://localhost:3775/api/v1/logout

    Token is put in Authorization header.

Response:
{
    "success": true,
    "message": "Logged out successfully"
}

## 🔐 Authentication

* JWT Token is generated on login
* Token is stored in **HTTP-only cookies**
* Used for accessing protected routes

---

## 🧠 Project Structure

```
project/
│
├── config/        # DB & Email config
├── controllers/   # Business logic
├── models/        # Mongoose schemas
├── routes/        # API routes
├── middleware/    # Auth & RBAC middleware
├── utils/         # Email/OTP logic
├── app.js         # Entry point
└── .env           # Environment variables
```

---

## ⚠️ Important Notes

* OTP expires in 5 minutes
* Users must verify email before login
* JWT is required for protected routes
* Roles supported: **user, admin**

---

## 👩‍💻 Author

Shreya Kayal

---
