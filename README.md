<div align="center">

# 🎵 GeetHub

**A modern, full-stack music streaming platform built with Go and React**

Stream, save, and share music with playlists, artist pages, real-time messaging, and a fully responsive player — inspired by the core experience of apps like Spotify.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Go](https://img.shields.io/badge/Go-1.19+-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://go.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

[![GitHub Stars](https://img.shields.io/badge/GitHub-Stars-gold?style=for-the-badge&logo=github)](https://github.com/ishanbagra18/Geethub-clientside/stargazers)
[![GitHub Repo](https://img.shields.io/badge/Repo-Geethub--clientside-blue?style=for-the-badge&logo=github)](https://github.com/ishanbagra18/Geethub-clientside)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Live Demo](#) · [Features](#-features) · [Quick Start](#-quick-start) · [Architecture](#-architecture) · [API Docs](#-api-documentation) · [Deployment](#-deployment)

</div>

---

## 📸 Preview

> Add a screenshot or short GIF of the app here — this is the single biggest thing that makes visitors stick around and star the repo. A 2–3 second clip of the player + swipe carousels in action works great.

<div align="center">
  <!-- <img src="docs/screenshots/home.png" width="800" alt="GeetHub home screen" /> -->
  <!-- <img src="docs/screenshots/demo.gif" width="800" alt="GeetHub demo" /> -->
</div>

---

## ✨ Features

| Category | Features |
|----------|----------|
| 🔐 **Auth** | JWT-based authentication, password hashing, protected routes |
| 🎵 **Music** | Streaming, likes, saves, search |
| 📋 **Library** | Playlist creation & management |
| 👤 **Social** | User profiles, artist pages, messaging |
| 📊 **Insights** | Statistics dashboard |
| 📱 **UX** | Full mobile responsiveness, fluid layouts, dynamic headers, aspect-scaling cover art |
| 📲 **Navigation** | Full-screen overlay drawer with solid background, blocking clicks on underlying pages |
| 🎛️ **Player** | Smart global player that adapts controls for mobile formats |
| 🎚️ **Swipe UI** | Native-app-feel horizontal swipe carousels for featured artists & playlists |

---

## 🚀 Quick Start

### Prerequisites

- **[Go](https://go.dev/dl/)** 1.19+
- **[Node.js](https://nodejs.org/)** 16+
- **[MongoDB](https://www.mongodb.com/)** (local or [Atlas](https://www.mongodb.com/atlas))
- **[Cloudinary](https://cloudinary.com/)** account (for media uploads)

### 1. Clone the Repository

```bash
git clone https://github.com/ishanbagra18/Geethub-clientside.git
cd Geethub-clientside
```

> This repo contains the frontend only. The backend lives in a separate repo — see [Geethub-serversise](https://github.com/ishanbagra18/Geethub-serversise). Clone both if you want to run the full stack locally.

### 2. Set Up the Backend

```bash
git clone https://github.com/ishanbagra18/Geethub-serversise.git
cd Geethub-serversise

# Install Go dependencies
go mod tidy

# Create and configure your environment file
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PORT=9000
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/geethub
SECRET_KEY=your-super-secret-jwt-key
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
CORS_ORIGINS=http://localhost:5173
```

### 3. Set Up the Frontend

```bash
cd Geethub-clientside

# Install Node dependencies
npm install

# Create and configure your environment file
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:9000
```

### 4. Run the Application

Open **two terminals**:

**Terminal 1 — Backend**
```bash
cd Geethub-serversise
go run main.go
# ✅ Running at http://localhost:9000
```

**Terminal 2 — Frontend**
```bash
cd Geethub-clientside
npm run dev
# ✅ Running at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser and you're ready to go! 🎉

---

## 🏗️ Architecture

```
Geethub/
├── Geethub-serversise/         # Backend (separate repo)
│   ├── controllers/            # Route handler logic
│   ├── database/                # MongoDB connection setup
│   ├── helpers/                 # Auth, JWT, Cloudinary utilities
│   ├── middleware/               # Authentication middleware
│   ├── models/                   # Data models / schemas
│   ├── routes/                   # API route definitions
│   ├── main.go                   # Application entry point
│   ├── .env.example
│   └── .env                      # ⚠️ Local config, not committed
│
├── Geethub-clientside/          # Frontend (this repo)
│   └── src/
│       ├── config/                # API base URL & Axios setup
│       ├── context/                # React global state (auth, player, etc.)
│       ├── pages/                   # Top-level page components
│       └── Components/               # Shared/reusable UI components
│
├── docs/
│   └── api_docs.md               # Full API endpoint reference
│
├── SETUP.md                       # Detailed setup guide
├── DEPLOYMENT.md                  # Production deployment guide
└── README.md                      # You are here
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| [Go (Gin)](https://gin-gonic.com/) | HTTP framework |
| [MongoDB](https://www.mongodb.com/) | Primary database |
| [JWT](https://jwt.io/) | Stateless authentication |
| [Cloudinary](https://cloudinary.com/) | Media storage & delivery |
| [Gorilla WebSocket](https://github.com/gorilla/websocket) | Real-time messaging |

### Frontend
| Technology | Purpose |
|------------|---------|
| [React 18](https://react.dev/) | UI framework |
| [Vite](https://vitejs.dev/) | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [React Router v7](https://reactrouter.com/) | Client-side routing |
| [Axios](https://axios-http.com/) | HTTP client |
| [Lucide React](https://lucide.dev/) | Icon library |
| [React Hot Toast](https://react-hot-toast.com/) | Notifications |

---

## 📚 API Documentation

Full API docs are available in [`docs/api_docs.md`](docs/api_docs.md).

The backend server for this project is hosted separately:
👉 [Geethub Server Repository](https://github.com/ishanbagra18/Geethub-serversise)

---

## 🚢 Deployment

### Backend — Render / Railway

1. Connect your GitHub repository
2. Set the root directory to the backend repo's root
3. Add all environment variables from `.env.example`
4. Deploy

### Frontend — Vercel / Netlify

1. Connect your GitHub repository
2. Set `VITE_API_URL` to your deployed backend URL
3. Deploy

> 📖 See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed step-by-step deployment instructions.

---

## 🗺️ Roadmap

- [ ] Offline / cached playback
- [ ] Collaborative playlists
- [ ] Lyrics sync
- [ ] Recommendation engine

> Feel free to open an issue if you'd like to suggest or pick up one of these.

---

## 🔒 Security

- 🔑 All secrets stored in environment variables — never hardcoded
- 🛡️ JWT-based stateless authentication
- 🔐 Bcrypt password hashing
- 🌐 CORS configured per environment
- ✅ Input validation on all endpoints

---

## 🤝 Contributing

Contributions are welcome!

```bash
# 1. Fork the repository on GitHub

# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature"

# 4. Push to your fork
git push origin feature/your-feature-name

# 5. Open a Pull Request
```

Please follow [conventional commits](https://www.conventionalcommits.org/) for commit messages.

---

## ⭐ Show Your Support

If you found this project useful or interesting, consider giving it a star — it helps others discover it and means a lot as a solo-built project.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙋 Support

- 📖 Setup issues? Check [SETUP.md](SETUP.md)
- 🚀 Deployment issues? Check [DEPLOYMENT.md](DEPLOYMENT.md)
- 🐛 Found a bug? [Open an issue](../../issues/new)

---

<div align="center">

Built with ❤️ using **Go** and **React**

<!-- Earning GitHub Profile Badges: Pull Shark, Quickdraw, YOLO & Pair Extraordinaire -->
<!-- Pair Extraordinaire Co-Author Badge Update -->

</div>
