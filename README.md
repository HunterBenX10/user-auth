# User Authentication System

A secure and modular **user authentication API** built with **Node.js**, **Express**, **MongoDB**, **bcrypt**, and **JWT**, featuring **email verification** and **OTP-based login verification**.  
This project allows users to register, verify their email, log in securely, and optionally use OTP for extra security.

---

## 🚀 Features

- **User Registration** with hashed passwords using **bcrypt**
- **JWT Authentication** for secure login
- **Email Verification** to confirm new user accounts
- **OTP Verification** for two-factor authentication
- Input validation for required fields
- MongoDB integration via **Mongoose**
- Modular **MVC structure** (controllers, models, routes, utils)
- Easy to extend for additional authentication features

---

## 🧩 Tech Stack

- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB + Mongoose** - Database and ORM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - Token-based authentication
- **Nodemailer** - Sending verification emails
- **otp-generator** (or similar) - Generating one-time passwords

---

## 📦 Installation

# Clone the repository
git clone https://github.com/HunterBenX10/user-auth.git

# Navigate to the project folder
cd user-auth

# Install dependencies
npm install


⚙️ Environment Variables

Create a .env file in the root directory with:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
OTP_EXPIRY=5m

▶️ Running the Project
# Start the server
npm start

# OR start with nodemon for development
npm run dev

📡 API Endpoints
1. Register a New User

POST /api/auth/register

Body:

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "mypassword123"
}


Behavior:

Stores the user in MongoDB with hashed password

Sends a verification email with a unique token

2. Verify Email

GET /api/auth/verify-email?token=<email_verification_token>

Behavior:

Confirms the user’s email and activates the account

3. Login a User

POST /api/auth/login

Body:

{
  "email": "john@example.com",
  "password": "mypassword123"
}


Response:

{
  "success": true,
  "token": "your_jwt_token",
  "otp_required": true
}

4. Verify OTP

POST /api/auth/verify-otp

Body:

{
  "email": "john@example.com",
  "otp": "123456"
}


Behavior:

Confirms the OTP matches and is within expiry

Returns a success response or error if OTP is invalid/expired

✨ Author

Emmanuel Ben-Eboh

📌 Future Improvements

Add password reset functionality

Add role-based authentication

Implement rate-limiting to prevent brute-force attacks

Add unit tests for controllers and utilities
