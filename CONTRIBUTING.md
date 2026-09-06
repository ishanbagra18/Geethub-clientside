# Contributing to GeetHub 🎵

Thank you for your interest in contributing to **GeetHub**! We welcome contributions from developers of all skill levels.

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🚀 Getting Started

### Prerequisites

Before starting, ensure you have the following installed on your local machine:

- **Go** (v1.19 or higher)
- **Node.js** (v16.0.0 or higher) & **npm**
- **MongoDB** (Local instance or MongoDB Atlas cluster)
- **Git**

### Step-by-Step Setup

1. **Fork the Repository**
   Click the "Fork" button at the top right of the GitHub repository page to create your copy.

2. **Clone your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Geethub-clientside.git
   cd music
   ```

3. **Set up Environment Variables**
   - **Backend (`backend/Geethub-serversise/.env`)**:
     ```env
     PORT=9000
     MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/geethub
     SECRET_KEY=your-jwt-secret-key
     CLOUDINARY_URL=cloudinary://key:secret@cloudname
     CORS_ORIGINS=http://localhost:5173
     ```
   - **Frontend (`frontend/Geethub-clientside/.env`)**:
     ```env
     VITE_API_URL=http://localhost:9000
     ```

4. **Install Dependencies & Run Locally**
   - Backend:
     ```bash
     cd backend/Geethub-serversise
     go mod tidy
     go run main.go
     ```
   - Frontend:
     ```bash
     cd frontend/Geethub-clientside
     npm install
     npm run dev
     ```

---

## 🛠️ Contribution Workflow

### 1. Choose or Create an Issue
- Browse existing [Issues](https://github.com/ishanbagra18/Geethub-clientside/issues) to find tasks labeled `good first issue` or `help wanted`.
- If proposing a new feature or reporting a bug, please create a new issue using our issue templates before starting work.

### 2. Create a Feature Branch
Use a descriptive branch name following these conventions:
- `feature/description` for new features
- `fix/description` for bug fixes
- `docs/description` for documentation updates

```bash
git checkout -b feature/user-playlists-enhancement
```

### 3. Commit Guidelines
- Write clear, concise commit messages in the present tense:
  ```bash
  git commit -m "add: implement party room chat pagination"
  ```
- Keep commits focused on a single change or logical group of changes.

### 4. Create a Pull Request
- Push your branch to your fork:
  ```bash
  git push origin feature/user-playlists-enhancement
  ```
- Open a Pull Request against the `main` branch of `ishanbagra18/Geethub-clientside`.
- Fill out the provided [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).

---

## 🎨 Code Style Guidelines

### Go Backend (`backend/Geethub-serversise`)
- Follow standard Go conventions (`gofmt` formatted).
- Group routes clearly in `routes/` and business logic in `controllers/`.
- Handle errors gracefully and return standardized JSON HTTP responses.

### React Frontend (`frontend/Geethub-clientside`)
- Use functional components with hooks.
- Follow component directory structure (`src/pages/`, `src/Components/`, `src/context/`).
- Use Tailwind CSS utility classes and ensure UI elements remain mobile-responsive.
- Avoid hardcoded values; use config files and environment variables where applicable.

---

## 🧪 Testing Guidelines

- Ensure your code builds without warnings or errors.
- Verify that both backend and frontend startup clean (`go run main.go` and `npm run dev`).
- Test modified UI views on both desktop and mobile viewports.

---

## ❓ Need Help?

If you have questions or need guidance:
- Open a discussion or question on GitHub.
- Reach out to the maintainers via issues.

Thank you for helping make GeetHub awesome! 🎧✨
