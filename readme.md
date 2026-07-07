# TeamFlow

TeamFlow is a Full Stack Project Management System built for software engineering teams.

It provides a single platform for project planning, task management, Root Cause Analysis (RCA), notifications, reporting and collaboration.

---

# Features

## [Demo video]
{https://youtu.be/tu8XnR3d_sY?si=Dr_iEmhP1bLdllDe}

## Authentication

- User Registration
- Secure Login
- JWT Authentication
- Password Hashing using bcrypt
- User Preferences
- Theme Preference

---

## Project Management

- Create Project
- Edit Project
- Delete Project
- Add Members
- Remove Members
- Member Roles
- View Preference per User

---

## Task Management

- Create Task
- Update Task
- Delete Task
- Assign Task
- Priority Management
- Due Date
- Task Status
- Parent Tasks
- Task Dependencies
- Comments
- Attachments

---

## Project Views

- Kanban Board
- Calendar View
- List View

User preference is stored for every project.

---

## Root Cause Analysis (RCA)

- RCA Creation
- RCA Sections
- Reviewer Assignment
- Review Workflow
- Approval/Rejection
- Mandatory Comments

---

## Notifications

- In-App Notifications
- Email Notifications
- Duplicate Notification Suppression
- Notification Bell
- Read / Unread Status

Supported Events

- Task Assigned
- Task Status Changed
- RCA Submitted
- Review Decision
- Project Member Added (Implemented)

---

## Reporting

- Dashboard
- Completion Rate
- Project Health
- Velocity
- RCA Statistics
- CSV Export

---

## User Preferences

- Dark Theme
- Light Theme
- Email Opt Out

---

## Security

- JWT Authentication
- Protected Routes
- Password Hashing
- Input Validation
- SQL Parameterized Queries

---

# Technology Stack

Frontend

- React
- Vite
- Context API
- CSS

Backend

- Node.js
- Express.js

Database

- PostgreSQL (Neon)

Authentication

- JWT
- bcrypt

Notifications

- Event Driven
- Nodemailer

Deployment

- Localhost
- Neon PostgreSQL

---

# Architecture

Frontend

React Components

↓

API Services

↓

Express Controllers

↓

Models

↓

PostgreSQL

Notification Flow

Action

↓

Event

↓

Notification Service

↓

Notification Table

↓

Email Service

↓

SMTP

---

# Folder Structure

client/

React Application

server/

Express Backend

docs/

Documentation

---

# Environment Variables

JWT_SECRET=

JWT_EXPIRES_IN=

DATABASE_URL=

SMTP_HOST=

SMTP_PORT=

SMTP_USER=

SMTP_PASS=

SMTP_FROM=

---

# Installation

npm install

npm run dev

---

# Implemented Features

✓ Authentication

✓ Projects

✓ Members

✓ Tasks

✓ Attachments

✓ Comments

✓ RCA

✓ Notifications

✓ Email Notifications

✓ Reports

✓ CSV Export

✓ Dashboard

✓ Dark Theme

✓ JWT

✓ Responsive Design

---

# Known Limitations

- Notifications are not real-time.
- Email retry mechanism is unavailable.
- Attachments are stored locally.
- Dashboard performance decreases with very large datasets.
- Theme preference is browser specific.

---

# Future Scope

- WebSocket Real-Time Notifications
- Chat Module
- Timeline View
- Gantt Chart
- Sprint Planning
- AI Task Suggestions
- AI RCA Recommendations
- Workload Prediction
- Multi-Level Approval Workflow
- Cross Project Analytics
- Cloud File Storage (AWS S3/Azure)
- Multi Region Deployment
