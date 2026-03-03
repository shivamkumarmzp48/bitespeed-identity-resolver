# 🚀 Bitespeed Identity Resolver

> A full-stack identity resolution service that consolidates customer contacts across multiple purchases.  
> Built as part of the Bitespeed Backend Task.

---

## 🌐 Live Demo

🔹 **Frontend**  
https://bitespeed-identity-resolver.vercel.app  

🔹 **Backend API**  
https://bitespeed-backend-td52.onrender.com  

🔹 **Health Check**  
https://bitespeed-backend-td52.onrender.com/api/health  

---

## 📌 Problem Statement

Customers on FluxKart.com may place multiple orders using:

- Different email addresses  
- Different phone numbers  

The system must intelligently identify and link related contacts into a **single consolidated identity**.

This project implements that identity resolution logic.

---

## ✨ Features

- ✅ Identity consolidation using email & phone matching  
- ✅ Automatic primary & secondary contact management  
- ✅ Smart merging of multiple primary contacts  
- ✅ JWT-based authentication (Signup/Login)  
- ✅ RESTful API architecture  
- ✅ Fully responsive frontend  
- ✅ Production deployment (Render + Vercel + Neon)

---

## 🛠️ Tech Stack

### 🔹 Backend
- **Node.js**
- **Express.js**
- **TypeScript**
- **PostgreSQL (Neon)**
- **JWT Authentication**
- **CORS Enabled**

### 🔹 Frontend
- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Axios**
- **React Router**

---

## 📡 API Documentation

### 🔐 Authentication

#### Signup
`POST /api/auth/signup`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login
`POST /api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### 🔎 Identify Contact

`POST /api/identify`

#### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

#### Request Body
```json
{
  "email": "customer@example.com",
  "phoneNumber": "1234567890"
}
```

#### Response
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": [
      "primary@example.com",
      "secondary@example.com"
    ],
    "phoneNumbers": [
      "1234567890"
    ],
    "secondaryContactIds": [2]
  }
}
```

---

## 🧠 Identity Resolution Logic

The service follows these rules:

1. If no matching email or phone exists → create **new primary contact**
2. If one match exists → create **secondary contact**
3. If multiple primary contacts are found →  
   - The oldest becomes **primary**
   - Newer primaries are demoted to **secondary**
4. Response always returns:
   - Primary Contact ID  
   - All linked emails  
   - All linked phone numbers  
   - Secondary Contact IDs  

---

## 🧪 Test Scenarios

### ✅ Scenario 1 – New Customer

Input:
```
Email: doc@brown.com
Phone: 555-0101
```

Result:
- New primary contact created

---

### ✅ Scenario 2 – Secondary Contact Creation

Step 1:
```
Email: lorraine@hillvalley.edu
Phone: 123456
```

Step 2:
```
Email: mcfly@hillvalley.edu
Phone: 123456
```

Result:
- Both emails linked
- Secondary contact created

---

### ✅ Scenario 3 – Merging Primary Contacts

Step 1:
```
Email: george@hillvalley.edu
Phone: 919191
```

Step 2:
```
Email: biffsucks@hillvalley.edu
Phone: 717171
```

Step 3:
```
Email: george@hillvalley.edu
Phone: 717171
```

Result:
- Contacts merged
- Newer primary demoted to secondary

---

## ⚙️ Local Development Setup

### 📌 Prerequisites

- Node.js v18+
- PostgreSQL

---

### 🔹 Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Configure `.env`:

```env
PORT=3000
DB_URL=postgresql://username:password@localhost:5432/bitespeed
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

Run:

```bash
npm run dev
```

---

### 🔹 Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Configure `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

Run:

```bash
npm run dev
```

---

## 📂 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.ts
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.tsx
│   └── package.json
│
└── README.md
```

---

## 🚀 Deployment

### 🗄 Database
- Hosted on **Neon (PostgreSQL)**

Connection string format:
```
postgresql://user:pass@host/db?sslmode=require
```

---

### ⚙️ Backend
- Hosted on **Render**
- Root directory: `backend`

Build:
```bash
npm install && npm run build
```

Start:
```bash
npm start
```

---

### 🌐 Frontend
- Hosted on **Vercel**
- Root directory: `frontend`

Environment variable:
```
VITE_API_URL=<your-backend-url>/api
```

---

## 🔒 Security

- JWT-based authentication
- Environment-based configuration
- Secure database connection with SSL
- CORS configuration for controlled access

---

## 👨‍💻 Author

**Shivam Kumar**  
GitHub: https://github.com/shivamkumarmzp48  

---
