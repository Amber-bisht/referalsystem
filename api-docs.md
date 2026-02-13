# API Documentation

This document provides detailed information about the API endpoints, data models, and business logic used in the Referral Earning System.

## Base URL

All API endpoints are prefixed with `/api`.

## Authentication (`/api/auth`)

### 1. User Signup
- **Endpoint**: `POST /auth/signup`
- **Description**: Registers a new user and handles the referral logic.
- **Body Parameters**:
  - `username` (string, required): User's desired username.
  - `email` (string, required): User's email address.
  - `password` (string, required): User's password.
  - `referralCode` (string, optional): The referral code of the user who referred them.
- **Logic**:
  - Checks if a user with the given email already exists.
  - Validates the `referralCode` if provided:
    - Checks if the code exists.
    - **Limit Check**: Ensures the referrer has not exceeded the maximum of 8 direct referrals.
  - Generates a unique 6-character alphanumeric `referralCode` for the new user.
  - Hashes the password using `bcrypt`.
  - Creates the new user.
  - If a valid `referralCode` was provided, updates the referrer's `directReferrals` list to include the new user's ID.
  - Returns a JWT token for authentication.

### 2. User Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticates a user and returns a token.
- **Body Parameters**:
  - `email` (string, required)
  - `password` (string, required)
  - **Logic**:
    - Verifies email existence.
    - Compares provided password with the stored hashed password.
    - Returns a JWT token valid for 1 hour.

### 3. Get User Details
- **Endpoint**: `GET /auth/user`
- **Headers**: `x-auth-token: <token>`
- **Description**: Retrieves the currently logged-in user's information (excluding password).

---

## Shop (`/api/shop`)

### 1. Get All Products
- **Endpoint**: `GET /shop/products`
- **Headers**: `x-auth-token: <token>`
- **Description**: Retrieves a list of all available products.

### 2. Purchase Product
- **Endpoint**: `POST /shop/purchase`
- **Headers**: `x-auth-token: <token>`
- **Body Parameters**:
  - `productId` (string, required): The ID of the product to purchase.
- **Description**: Processes a product purchase and distributes referral earnings.
- **Logic**:
  1. **Validation**: Checks if the product exists.
  2. **Record Purchase**: Adds the purchase details (product ID, name, price, date) to the user's `purchaseHistory`.
  3. **Earnings Distribution Rule**:
     - **Threshold**: If the product `price` is **≤ ₹1000**, NO earnings are distributed.
     - **Distribution**: If the product `price` is **> ₹1000**:
       - **Level 1 (Direct Referrer)**: Receives **5%** of the product's `profit`.
       - **Level 2 (Referrer's Referrer)**: Receives **1%** of the product's `profit`.
  4. **Updates**: Updates the `earnings.direct`, `earnings.indirect`, and `earnings.total` fields for the respective parent users.

---

## Data Models

### User Model
- **username**: String
- **email**: String (Unique)
- **password**: String (Hashed)
- **referralCode**: String (Unique, Auto-generated)
- **referredBy**: ObjectId (Reference to User)
- **directReferrals**: Array of ObjectIds (Max 8)
- **earnings**:
  - `direct`: Number (Earnings from direct referrals)
  - `indirect`: Number (Earnings from indirect referrals)
  - `total`: Number (Sum of direct and indirect)
- **purchaseHistory**: Array of objects (Product details and date)
- **createdAt**: Date

### Product Model
- **name**: String
- **price**: Number
- **profit**: Number (Used for calculating referral earnings)
- **description**: String
- **imageUrl**: String
