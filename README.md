
# 🧑‍🎨 Collaborative Whiteboard App

A real-time collaborative whiteboard built with **Next.js**, **Express.js**, **MongoDB**, and **Socket.IO**. Users can draw, type, and collaborate seamlessly in shared sessions — with document saving, access control, and Google OAuth login.

---

## 🚀 Try Our App!

🌐 **Visit the App**: [Shared Whiteboard](https://shared-whiteboard.vercel.app/)  
_Experience our online whiteboard live by clicking the link above!_

---


## ✨ Features

- 🖌️ **Canvas Drawing**: Smooth freehand drawing with real-time updates
- 📝 **Text Editing**: Collaborative document space for typing
- 🔐 **Authentication**: Login with Google via NextAuth.js
- 💾 **Persistence**: Save/load whiteboards to MongoDB
- 🧑‍🤝‍🧑 **Access Control**: Owner, Editor, Read-Only roles with invite system
- 🔄 **Real-Time Sync**: Socket.IO-based collaboration with room-level updates

---

## 🧱 Architecture Overview

```
Frontend (Next.js + React)
│
├── Auth: NextAuth.js + Google OAuth
│    - Session & token management
│
├── Drawing & Text Canvas
│    - Live sync via Socket.IO
│
├── Axios HTTP API Calls
│    - Save/load whiteboards
│
└── Connects to...

Backend (Express.js)
│
├── REST API (Model–Controller–Route structure)
│    - Routes: /save, /load/:id, /access/:id, /invite
│    - Controllers: DB logic using Mongoose
│
├── Socket.IO Server
│    - Handles draw/text updates
│    - Broadcasts to clients in the same canvas room
│
├── Middleware
│    - JWT token verification for secure routes
│
└── Centralized error handling

↕ Mongoose
↕
MongoDB
- Stores user info and whiteboard documents
```

---


## 🧪 Tech Stack

| Layer       | Tech                          |
|-------------|-------------------------------|
| Frontend    | Next.js, React, Canvas API    |
| Auth        | NextAuth.js, Google OAuth     |
| Real-Time   | Socket.IO                     |
| Backend     | Express.js                    |
| DB Access   | Mongoose                      |
| Database    | MongoDB                       |
| Deployment  | Vercel (frontend), Render (backend) |

---

## 📁 Folder Structure

```
whiteboard-app/
├── client/        # Next.js frontend
│   ├── pages/
│   ├── components/
│   └── context/
├── server/        # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── socket/
```

<!-- ---

## 🛡️ Access Control Logic

- **Owner**: Full access; can edit, invite, and delete
- **Editor**: Can draw/type but not change settings
- **Read-only**: View only
- Visibility options:
  - **Public** (anyone with link)
  - **Private** (invite-only)

--- -->


## 📄 License

MIT License
