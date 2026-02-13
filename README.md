# Referral Earning System

This is a full-stack web application that implements a multi-level referral system. It tracks purchases and distributes earnings automatically to users based on who referred them.

## Features

- **Multi-level Referral System**: Tracks direct and indirect referrals.
  - **Direct Referrals**: Earn 5% of the profit when a direct referral makes a purchase.
  - **Indirect Referrals**: Earn 1% of the profit when a referral's referral makes a purchase.
- **Secure Authentication**: Uses JWT and bcrypt for secure signup and login.
- **Admin Dashboard**: Create products with specific profit margins.
- **Real-time Earnings**: Dashboard updates earnings in real-time.
- **Responsive Design**: Built with React and TailwindCSS for mobile and desktop compatibility.
- **API Documentation**: Detailed API documentation available in [api-docs](./api-docs.md).
- **Postman Collection**: Import [postman_collection.json](./postman_collection.json) to test API endpoints.

## Screenshots

### Landing Page
![Landing Page](./screenshots/landingpage.png)

### Profile Page with Referral URL
![Profile Page with Referral URL](./screenshots/profilepage-referalurl.png)

### Referral Slots
![Referral Slots](./screenshots/referalslots.png)

### Shop Page
![Shop Page](./screenshots/shoppage.png)

## Prerequisites

Before you start, make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (which includes npm)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

## Installation and Setup

Follow these steps to set up the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/MANSIAG1/Referal-Earning-System
cd Referal-Earning-System
```

### 2. Backend Setup (Server)

Navigate to the server directory, install dependencies, and configure the environment.

```bash
cd server
npm install
```

**Create a `.env` file** in the `server` directory and add the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

**Start the Server:**

```bash
npm start
# OR
node server.js
```

**Run Test Cases:**

To verify the referral logic (User A -> User B -> User C chain), run the integration tests:

```bash
node tests/main.test.js
```

**Seed the Database (Optional):**

To populate the database with synthetic product data for testing:

```bash
node seed/seed.js
```

### 3. Frontend Setup (Client)

Open a new terminal, navigate to the client directory, and install dependencies.

```bash
cd ../client
npm install
```

**Create a `.env` file** in the `client` directory and add the API URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Start the Client:**

```bash
npm run dev
```

The application should now be running at `http://localhost:5173`.

## Folder Structure

- **`client/`**: Frontend code (React + Vite + TailwindCSS). Separated for clean UI logic.
- **`server/`**: Backend code (Node.js + Express + MongoDB). Follows a Model-Route-Controller pattern.

## Test Cases

Integration tests are located in `server/tests/main.test.js`.
These tests simulate real-world scenarios:
1. Creating User A, User B, and User C.
2. Establishing a referral chain (A -> B -> C).
3. User C making a purchase.
4. Verifying that User B receives 5% and User A receives 1% profit.
