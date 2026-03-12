# E-Commerce Backend System - Entri Elevate

A robust, scalable backend and futuristic frontend application for an E-Commerce Intelligence system. This project features strong JWT authentication, Role-Based Access Control (RBAC), simulated RapidMiner product recommendations, and custom frontend capabilities.

**Developed by:** Ashfaaq Feroz Muhammad
**Credit:** Entri Elevate - MERN

## Core Features
1. **Authentication & Authorization**: JWT token-based authentication, bcrypt password encryption, custom Role selection dropdown, OTP recovery, and role-based access.
2. **CRUD Operations**: Efficient API endpoints for Products, Orders, and User Profiles.
3. **Product Filtering & Search**: Advanced regex search with custom pricing and category filtering capabilities.
4. **Predictive Analytics (Simulation)**: RapidMiner style heuristic-based algorithmic intelligence to suggest product recommendations mapping accurate user categories. 
5. **Modern Minimalist Frontend**: Clean white and deep blue theme with liquid glassmorphism inputs, animated custom dropdowns, password visibility toggles, and secure token storage.

## Folder Structure
```
ME4 ecommerce-backend 1.0/
│
├── index.js                     # Main entry point for the Express server
├── package.json                 # Dependency mapping
│
├── /config
│ └── dbConnection.js            # MongoDB connection setup
│
├── /public                      # Frontend assets powered by REST APIs
│ ├── index.html                 # Landing & Welcome Page
│ ├── dashboard.html             # Secure Dashboard Console
│ ├── style.css                  # Custom styling (Glassmorphism & Gradient)
│ └── app.js                     # Interactivity and API consumption
│
├── /models
│ ├── user.js                    # User schema and model with OTP capabilities
│ ├── product.js                 # Product schema and model
│ └── order.js                   # Order schema and model
│
├── /controllers
│ ├── authentication.js          # Handles registration, login, and forgot password via OTP
│ ├── userProfile.js             # Manages user profile CRUD
│ ├── productController.js       # Handles product CRUD, filtering, and search
│ ├── orderController.js         # Order placement, updates, tracking
│ └── analyticsController.js     # Simulated product recommendation logic
│
├── /routes
│ ├── authenticationRoutes.js    # Auth-related API endpoints
│ ├── userProfileRoutes.js       # User profile management endpoints
│ ├── productRoutes.js           # Product CRUD & search endpoints
│ ├── orderRoutes.js             # Order management endpoints
│ └── analyticsRoutes.js         # Recommendation system endpoints
│
└── /middleware
  ├── authMiddleware.js          # JWT verification & role-based access control
  └── errorHandler.js            # Centralized error mapping
```

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env`:
   Make sure you have a valid MongoDB instance running. Update the `MONGODB_URI` in `.env`.
   
   **For OTP Emails (Nodemailer) to work:**
   You must use a **Gmail App Password** (regular passwords will be blocked by Google).
   - Go to your Google Account Settings -> Security -> 2-Step Verification.
   - Scroll to the bottom and click "App passwords".
   - Generate a new password for "Mail" / "Mac" and paste that 16-character code into your `.env`:
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_16_digit_app_password
   ```
3. Start the server (Development mode):
   ```bash
   npm run dev
   ```
4. Access Frontend Toolkit:
   Navigate to `http://localhost:5001` inside a modern web browser.

See `deployment_instructions.txt` for server setup and Vercel hosting instructions.
