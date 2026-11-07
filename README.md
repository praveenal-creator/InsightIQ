# InsightIQ – AI Data Analyst Agent

InsightIQ is a web-based data analytics platform designed to help users upload, explore, manage, and understand datasets through an intuitive interface.

The project aims to simplify data analysis by combining dataset management, data exploration, visualization, and AI-powered analytical capabilities.

## 🚀 Live Application

**Frontend:** https://insightiq.praveenaloganathan58.workers.dev/

**Backend API:** https://insightiq-api-fhvk.onrender.com

## ✨ Features

### Implemented
- User authentication using Supabase.
- Dataset upload supporting CSV, XLSX, XLS, and JSON.
- Cloud dataset storage using Supabase Storage.
- Dataset listing and management.
- Dataset preview with pagination.
- Dataset renaming and description updates.
- Dataset deletion from cloud storage and database.
- Dataset metadata and schema information.
- Data quality score calculation.
- Responsive analytics interface.

### Planned / In Progress
- AI-generated executive summaries.
- Automated analytical findings.
- AI-powered recommendations.
- Advanced data visualizations.
- Downloadable PDF analytical reports.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, TypeScript |
| Backend | Python, FastAPI |
| Data Processing | Pandas |
| Database | Supabase |
| Authentication | Supabase Auth |
| File Storage | Supabase Storage |
| Frontend Hosting | Cloudflare Workers |
| Backend Hosting | Render |
| Version Control | Git & GitHub |

## 🏗️ Project Architecture

```text
InsightIQ/
│
├── src/
│   ├── components/
│   ├── views/
│   ├── utils/
│   └── lib/
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── storage.py
│   ├── supabase_storage.py
│   └── requirements.txt
│
├── public/
├── package.json
└── README.md
```

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/praveenal-creator/InsightIQ.git
cd InsightIQ
```

### 2. Frontend setup

```bash
npm install
```

Configure the required frontend environment variables in your local environment file:

```env
VITE_API_BASE_URL=YOUR_BACKEND_URL
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Start the frontend:

```bash
npm run dev
```

### 3. Backend setup

Create and activate a Python virtual environment, then install dependencies:

```bash
python -m venv venv
```

Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install requirements:

```bash
pip install -r backend/requirements.txt
```

Configure the backend environment variables:

```env
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Start the backend:

```bash
uvicorn backend.main:app --reload
```

## 🔐 Security

- Keep API keys and secret credentials in environment variables.
- Never commit `.env` files or private credentials.
- Use appropriate Supabase authentication and database/storage access policies.

## 🌐 Deployment

- Frontend: Cloudflare Workers
- Backend: Render
- Database and authentication: Supabase

## 📌 Project Status

InsightIQ is an actively developed project. Core dataset management and cloud integration features are implemented. AI-powered reporting capabilities are planned for future development.

## 👨‍💻 Developer

**Praveen**

GitHub: https://github.com/praveenal-creator

---

*InsightIQ – Turning datasets into meaningful insights.*
