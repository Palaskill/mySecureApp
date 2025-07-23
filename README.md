# Secure Angular Application with Node.js Backend

A secure web application built with Angular and Node.js, featuring user authentication, role-based access control, and admin dashboard.

## Features

- 🔐 Secure Authentication System
- 👥 Role-Based Access Control (Admin, User, Operator, Boss, Chief)
- 📝 User Registration with Admin Approval
- 🎛️ Admin Dashboard
  - User Management
  - Account Approval System
  - Role Management
  - User Status Control
- 🔒 Security Features
  - JWT Authentication
  - Password Hashing
  - Protected Routes
  - HTTP-Only Cookies
  - Security Headers

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- Angular CLI

## Project Structure

```
.
├── backend/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── database.sql        # Database schema
│   └── server.js           # Express server
└── secure-angular-app/     # Angular frontend
    └── src/
        └── app/
            ├── components/ # Angular components
            ├── guards/     # Route guards
            └── services/   # Angular services
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the database:
   ```bash
   mysql -u your_username -p < database.sql
   ```

4. Start the server:
   ```bash
   node server.js
   ```

### Frontend Setup

1. Navigate to the Angular app directory:
   ```bash
   cd secure-angular-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

4. Open your browser and navigate to `http://localhost:4200`

## Default Admin Account

- Email: admin@admin.com
- Password: admin123

## API Endpoints

### Authentication
- POST `/api/login` - User login
- POST `/api/signup` - User registration

### Admin Routes
- GET `/api/admin/pending-signups` - Get pending signup requests
- POST `/api/admin/process-signup` - Process signup requests
- GET `/api/admin/users` - Get all users
- POST `/api/admin/update-user` - Update user status/role
- GET `/api/admin/rejected-accounts` - Get rejected accounts

## Security Features

- JWT stored in HTTP-only cookies
- Password hashing using bcrypt
- Role-based route protection
- SQL injection protection
- XSS protection headers
- CORS configuration
- Rate limiting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details 