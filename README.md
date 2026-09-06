<div align="center">

# 🎵 GeetHub - Music Streaming & Community Platform

**Your Localhost for Global Hits — A High-Performance Full-Stack Music Platform**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Go](https://img.shields.io/badge/Go-1.19+-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://go.dev/)
[![Gin Framework](https://img.shields.io/badge/Gin-v1.9-008080?style=for-the-badge&logo=go&logoColor=white)](https://gin-gonic.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

[![GitHub Stars](https://img.shields.io/github/stars/ishanbagra18/Geethub-clientside?style=for-the-badge&logo=github&color=gold)](https://github.com/ishanbagra18/Geethub-clientside/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/ishanbagra18/Geethub-clientside?style=for-the-badge&logo=github&color=blue)](https://github.com/ishanbagra18/Geethub-clientside/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/ishanbagra18/Geethub-clientside?style=for-the-badge&logo=github&color=brightgreen)](https://github.com/ishanbagra18/Geethub-clientside/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## 🎬 Application Demo & Live Experience

![GeetHub Application Walkthrough](docs/assets/geethub_app_demo.webp)

> **GeetHub** merges state-of-the-art music streaming with real-time community engagement, AI-driven vibe recommendations, party rooms, and creator analytics.

---

## 🔑 Demo Account Credentials

Experience the fully authenticated user dashboard out of the box using our demo account:

| Field | Demo Credential |
| :--- | :--- |
| **Email Address** | `gopalsharma@gmail.com` |
| **Password** | `12345678` |

---

## 📸 Interface & Visual Gallery

<div align="center">

### 🏠 Authenticated User Dashboard
*Personalized greeting, curated category quick filters, trending music, and global player.*
<img src="docs/assets/homepage.png" alt="GeetHub Homepage Dashboard" width="900" />

<br/><br/>

### 🎧 Fullscreen Audio Player & Visualizer
*Vinyl turntable layout, playback speed (0.75x - 2x), sleep timer, instant sharing, and playlist manager.*
<img src="docs/assets/active_player.png" alt="GeetHub Fullscreen Player" width="900" />

<br/><br/>

### 📊 Creator Analytics & Vault Dashboard
*Track stats, total play counts, community saves, public/private visibility toggles, and playlist collections.*
<img src="docs/assets/playlists_dashboard.png" alt="GeetHub Playlists Dashboard" width="900" />

<br/><br/>

### 🔐 Modern Authentication Portal
*Sleek JWT-secured sign-in interface with background glassmorphism aesthetics.*
<img src="docs/assets/login_page.png" alt="GeetHub Login Interface" width="900" />

</div>

---

## ✨ Core Features & Highlights

### 🎵 1. Advanced Music Player Engine
- **Playback Control**: Variable playback speed (`0.75x`, `1.0x`, `1.25x`, `1.5x`, `2.0x`).
- **Sleep Timer**: Built-in auto-stop timer options (`15m`, `30m`, `End of Track`).
- **Interaction Tools**: 1-click Like counters, Save to Library, Add to Playlist modal, and direct track link copy.

### ⚡ 2. AI Mood Analysis & Recommendation Engine
- Integrates Hugging Face AI models to analyze user playback trends.
- Displays real-time mood matches (e.g. *"⚡ Upbeat & High Vibrations - Match 88%"*).
- Generates instant playlist tags based on current emotional frequency.

### 📊 3. Creator Analytics & Playlist Vault
- Comprehensive playlist manager located at `/myplaylists`.
- Tracks total plays across user-created playlists, public vs. private visibility statuses, and community save counts.

### 👥 4. Party Rooms & Real-Time Sync
- Multi-user synchronized party rooms powered by WebSockets.
- Listen together in real time with shared queue control and live participant chat.

### 🏆 5. Gamified User Badges & Streaks
- Dynamic badge reward system based on listening milestones, streak counters, and playlist creation.

### 📱 6. Mobile-First Responsive Design
- Full-bleed mobile navigation drawer with touch gestures.
- Custom scrollbar hiding for horizontal list swipes across artists and top charts.

---

## 🏗️ Architecture & Technology Stack

```mermaid
graph TD
    User([User Browser / Mobile]) <--> ReactApp[React 18 + Vite Frontend]
    ReactApp <-->|REST API / JWT| GoBackend[Go Gin API Server]
    ReactApp <-->|WebSockets| PartyServer[WebSocket Party Controller]
    GoBackend <-->|CRUD Operations| MongoDB[(MongoDB Atlas)]
    GoBackend <-->|Audio / Image Storage| Cloudinary[(Cloudinary CDN)]
```

### Stack Overview

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v7, Axios, Lucide React, React Hot Toast
- **Backend**: Go (Gin Framework), JWT Auth, Gorilla WebSockets, Godotenv
- **Database & Storage**: MongoDB Atlas, Cloudinary CDN

---

## ⚡ Quick Start Guide

### Prerequisites
- **Go** v1.19+
- **Node.js** v16+ & **npm**
- **MongoDB** (Local or Atlas URL)
- **Cloudinary Account**

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/ishanbagra18/Geethub-clientside.git
cd music
```

### 2. Backend Setup (`backend/Geethub-serversise`)

```bash
cd backend/Geethub-serversise

# Copy environment file template
copy .env.example .env

# Start the Go Gin server (runs on http://localhost:9000)
go run main.go
```

### 3. Frontend Setup (`frontend/Geethub-clientside`)

```bash
cd ../../frontend/Geethub-clientside

# Install Node dependencies
npm install

# Copy environment file template
copy .env.example .env

# Launch Vite dev server (runs on http://localhost:5173)
npm run dev
```

---

## 📚 API Endpoints Summary

| Endpoint | Method | Description | Auth Required |
| :--- | :---: | :--- | :---: |
| `/api/auth/login` | `POST` | Authenticate user and issue JWT token | ❌ |
| `/api/auth/signup` | `POST` | Register new account | ❌ |
| `/api/music/songs` | `GET` | Fetch music catalog & trending tracks | ❌ |
| `/api/playlists` | `GET/POST` | Get user playlists or create new playlist | ✅ |
| `/api/party/join` | `POST` | Join real-time music party room | ✅ |
| `/api/badges` | `GET` | Retrieve user badges & achievements | ✅ |
| `/api/mood/analyze` | `GET` | AI mood analysis & recommendation tags | ✅ |

---

## 🛡️ Community Standards & Governance

GeetHub adheres to open-source community standards:

- 📜 **[License](LICENSE)**: Licensed under the permissive MIT License.
- 🤝 **[Contributing Guidelines](CONTRIBUTING.md)**: Guidelines for contributing code, reporting bugs, and submitting PRs.
- 🛡️ **[Security Policy](SECURITY.md)**: Security vulnerability reporting process and best practices.
- 📋 **[Code of Conduct](CODE_OF_CONDUCT.md)**: Contributor Covenant v2.1 code of conduct.
- 🐛 **[Issue Templates](.github/ISSUE_TEMPLATE/)**: Structured Bug Report & Feature Request templates.
- 🔀 **[Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md)**: PR submission checklist.

---

<div align="center">

**Built with ❤️ using Go, React, & Tailwind CSS**

</div>
