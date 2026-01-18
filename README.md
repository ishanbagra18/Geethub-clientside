# 🎵 GeetHub - Music Streaming Application

A full-stack music streaming platform built with Go (Gin) and React (Vite).
 
## 🚀 Quick Start

### Prerequisites
- **Go** 1.19 or higher
- **Node.js** 16 or higher  
- **MongoDB** (local or Atlas)
- **Cloudinary** account (for image uploads)

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd music

# Install backend dependencies
cd backend/Geethub-serversise
go mod tidy

# Install frontend dependencies
cd ../../frontend/Geethub-clientside
npm install
```

### 2. Configure Environment

**Backend:**
```bash
cd backend/Geethub-serversise
copy .env.example .env
# Edit .env with your MongoDB URL, Cloudinary credentials, etc.
```

**Frontend:**
```bash
cd frontend/Geethub-clientside
copy .env.example .env
# Default is fine for local development (http://localhost:9000)
```

### 3. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend/Geethub-serversise
go run main.go
# Server runs on http://localhost:9000
```

**Terminal 2 - Frontend:**
```bash
cd frontend/Geethub-clientside
npm run dev
# App runs on http://localhost:5173
```

### 4. Access the App

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
music/
├── backend/
│   └── Geethub-serversise/
│       ├── controllers/     # API controllers
│       ├── database/        # MongoDB connection
│       ├── helpers/         # Auth, token, cloudinary helpers
│       ├── middleware/      # Authentication middleware
│       ├── models/          # Data models
│       ├── routes/          # API routes
│       ├── main.go          # Entry point
│       ├── .env             # Environment variables (create from .env.example)
│       └── .env.example     # Environment template
│
├── frontend/
│   └── Geethub-clientside/
│       ├── src/
│       │   ├── config/      # API configuration
│       │   ├── pages/       # Page components
│       │   ├── context/     # React contexts
│       │   └── Components/  # Reusable components
│       ├── .env             # Environment variables (create from .env.example)
│       └── .env.example     # Environment template
│
├── docs/
│   └── api_docs.md          # API documentation
│
├── SETUP.md                 # Detailed setup guide
├── DEPLOYMENT.md            # Deployment instructions
└── README.md                # This file
```

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=9000
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/geethub
SECRET_KEY=your-jwt-secret-key
CLOUDINARY_URL=cloudinary://key:secret@cloudname
CORS_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:9000
```

## 🎯 Features

- 🔐 User authentication (JWT)
- 🎵 Music streaming
- 📝 Playlist management
- 👤 User profiles
- 🎨 Artist pages
- 💬 Messaging system
- 📊 Statistics dashboard
- ❤️ Like & save songs
- 🔍 Search functionality
- 📱 Responsive design

## 🛠️ Tech Stack

### Backend
- **Framework:** Go (Gin)
- **Database:** MongoDB
- **Authentication:** JWT
- **File Storage:** Cloudinary
- **WebSocket:** Gorilla WebSocket

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[docs/api_docs.md](docs/api_docs.md)** - API endpoints documentation

## 🚢 Deployment

### Backend (Render/Railway)
1. Connect GitHub repository
2. Set environment variables
3. Deploy `backend/Geethub-serversise`

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Set `VITE_API_URL` to backend URL
3. Deploy `frontend/Geethub-clientside`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🔒 Security

- ✅ Environment variables for sensitive data
- ✅ JWT-based authentication
- ✅ CORS configuration
- ✅ Password hashing
- ✅ Input validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 📧 Support

For issues and questions:
- Check [SETUP.md](SETUP.md) for setup help
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help
- Create an issue on GitHub

---

**Built with ❤️ using Go and React**
