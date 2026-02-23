# TODO: Remove Google Auth and Fix Email/Password Login

## Backend Changes

### 1. backend/server.js
- [x] Remove Google OAuth setup (passport, GoogleStrategy, cookie-session)
- [x] Remove Google OAuth routes (/api/google, /api/google/callback)
- [x] Import authRoutes.js, driveRoutes.js, applicationRoutes.js

### 2. backend/routes/googleAuthRoutes.js
- [x] Delete this file (not imported anywhere, no longer used)

## Frontend Changes

### 3. frontend/src/pages/Login.js
- [x] Remove Google button and related code
- [x] Keep email/password login form

### 4. frontend/src/pages/OAuthRedirect.js
- [x] Delete this file (not imported anywhere, no longer used)

### 5. frontend/src/App.js
- [x] Remove OAuthRedirect route and import
- [x] Remove Register route

## Package.json Changes

### 6. package.json (root)
- [x] Remove passport, passport-google-oauth20, cookie-session
