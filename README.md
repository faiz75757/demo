# B4 - College Event Management System (B4 Events)

A simple MERN app. Admins create and manage events; students browse upcoming events and register for them.

## Technologies
React (Vite), Node.js, Express, MongoDB with Mongoose, bcryptjs (password hashing), JWT (login).

## Features
- Student registration and login, admin registration (needs a secret setup code) and login
- Admins: add, edit, delete events; view attendee names and emails
- Students: see upcoming events, register once per event, see "Event Full" when no seats remain
- Seat count is checked on the backend; the last seat is safe even if two students click at once

## Setup
1. Install Node.js (LTS). Create a free MongoDB Atlas cluster and copy its connection string.
2. Backend:
   ```
   cd server
   npm install
   copy .env.example .env      (Mac/Linux: cp .env.example .env)
   ```
   Open `.env` and fill in the values below, then run `npm run dev`.
3. Frontend (second terminal):
   ```
   cd client
   npm install
   npm run dev
   ```
4. Open the link Vite prints (usually http://localhost:5173).

## Environment variables (server/.env)
| Name | Meaning |
|---|---|
| MONGO_URI | MongoDB connection string |
| JWT_SECRET | Long random string used to sign login tokens |
| ADMIN_SETUP_CODE | Secret code required on the Admin Register page |
| PORT | Backend port (default 5000) |

## Creating the first admin securely
Set `ADMIN_SETUP_CODE` in `server/.env`, open Admin Register, and enter that code. The role is decided by the server, so a student cannot become an admin by editing the form. Keep the code private. No demo credentials are included.

## API overview
| Method | Path | Access |
|---|---|---|
| POST | /api/auth/register | public (admin needs setup code) |
| POST | /api/auth/login | public |
| GET | /api/events | public |
| POST | /api/events | admin |
| PUT | /api/events/:id | admin |
| DELETE | /api/events/:id | admin |
| POST | /api/events/:id/register | student |
| GET | /api/events/:id/attendees | admin |
| GET | /api/my-registrations | student |
