# ResolveIT – Incident Management Web App (COMP229 Project Part 1)

**ResolveIT** is a full-stack incident management web application (Express + MongoDB API and a React client). Users report incidents (IT problems, facility issues, safety concerns), track them, and admins assign and resolve them.

**Team:** ResolveIT · **Developer:** Haimanot Moges (301528841) · **Course:** COMP229 – Web Application Development

## Tech stack
**Backend:** Node.js · Express 4 · MongoDB + Mongoose 8 · JWT (jsonwebtoken + express-jwt) · MVC structure
**Frontend:** React 19 · Vite · React Router · Context API
**Quality:** Node test runner + Supertest · Postman · GitHub Actions CI · Trello (Agile)

## Project structure (MVC)
```
config/config.js                     settings from .env
server/server.js                     connects to MongoDB, starts the server
server/express.js                    middleware, routes, error handling
server/models/                       user.model.js, incident.model.js      (M)
server/controllers/                  auth, user, incident controllers      (C)
server/routes/                       auth, user, incident routes
server/helpers/dbErrorHandler.js     readable database error messages
scripts/seedAdmin.js                 creates the admin account
server/helpers/sanitize.js           blocks NoSQL injection
tests/api.test.js                    29 automated API tests
postman/ResolveIT.postman_collection.json
.github/workflows/ci.yml             runs the tests on every push / pull request
client/                              React frontend (the "V" in MVC)
  src/api/api.js                     every call to the Express API
  src/auth/AuthContext.jsx           shared sign-in state
  src/components/                    Menu (auth navigation), PrivateRoute, Badge
  src/pages/                         Home, Signup, Signin, Incidents, IncidentForm, Profile, Users
```

## Run it
```bash
npm install
copy .env.example .env      # macOS/Linux: cp .env.example .env
npm run seed                # creates the admin account from .env
npm run dev                 # http://localhost:3000
npm test                    # runs all API tests (needs MongoDB running)

cd client
npm install
npm run dev                 # http://localhost:5173 (calls the API through the Vite proxy)
```
MongoDB must be running locally (`mongodb://127.0.0.1:27017`) or set `MONGODB_URI` to a MongoDB Atlas connection string.

## Database and collections
Database `resolveit` with two collections:
- **users**: name, email (unique), role (`user` | `admin`), hashed_password, salt, created, updated
- **incidents**: title, description, category, priority, status, location, reportedBy (→ users), assignedTo (→ users), resolutionNotes, created, updated

## API
| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/users` | Public | Sign up |
| POST | `/auth/signin` | Public | Sign in, returns JWT |
| GET | `/auth/signout` | Public | Sign out (clears cookie) |
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/:userId` | Signed in | Read a profile |
| PUT | `/api/users/:userId` | Owner or admin | Update a profile |
| DELETE | `/api/users/:userId` | Owner or admin | Delete an account |
| POST | `/api/incidents` | Signed in | Report an incident |
| GET | `/api/incidents` | Signed in | List own incidents (admin: all). Filters: `?status=` `?priority=` `?category=` |
| GET | `/api/incidents/:incidentId` | Reporter or admin | Read an incident |
| PUT | `/api/incidents/:incidentId` | Reporter or admin | Update details (status/assignment: admin only) |
| DELETE | `/api/incidents/:incidentId` | Reporter or admin | Delete an incident |

Send the token as `Authorization: Bearer <token>`.

## Authentication, authorization & security
- Passwords are hashed with scrypt and a random 16-byte salt (upgraded from the skeleton's HMAC-SHA1) and compared in constant time; the hash and salt are never returned.
- Sign-in returns a JWT (also set as an httpOnly cookie) containing the user id and role.
- `requireSignin` rejects requests without a valid token (401).
- `hasAuthorization` lets users change only their own account; `isAdmin` protects admin routes (403).
- Users cannot give themselves the admin role.
- Sign-in is rate limited (10 attempts / 15 min per IP).
- Request data is sanitised against NoSQL injection; Helmet sets secure headers; CORS allows only the React client; bodies are limited to 10 kb.
- On the client, `PrivateRoute` protects pages, but the server enforces every rule.

## Testing
- `npm test`: 29 automated tests covering every CRUD route, sign-in/sign-out, authorization rules and security checks.
- Postman: import `postman/ResolveIT.postman_collection.json` and click **Run collection** (18 requests, saves the token and IDs automatically).
- GitHub Actions (`.github/workflows/ci.yml`) runs the tests on every push and pull request.
- The React client was checked end to end in a browser (sign up, sign in, incident CRUD, admin workflow, sign out, phone layout).

## Team workflow
See [CONTRIBUTING.md](CONTRIBUTING.md): feature branches, pull requests with a review checklist, CI, and one-week sprints on Trello.

## Responsible use of AI
Claude (Anthropic) was used as an AI coding assistant to scaffold parts of the code, tests and documentation. All code was reviewed, run and tested by the developer, who can explain every part of it. No personal or confidential data was shared with the AI tool.

## Project status
- Sprint 1 (Part 1): backend, JWT auth, CRUD APIs, 29 automated tests, Postman 18/18, React client - complete
- Sprint 2 (Part 2): frontend design, MongoDB Atlas, cloud deployment - planned
