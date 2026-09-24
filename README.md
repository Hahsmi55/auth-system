# Authentication System

A production-style authentication system built with **Node.js, Express.js, MongoDB, Mongoose, Redis, and JWT**.

This project focuses on implementing a secure and scalable authentication architecture rather than building a large application around it.

## Features

### Authentication

* User registration
* User login
* User logout
* JWT-based authentication
* JWT stored in HTTP cookies
* Access token + refresh token architecture
* Refresh token rotation
* Password hashing with bcrypt
* Password reset / forgot password
* Password update
* User profile
* OTP generation and sending
* Google login using OpenID Connect

### Authorization & Middleware

* Authentication middleware
* `isLoggedIn` middleware
* Protected routes
* JWT verification

### Security

* Password hashing with bcrypt
* HTTP security headers with Helmet
* CORS configuration
* HTTP-only cookies for authentication tokens
* Refresh token rotation
* Input handling and authentication flow designed with security in mind

### Infrastructure

* MongoDB for persistent user data
* Mongoose for MongoDB object modeling
* Redis for authentication-related temporary/stateful data
* MVC architecture

---

## Tech Stack

| Technology            | Purpose                              |
| --------------------- | ------------------------------------ |
| Node.js               | Runtime                              |
| Express.js            | Web framework                        |
| MongoDB               | Database                             |
| Mongoose              | MongoDB ODM                          |
| Redis                 | Fast temporary/stateful data storage |
| JWT                   | Authentication tokens                |
| Cookies               | Token transport/storage              |
| bcrypt                | Password hashing                     |
| Helmet                | HTTP security headers                |
| CORS                  | Cross-origin request handling        |
| Google OpenID Connect | Google authentication                |
| MVC                   | Application architecture             |

---

## Architecture

The application follows the **MVC (Model-View-Controller)** architecture.

```text
                    Client
                      │
                      ▼
                 Express Server
                      │
                 Middleware
                      │
          ┌───────────┴───────────┐
          │                       │
     Authentication          Authorization
       Middleware              Middleware
          │                       │
          └───────────┬───────────┘
                      ▼
                  Controllers
                      │
                      ▼
                   Models
                  /      \
                 ▼        ▼
             MongoDB     Redis
```

The authentication flow uses JWT access and refresh tokens, with refresh-token rotation to reduce the risk associated with stolen refresh tokens.

---

## Authentication Flow

### Registration

```text
Client
  │
  │ POST /auth/register
  ▼
Express
  │
  ▼
Validate user data
  │
  ▼
Hash password with bcrypt
  │
  ▼
Save user → MongoDB
  │
  ▼
Generate authentication tokens
  │
  ▼
Set tokens in cookies
  │
  ▼
Response
```

### Login

```text
Client
  │
  │ POST /auth/login
  ▼
Find user
  │
  ▼
Compare password with bcrypt
  │
  ▼
Generate access + refresh tokens
  │
  ▼
Store required refresh-token state → Redis
  │
  ▼
Set tokens in cookies
```

### Refresh Token Rotation

Instead of continuously reusing the same refresh token:

```text
Refresh Token A
      │
      ▼
   Verify
      │
      ▼
Generate new tokens
      │
      ├──────────────► Access Token B
      │
      └──────────────► Refresh Token B
                         │
                         ▼
                 Replace old token
```

This provides refresh-token rotation and helps limit the usefulness of a compromised refresh token.

---

## Google Authentication

The project also supports authentication through **Google OpenID Connect**.

```text
User
 │
 ▼
Google Login
 │
 ▼
Google Authentication
 │
 ▼
OpenID Connect
 │
 ▼
Application
 │
 ▼
Find/Create User
 │
 ▼
Issue Application JWTs
 │
 ▼
Authentication Cookies
```

---

## Password Security

Passwords are never stored as plain text.

During registration:

```text
Plain Password
      │
      ▼
    bcrypt
      │
      ▼
Password Hash
      │
      ▼
   MongoDB
```

During login, the supplied password is compared against the stored bcrypt hash.

---

## Performance Benchmark

The registration endpoint was tested using **Autocannon** with:

* **60 concurrent connections**
* **30 second duration**
* `POST /auth/register`
* Local development environment
* bcrypt password hashing enabled/disabled for comparison

### With bcrypt password hashing

```text
Requests/sec:     ~35
Average latency:  ~1660 ms
Total requests:   ~1,000
Data read:        ~1.21 MB
```

### Without password hashing

```text
Requests/sec:     ~515
Average latency:  ~116 ms
Total requests:   ~16,000
Data read:        ~17 MB
```

The benchmark demonstrates the significant computational cost of bcrypt password hashing.

This is expected because password hashing algorithms are intentionally designed to be computationally expensive. The goal is not to remove password hashing for higher throughput, but to understand and measure the security/performance trade-off.

> **Note:** These benchmarks were performed locally and should not be interpreted as production capacity measurements. Results depend on hardware, bcrypt configuration, database performance, and system load.

---

## Project Structure

```text
auth-system/
│
├── controllers/
│
├── middleware/
│
├── models/
│
├── routes/
│
├── services/
│
├── config/
│
├── utils/
│
├── app.js
├── server.js
├── package.json
└── README.md
```

*The structure above represents the intended MVC organization; adjust the folders to match the actual repository.*

---

## API Capabilities

The system provides authentication functionality for:

```text
POST   Register
POST   Login
POST   Logout

POST   Forgot Password
PATCH  Update Password

GET    Profile

POST   Send OTP

GET/POST Google OpenID Connect authentication
```

Exact endpoint paths and request/response schemas depend on the implementation.

---

## Environment Variables

Create a `.env` file containing the required configuration:

```env
PORT=

MONGO_URI=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

REDIS_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
```

Never commit your `.env` file or other secrets to GitHub.

---

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/hashmi55/auth-system.git
cd auth-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file and provide the required MongoDB, Redis, JWT, and Google OpenID Connect configuration.

### 4. Start the application

```bash
npm start
```

For development:

```bash
npm run dev
```

---

## What This Project Demonstrates

This project was built to practice backend authentication concepts beyond basic CRUD APIs.

It demonstrates:

* REST API development with Express
* MVC architecture
* JWT authentication
* Access and refresh token architecture
* Refresh token rotation
* Cookie-based authentication
* Password hashing
* OTP-based flows
* Password reset flows
* Google OpenID Connect authentication
* Redis integration
* MongoDB/Mongoose integration
* Authentication and authorization middleware
* HTTP security headers
* CORS configuration
* Backend performance benchmarking with Autocannon

---

## Project Status

**Status:** Local portfolio project

The project is designed as a **production-style authentication system for learning and portfolio purposes**. It has not been deployed as a production service.

---

## Repository

**GitHub:** https://github.com/hashmi55/auth-system
