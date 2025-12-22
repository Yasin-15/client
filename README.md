# Online Voting System

A secure, full-featured online voting system built with Next.js (frontend), Node.js + Express (backend), and MongoDB (database).

## Features

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control (Admin, Election Officer, Voter)
- Password hashing with bcrypt
- Two-factor authentication support
- HTTPS enforcement
- CSRF & XSS protection
- Rate limiting to prevent brute-force attacks

### 👥 User & Profile Management
- Secure user registration and login
- Unique voter ID generation
- Identity verification (national/student ID)
- User verification workflow
- **New:** Personal Profile Page (`/profile`) to update details and change passwords
- Account activation/suspension

### 🗳️ Election Management
- Create, update, and delete elections
- Set election start and end dates with automatic activation
- Configure voting rules (single-choice, multi-choice)
- **New:** Strict ownership enforcement (Officers only manage their own elections)
- Election status control (Draft, Active, Closed)

### 📋 Candidate Management
- Add and manage candidates per election
- Candidate profiles with photo, manifesto, and position
- **New:** Decentralized approval (Officers can approve candidates for their own elections)
- Candidate visibility control

### ✅ Secure Voting Process
- Encrypted vote submission
- Vote anonymization (votes cannot be traced back to users)
- Server-side validation
- Protection against duplicate and fraudulent voting
- One-vote-per-user enforcement

### 📊 Results & Live Monitoring
- **New:** Real-time live scoreboards for Admins and Officers
- Automatic result generation after election closes
- Admin-controlled result publication
- Results verification with unique vote tokens

### ⚙️ System Administration
- **New:** Global System Settings (Site name, maintenance mode, registration toggle, etc.)
- **New:** Officer Management Directory (Monitor staff activity and managed elections)
- Audit dashboard with security alerts
- User role management (Voter -> Officer -> Admin)

### 📄 Professional Content
- **New:** Professional landing pages:
  - **About Us**: Mission and security details
  - **FAQ**: Interactive accordion for common questions
  - **Contact**: Support form and office information

### 📧 Notifications
- Email/SMS notifications for:
  - Election start and end
  - Successful vote submission
  - System announcements
- Real-time in-app notifications

## Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Helmet** & **CORS** - Security
- **express-rate-limit** - DDoS protection
- **Morgan** - Logging

### Frontend
- **Next.js 15** (App Router) - Modern React framework
- **Tailwind CSS** - Modern utility-first styling
- **Axios** - API communication
- **AuthContext** - State management for security
- **Socket.io** (optional) - Real-time updates

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/voting-system
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
```

4. Start MongoDB:
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

5. Start the backend server:
```bash
# Development
npm run dev

# Production
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

### User Roles

**Voter:**
- Register and verify account
- Manage personal profile & security
- View active elections and cast votes
- View published results

**Election Officer:**
- Create and manage own elections
- **Verify voter identities** in the verification portal
- Approve candidates for their elections
- **Monitor live scores** in real-time
- Publish results

**Admin:**
- Full system control & global settings
- User verification and role management
- **Manage Election Officers** directory
- View comprehensive audit logs
- System-wide security monitoring

### Creating an Admin User

After starting the backend, you can create an admin user through the registration endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "voterId": "ADMIN001",
    "nationalId": "1234567890"
  }'
```

Then manually update the user's role in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin", isVerified: true } }
)
```

## API Documentation

### Authentication & Profile
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `PUT /api/auth/details` - Update personal info (Authenticated)
- `PUT /api/auth/password` - Change password (Authenticated)

### Election & Candidates
- `GET /api/elections` - Get all elections
- `GET /api/elections/active` - Get active elections
- `POST /api/elections` - Create election (Admin/Officer)
- `PUT /api/elections/:id` - Update election (Owner/Admin)
- `PUT /api/candidates/:id/approve` - Approve candidate (Owner/Admin)

### Voting & Results
- `POST /api/votes` - Cast vote
- `GET /api/votes/live-results/:electionId` - Live monitoring (Staff only)
- `GET /api/votes/results/:electionId` - Public results (Published only)

### Admin & Staff Management
- `GET /api/admin/settings` - View system settings
- `PUT /api/admin/settings` - Update platform config
- `GET /api/admin/users` - Global user management (Staff access)
- `PUT /api/admin/users/:id/verify` - Verify voter identity
- `GET /api/admin/audit-logs` - Security audit trail

## Security Features

1. **Password Security**
   - BCrypt hashing with salt rounds
   - Minimum password length enforcement
   - Password complexity requirements (optional)

2. **JWT Authentication**
   - Secure token generation
   - Token expiration
   - Token refresh mechanism

3. **Vote Anonymization**
   - SHA-256 hashing for voter identification
   - Vote tokens for verification
   - No direct voter-vote linkage

4. **Rate Limiting**
   - General API rate limiting (100 requests per 15 minutes)
   - Strict voting endpoint limiting (5 attempts per minute)

5. **Audit Logging**
   - Comprehensive activity tracking
   - Security alert detection
   - Immutable log records

## Development

### Project Structure

```
project/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── electionController.js
│   │   ├── candidateController.js
│   │   ├── voteController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── error.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Election.js
│   │   ├── Candidate.js
│   │   ├── Vote.js
│   │   └── AuditLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── electionRoutes.js
│   │   ├── candidateRoutes.js
│   │   ├── voteRoutes.js
│   │   └── adminRoutes.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.js
    │   │   ├── page.js
    │   │   ├── login/
    │   │   ├── register/
    │   │   ├── dashboard/
    │   │   ├── elections/
    │   │   ├── vote/
    │   │   └── admin/
    │   ├── components/
    │   ├── lib/
    │   └── styles/
    ├── public/
    └── package.json
```

### Running Tests

```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

##Future Enhancements

- [ ] Blockchain integration for tamper-proof voting
- [ ] Biometric verification
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Accessibility improvements
- [ ] Redis caching for performance
- [ ] Docker containerization
- [ ] CI/CD pipeline

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email yasindev54@gmail.com or open an issue in the repository.

## Acknowledgments

- Built with Next.js, Express, and MongoDB
- Inspired by modern democratic voting systems
- Security best practices from OWASP
