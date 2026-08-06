<div align="center">

# 🎵 GeetHub

**A modern, full-stack music streaming platform**

[![Go](https://img.shields.io/badge/Go-1.19+-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Features](#-features) · [Quick Start](#-quick-start) · [Architecture](#-architecture) · [API Docs](#-api-documentation) · [Deployment](#-deployment)

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
| 📱 **UX** | Responsive design, real-time updates via WebSocket |

---

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:

- **[Go](https://go.dev/dl/)** 1.19+
- **[Node.js](https://nodejs.org/)** 16+
- **[MongoDB](https://www.mongodb.com/)** (local or [Atlas](https://www.mongodb.com/atlas))
- **[Cloudinary](https://cloudinary.com/)** account (for media uploads)

---

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd music
```

---

### 2. Set Up the Backend

```bash
cd backend/Geethub-serversise

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

---

### 3. Set Up the Frontend

```bash
cd frontend/Geethub-clientside

# Install Node dependencies
npm install

# Create and configure your environment file
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:9000
```

---

### 4. Run the Application

Open **two terminals** and run the following:

**Terminal 1 — Backend**
```bash
cd backend/Geethub-serversise
go run main.go
# ✅ Running at http://localhost:9000
```

**Terminal 2 — Frontend**
```bash
cd frontend/Geethub-clientside
npm run dev
# ✅ Running at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser and you're ready to go! 🎉

---

## 🏗️ Architecture

```
music/
├── backend/
│   └── Geethub-serversise/
│       ├── controllers/        # Route handler logic
│       ├── database/           # MongoDB connection setup
│       ├── helpers/            # Auth, JWT, Cloudinary utilities
│       ├── middleware/         # Authentication middleware
│       ├── models/             # Data models / schemas
│       ├── routes/             # API route definitions
│       ├── main.go             # Application entry point
│       ├── .env.example        # Environment variable template
│       └── .env                # ⚠️ Your local config (do not commit)
│
├── frontend/
│   └── Geethub-clientside/
│       └── src/
│           ├── config/         # API base URL & Axios setup
│           ├── context/        # React global state (auth, player, etc.)
│           ├── pages/          # Top-level page components
│           └── Components/     # Shared/reusable UI components
│
├── docs/
│   └── api_docs.md             # Full API endpoint reference
│
├── SETUP.md                    # Detailed setup guide
├── DEPLOYMENT.md               # Production deployment guide
└── README.md                   # You are here
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

The backend server (for this project) is hosted separately:
👉 [Geethub Server Repository](https://github.com/ishanbagra18/Geethub-serversise)

---

## 🚢 Deployment

### Backend — Render / Railway

1. Connect your GitHub repository
2. Set the root directory to `backend/Geethub-serversise`
3. Add all environment variables from `.env.example`
4. Deploy

### Frontend — Vercel / Netlify

1. Connect your GitHub repository
2. Set the root directory to `frontend/Geethub-clientside`
3. Set `VITE_API_URL` to your deployed backend URL
4. Deploy

> 📖 See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed step-by-step deployment instructions.

---

## 🔒 Security

- 🔑 All secrets stored in environment variables — never hardcoded
- 🛡️ JWT-based stateless authentication
- 🔐 Bcrypt password hashing
- 🌐 CORS configured per environment
- ✅ Input validation on all endpoints

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

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

</div>
