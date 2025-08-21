# Role-Based Authentication and User Management API

A Node.js RESTful API for user registration, authentication (with OTP email verification), and role-based access control. Built with Express, MongoDB (Mongoose), JWT, and includes Swagger API documentation.

## Features

- **User Registration** with OTP email verification
- **JWT Authentication** for secure endpoints
- **Role-Based Access Control** (Admin, Editor, Viewer)
- **User CRUD** (Admin can manage users, users can update their own info)
- **Swagger UI** for API documentation (`/api-docs`)
- **Validation** using `express-validator`
- **Unit tests** for User model

## Project Structure

```
.
├── config/         # DB, email, and Swagger config
├── controllers/    # Route handlers
├── emails/         # HTML email templates
├── middleware/     # Auth and role middleware
├── models/         # Mongoose models and tests
├── routes/         # Express route definitions
├── services/       # Business logic
├── utils/          # Utility functions (e.g., OTP generator)
├── validators/     # Request validation
├── .env            # Environment variables
├── package.json
├── server.js
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB instance
- Gmail account for sending OTP emails

### Installation

1. **Clone the repository**
   ```sh
   git clone <repo-url>
   cd on_boarding
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/your_db
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

4. **Start the server**
   ```sh
   npm run dev
   ```
   The API will be available at `http://localhost:4000/`.

5. **Access Swagger API docs**
   - Visit [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

## API Endpoints

### Authentication

- `POST /api/register` — Register a new user (receives OTP via email)
- `POST /api/verify-otp` — Verify OTP to activate account
- `POST /api/login` — Login and receive JWT

### Users

- `GET /api/users` — List all users (**Admin only**)
- `GET /api/users/:id` — Get user by ID (**Admin or self**)
- `PATCH /api/users/:id/role` — Update user role (**Admin only**)
- `PUT /api/users/:id` — Update user info (**Admin or self**)
- `DELETE /api/users/:id` — Delete user (**Admin only**)

## Running Tests

```sh
npm test
```

## Technologies Used

- Express.js
- MongoDB & Mongoose
- JWT (jsonwebtoken)
- Nodemailer (Gmail SMTP)
- express-validator
- Swagger (swagger-jsdoc, swagger-ui-express)
- Mocha, Chai (testing)


 