# CHAPTER 6 – TESTING

This chapter outlines the testing phase of the **Referral E-Commerce System**. Software testing is an essential phase of the software development lifecycle (SDLC) designed to evaluate system quality, verify that the implementation matches technical specifications, and ensure that all e-commerce transactions, security mechanisms, and referral payouts operate without errors.

A multi-tiered testing plan—comprising unit testing, API verification, and end-to-end system validation—was executed to confirm that the platform is robust, safe, and ready for deployment.

---

## 6.1 Testing Methodology

The testing phase followed a structured, incremental approach to verify individual components before validating complex integrations. The testing methodology utilized both **Black-Box Testing** and **White-Box Testing** techniques:

```
[Unit Testing: Isolated Functions] -> [API Testing: REST Endpoints] -> [System Testing: End-to-End Flow]
```

### 1. Black-Box Testing (Functional Testing)
Black-box testing focuses on the functional requirements of the system. The tester provides specific inputs to a module or page and verifies the output against expected behaviors, without analyzing the underlying code structure. This was used extensively to test storefront operations, user registration screens, shopping cart additions, and admin dashboard panels.

### 2. White-Box Testing (Structural Testing)
White-box testing examines the internal logical paths, loop structures, database operations, and error-handling routines of the code. This was applied to verify the security verification algorithms, JWT encryption pipelines, and the double-level wallet commission credit equations on the server.

### 3. Software Testing Lifecycle (STLC)
The testing process was conducted systematically:
* **Requirement Analysis**: Identifying testable features such as authentication constraints, inventory limits, and referral caps.
* **Test Planning**: Creating a plan to execute tests across various screen resolutions and testing endpoints with standard vs. boundary values.
* **Test Execution**: Manually testing the user interface inside browser contexts and testing backend API pathways using API clients.
* **Defect Retesting**: Logged bugs were fixed, and affected modules were retested to confirm stability.

---

## 6.2 Unit Testing

Unit testing focuses on verifying the smallest testable parts of an application—such as isolated functions, helper files, and schema validation rules—to ensure they operate correctly in isolation.

### Key Focus Areas of Unit Testing:
1. **Input Validations (Zod Schemas)**: Tested the data parsing schemas (`auth.schema.js`) that validate registration and login inputs on the backend. This ensured that emails missing `@` characters, blank password fields, and invalid telephone formats are intercepted and rejected before querying the database.
2. **Password Cryptographic Hashing**: Tested that user passwords submitted during registration are successfully passed to `bcryptjs`, salted with a strength of 10 rounds, and returned as non-reversible hashes.
3. **The Direct Downline Limit Cap (Boundary Check)**: Tested the Mongoose schema validator that limits user growth. A mock script was run to push child references into a parent's `directReferrals` array:
   * **Under Boundary (0 to 7 referrals)**: The operation completed successfully.
   * **On Boundary (Exactly 8 referrals)**: The operation completed successfully.
   * **Over Boundary (Attempting a 9th referral)**: The Mongoose custom validator failed as expected, returning the validation message: `'Maximum of 8 direct referrals allowed.'`

---

## 6.3 API Testing

API Testing verifies that the backend REST endpoints process client requests, interact with the MongoDB database, and return standardized responses with appropriate HTTP status codes. Testing was performed using local API test clients (such as Postman) and command-line `cURL` requests.

```
Client HTTP Request ---> [API Endpoint Router] ---> [JWT / Role Check] ---> [Controller logic] ---> JSON Response
```

### API Validation Categories:
* **Public Endpoint Checks**: Verified that routing files like `shop.js` allow public access. Tests confirmed that calling `GET /api/shop/products` and `GET /api/shop/categories` returns catalog data without requiring authentication tokens in the request header.
* **Private Endpoint Checks**: Verified that private routes (such as fetching wallet balances or modifying shipping profiles) block requests that do not include a valid token. If the HTTP header `x-auth-token` is missing or contains an expired signature, the API middleware rejects the query with an HTTP status `401 Unauthorized`.
* **Administrative Privilege Checks**: Verified that administrative endpoints (such as deleting products or viewing global withdrawal logs) reject requests from standard users. If a logged-in user with standard privileges attempts to call `/api/admin/users`, the admin middleware intercepts the request and blocks access, returning an HTTP status `403 Forbidden`.
* **Payload Boundary Checks**: Verified that submitting invalid or negative price values to `POST /api/admin/products` triggers an immediate validation response (`400 Bad Request`) rather than allowing bad data to write to database collections.

---

## 6.4 System Testing

System Testing represents the **End-to-End (E2E) Integration** phase, where all individual modules—including the React frontend, Tailwind layouts, Express routing controllers, MongoDB storage engine, and third-party Razorpay gateway sandboxes—run together as a single platform.

### Comprehensive Checkout E2E Test Loop:
To verify system stability, testers executed the complete customer checkout journey:
1. **Catalog Browsing**: A user logs in, loads the storefront dashboard, filters items by category, and adds a product to the cart.
2. **Address Selection**: The cart fetches the user's saved addresses, and they select a default delivery address.
3. **Initiating Payment**: The client clicks "Buy Now". The system contacts the backend, which interacts with the Razorpay sandbox API to create an order, returning a unique Razorpay Order ID to the browser.
4. **Overlay Execution**: The React client opens the Razorpay checkout overlay. The tester enters simulated sandbox payment credentials (e.g. Test Netbanking/UPI) and submits the payment.
5. **Verification & Commission Credit**: Razorpay returns success tokens. The client forwards these parameters to the backend verification API `/api/payment/verify`.
6. **Database Integrity check**: The server calculates the Level 1 and Level 2 commissions, credits the wallet balances of the parent referrers in database transactions, decreases the product stock by 1, and appends a purchase receipt to the buyer's profile.
7. **UI Synchronization**: The checkout modal updates to show a "Payment Successful" screen, and the client displays updated wallet balances immediately.

---

## 6.5 Test Cases

The following test matrix outlines critical functional scenarios evaluated during the testing phase. All executed tests passed, confirming system readiness.

| Test ID | Module | Test Scenario / Objective | Input Data / Actions | Expected Output | Actual Output | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Auth | User Registration (Valid inputs, no referral code) | Email: `buyer@test.com`, Password: `SecurePass123!`, Phone: `9876543210` | Account created successfully; password hashed in DB; unique 6-character referral code generated. | Account created; password securely hashed; referral code `A8D2F9` created. | **Pass** |
| **TC-02** | Auth | User Registration with Invalid Referral Code | Email: `new@test.com`, Referral Code: `INVALID99` | Registration blocked; database write rejected; API returns HTTP status `400 Bad Request`. | Registration rejected with message: `'Invalid referral code'`. | **Pass** |
| **TC-03** | Auth | Direct Referral Cap Boundary Check (9th downline) | Email: `downline9@test.com`, Referral Code of referrer who already has 8 downlines. | Registration blocked; Mongoose schema validator rejects the operation; returns error. | Registration blocked with message: `'Referral limit reached for this code (Max 8)'`. | **Pass** |
| **TC-04** | Auth | User Login with Incorrect Password | Email: `buyer@test.com`, Password: `WrongPassword` | Authentication fails; JWT token not issued; returns HTTP status `400 Bad Request`. | Authentication rejected with message: `'Invalid Credentials'`. | **Pass** |
| **TC-05** | Shop | Fetch Catalog Products (Public access) | Send `GET /api/shop/products` request without auth headers. | Storefront loads product list successfully; returns HTTP status `200 OK`. | Products array returned successfully with status `200 OK`. | **Pass** |
| **TC-06** | Order | Razorpay Order Creation | Click "Buy Now" on a product priced at Rs. 499. | Server contacts Razorpay APIs; generates and returns a unique Razorpay Order ID. | Razorpay Order ID `order_LZ8d92Fk19s` returned successfully. | **Pass** |
| **TC-07** | Order | Razorpay Payment Verification (Valid transaction) | Send signature tokens to `/api/payment/verify` route after sandbox payment. | Signature verified successfully; Level 1 & 2 parent wallets credited; buyer stock decremented. | Signature matched; parent wallets credited; order created successfully. | **Pass** |
| **TC-08** | Order | Fraudulent Signature Prevention | Submit falsified `razorpay_signature` parameter to verification route. | HMAC signature check fails; transaction rejected; database changes rolled back. | Rejected with HTTP status `400 Bad Request` and message: `'Payment verification failed'`. | **Pass** |
| **TC-09** | Wallet | Cart Purchase via Wallet | Click "Pay via Wallet" on item priced at Rs. 200 (User Net Wallet Balance: Rs. 500). | Order confirmed; buyer's `withdrawn` balance increments by 200; stock decremented. | Order confirmed; user's net wallet balance decreased to Rs. 300. | **Pass** |
| **TC-10** | Wallet | Wallet Purchase with Insufficient Funds | Click "Pay via Wallet" on item priced at Rs. 600 (User Net Wallet Balance: Rs. 200). | Option disabled in frontend; if requested via API, route rejects checkout with error. | Rejected with HTTP status `400` and message: `'Insufficient wallet balance'`. | **Pass** |
| **TC-11** | Withdraw| Voucher Code Generation (Withdrawal) | Request withdrawal of Rs. 100 to Amazon Gift Card (Net Balance: Rs. 250). | Net balance verifies; Rs. 100 added to `withdrawn`; random coupon code generated. | Coupon `GIFT-AMZ-8D3F9` generated; net balance decreased to Rs. 150. | **Pass** |
| **TC-12** | Admin | Admin Route Privilege Protection | Standard user account calls `GET /api/admin/users`. | Access blocked by middleware; returns HTTP status `403 Forbidden`. | Request rejected with message: `'Access denied. Admin role required.'`. | **Pass** |

---

## 6.6 Bug Fixes and Improvements

During the iterative development and testing phases, several technical issues were identified and resolved to ensure data consistency and system performance.

### 1. Concurrency Race Conditions in Dual-Level Commission Credits
* **The Bug**: During simultaneous checkout testing, multiple purchases from downlines sometimes occurred at the exact same millisecond. Because parent wallet increment operations were not isolated, the server occasionally read stale wallet balances before completing calculations. This caused subsequent direct or indirect credits to overwrite each other, resulting in missed wallet earnings for parents.
* **The Fix**: The commission updates were wrapped in atomic Mongoose updates using the `$inc` operator, rather than reading the document, modifying the values in memory, and executing a full `.save()` call. This ensures that parent wallet increments are performed atomically directly on the MongoDB server, preventing concurrency issues:
  ```javascript
  // Fixed atomic update implementation
  await User.findByIdAndUpdate(parentId, {
      $inc: { 
          'earnings.direct': level1Amount,
          'earnings.total': level1Amount 
      }
  });
  ```

### 2. Floating-Point Precision Mismatches in Commission Calculations
* **The Bug**: E-commerce products configured with fractional prices (e.g. Rs. 499.50) occasionally produced commission totals with long fractional tails (e.g., Rs. 49.950000000000003) due to binary floating-point representation limits in JavaScript. If allowed to save directly, these values quickly accumulated round-off errors in the total wallet balance over multiple checkouts.
* **The Fix**: The server-side calculations were updated to round commission values using high-precision logic before writing them to the database. All calculated earnings are forced to two decimal places using `.toFixed(2)` and parsed back into numbers:
  ```javascript
  const rawCommission = productPrice * (commissionPercentage / 100);
  const directEarning = parseFloat(rawCommission.toFixed(2));
  const indirectEarning = parseFloat((directEarning * 0.10).toFixed(2));
  ```

### 3. Inventory Stock Deductions Running Negative
* **The Bug**: During system testing, multiple buyers attempting to check out the last remaining item in stock at the same time were all directed to the Razorpay gateway overlay. Once payments were completed, the verify routes processed all transactions, resulting in the database stock count falling below zero (e.g., `stock: -2`).
* **The Fix**: The inventory update controller was updated to check stock volumes inside the update transaction using atomic `$inc` operators with `$gte` stock constraints:
  ```javascript
  const product = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: 1 } },
      { $inc: { stock: -1 } },
      { new: true }
  );
  if (!product) {
      // Abort transaction and refund razorpay order
      throw new Error('Product out of stock');
  }
  ```
