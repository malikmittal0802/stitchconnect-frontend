<h1 align="center">🪡 StitchConnect</h1>

<p align="center">
  <strong>A luxury-inspired MERN Stack platform connecting customers with skilled local tailors through an elegant digital marketplace.</strong>
</p>

<p align="center">
  Built with <strong>React • TypeScript • Express • MongoDB</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live-success?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Frontend-React%20+%20Vite-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Backend-Node.js%20+%20Express-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js">
  <img src="https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
</p>

---

# 🔗 Project Links

- 🌐 **Live Frontend:** https://stitchconnect-frontend.vercel.app
- ⚙️ **Live Backend API:** https://stitchconnect-api.onrender.com
- 💻 **Backend Repository:** https://github.com/malikmittal0802/stitchconnect-backend

---

# 📸 Application Preview

<p align="center">
  <img src="screenshots/home.png" width="48%" alt="Home Page">
  <img src="screenshots/customer-dashboard.png" width="48%" alt="Customer Dashboard">
</p>

<p align="center">
  <img src="screenshots/tailor-dashboard.png" width="48%" alt="Tailor Dashboard">
  <img src="screenshots/tailor-discovery.png" width="48%" alt="Tailor Discovery">
</p>

<p align="center">
  <img src="screenshots/lookbook.png" width="48%" alt="Tailor Lookbook">
  <img src="screenshots/tailor-profile.png" width="48%" alt="Tailor Profile">
</p>

---

# ✨ Key Highlights

- 🎨 Luxury-inspired responsive user interface
- 🧵 Digital Lookbook for showcasing tailoring work
- 🔍 Smart tailor discovery with search and filtering
- ⭐ Customer reviews and rating system
- ☁️ Cloudinary-powered image uploads
- 📧 Secure Email OTP verification
- 🔐 JWT-based authentication and authorization
- 📱 Fully responsive across desktop and mobile devices
- ⚡ Fast React + Vite frontend
- 🚀 Deployed using Vercel and Render

# ✨ Features

## 👤 Customer Features

- 🔐 Secure registration and login
- 🔍 Discover skilled local tailors
- 🎯 Filter tailors based on preferences
- 👔 View detailed tailor profiles
- 🧵 Explore tailor portfolios and lookbooks
- ⭐ Read customer ratings and reviews
- ✍️ Submit ratings and reviews
- 👤 Manage personal profile information

---

## 🧵 Tailor Features

- 🔐 Secure authentication
- 📊 Personalized dashboard
- 👤 Manage tailor profile
- ☁️ Upload portfolio images using Cloudinary
- 🧵 Build a digital lookbook
- 🖼️ Showcase completed designs
- ⭐ Receive customer reviews and ratings
- ✏️ Manage published portfolio items

---

## 🔒 Authentication & Security

- JWT-based Authentication
- Email OTP Verification
- Protected Routes
- Secure Session Management
- Password Hashing
- Environment Variable Protection

---

## 📱 User Experience

- Responsive Design
- Modern Luxury-inspired UI
- Mobile Friendly
- Smooth Navigation
- Fast Loading Interface

---

# 🛠️ Tech Stack

## Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- CSS

### Deployment

- Vercel

---

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- Nodemailer
- Cloudinary

### Deployment

- Render

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │   Customer / Tailor  │
                         └──────────┬───────────┘
                                    │
                              HTTP Requests
                                    │
                                    ▼
                  ┌─────────────────────────────┐
                  │ React + TypeScript + Vite   │
                  │        Frontend             │
                  └─────────────┬───────────────┘
                                │
                           Axios API Calls
                                │
                                ▼
                  ┌─────────────────────────────┐
                  │ Express.js REST API         │
                  │        Backend              │
                  └─────────┬─────────┬─────────┘
                            │         │
                            │         │
                       JWT Auth   Image Uploads
                            │         │
                            ▼         ▼
                    MongoDB Atlas  Cloudinary
                            │
                            ▼
                  Customer & Tailor Data

                   Email OTP Verification
                            ▲
                            │
                     Gmail + Nodemailer
```
# 📁 Repository Structure

This repository contains the **frontend** of StitchConnect.  
The backend source code is available in the separate repository linked above.

```text
.
├── public/
├── screenshots/
├── src/
│   ├── assets/
│   ├── Components/
│   ├── customer/
│   ├── Tailor/
│   ├── api.ts
│   ├── App.tsx
│   └── main.tsx
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

---

# 🚀 Getting Started

## Prerequisites

Before running the project locally, ensure you have:

- Node.js (v18 or later)
- npm
- Git
- MongoDB Atlas account (or a local MongoDB instance)
- Cloudinary account
- Gmail account with an App Password enabled

---

## 📥 Clone the Repositories

### Frontend

```bash
git clone https://github.com/malikmittal0802/stitchconnect-frontend.git

cd stitchconnect-frontend
```

### Backend

```bash
git clone https://github.com/malikmittal0802/stitchconnect-backend.git

cd stitchconnect-backend
```

---

# 📦 Install Dependencies

Run the following command inside **both repositories**:

```bash
npm install
```

---

# ▶️ Running the Application

Open **two terminal windows**.

## Terminal 1 — Backend

```bash
cd stitchconnect-backend

npm start
```

or

```bash
npm run dev
```

Backend will run on:

```text
http://localhost:3000
```

---

## Terminal 2 — Frontend

```bash
cd stitchconnect-frontend

npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

Open your browser and visit:

```text
http://localhost:5173
```

You can now explore StitchConnect locally.

---

# ⚙️ Environment Variables

## Frontend (`.env`)

Create a `.env` file in the frontend directory.

```env
VITE_API_BASE_URL=http://localhost:3000
```

For production deployment:

```env
VITE_API_BASE_URL=https://stitchconnect-api.onrender.com
```

---

## Backend (`.env`)

Create a `.env` file in the backend directory.

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

MONGO_URL=your_mongodb_connection_string

GMAIL=your_email@gmail.com
GMAIL_CODE=your_gmail_app_password

PORT=3000

JWT_SECRET=your_jwt_secret
OTP_SECRET=your_otp_secret
```

> **Important**
>
> - Never commit your `.env` file to GitHub.
> - Use a MongoDB Atlas connection string for `MONGO_URL`.
> - `GMAIL_CODE` should be a Google App Password, **not** your Gmail password.
> - Keep all secret keys and credentials private.

---

# 🔐 Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL |
| `MONGO_URL` | MongoDB Atlas connection string |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `GMAIL` | Gmail address used for sending OTP emails |
| `GMAIL_CODE` | Gmail App Password |
| `PORT` | Backend server port |
| `JWT_SECRET` | Secret key used for JWT authentication |
| `OTP_SECRET` | Secret key used for OTP generation and verification |

# 🌍 Deployment

## 🚀 Frontend (Vercel)

The frontend is deployed on **Vercel**.

### Build Command

```bash
npm run build
```

### Output Directory

```text
dist
```

### Environment Variable

```env
VITE_API_BASE_URL=https://stitchconnect-api.onrender.com
```

---

## 🚀 Backend API (Render)

The backend REST API is deployed on **Render**.

### Build Command

```bash
npm install
```

### Start Command

```bash
npm start
```

### Environment Variables

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

MONGO_URL=

GMAIL=
GMAIL_CODE=

PORT=3000

JWT_SECRET=
OTP_SECRET=
```

---

# 🔒 Security Features

StitchConnect follows several security best practices to protect user data and application resources.

- 🔐 JWT-based authentication
- 📧 Email OTP verification
- 🔑 Protected API routes
- ☁️ Secure Cloudinary image storage
- 🔒 Password hashing before storage
- 🚫 Sensitive credentials managed using environment variables
- 🌐 CORS-enabled backend for secure frontend communication

---

# 📊 Feature Completion

| Feature | Status |
|----------|:------:|
| Customer Authentication | ✅ |
| Tailor Authentication | ✅ |
| Customer Dashboard | ✅ |
| Tailor Dashboard | ✅ |
| Tailor Discovery | ✅ |
| Tailor Profile | ✅ |
| Customer Profile | ✅ |
| Tailor Lookbook | ✅ |
| Customer Reviews | ✅ |
| Write Reviews | ✅ |
| Cloudinary Image Uploads | ✅ |
| Email OTP Verification | ✅ |
| Responsive User Interface | ✅ |
| Live Deployment | ✅ |

---

# 🚀 Future Enhancements

- 💬 Real-time messaging between customers and tailors
- 📅 Appointment scheduling system
- 💳 Online payment integration
- ❤️ Wishlist / Favorite Tailors
- 🔔 Real-time notifications
- 📈 Tailor analytics dashboard
- 🌍 Multi-language support
- 🛡️ Admin dashboard for platform management

---

# 👨‍💻 Author

## Malik Mittal

- GitHub: https://github.com/malikmittal0802

---

<div align="center">

### ⭐ If you found this project helpful, consider giving it a star!

Made with ❤️ using **React • TypeScript • Express • MongoDB**

</div>