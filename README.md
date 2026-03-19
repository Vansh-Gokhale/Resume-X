<div align="center">
  
  # ✨ ResumeX
  **The AI-Powered ATS Optimizer & Cold Email Generator**

  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

  <p align="center">
    ResumeX is a premium, dark-mode first application that instantly tailors your resume perfectly to any Job Description. Upload your PDF, paste the JD, and let our model seamlessly craft the ultimate optimized resume and a personalized cold email for recruiters.
  </p>

</div>

---

## 🚀 Features

- **Automated ATS Tailoring:** Intelligently extracts text from PDFs and rewrites it to naturally feature the employer's desired keywords and metrics.
- **Cold Email Generation:** Automatically drafts a convincing, professional pitch to recruiters detailing exactly why you are the best fit.
- **Premium User Interface:** A stunningly polished design utilizing subtle glassmorphism, Framer Motion stagger animations, and Shadcn UI logic.
- **Robust FastAPI Backend:** Strictly fully-typed JSON outputs validated directly through the official `google-genai` SDK.
- **Client-Side PDF Export:** Instantly download your new customized resume directly into a PDF payload on the frontend using `jsPDF`.

## 🛠️ Tech Stack

### Frontend (Next.js 16 App Router)
- **Framework:** React / Next.js
- **Styling:** Tailwind CSS v4, Framer Motion, Shadcn UI
- **PDF Export:** jsPDF
- **File Handling:** `react-dropzone`

### Backend (Python FastAPI)
- **Server:** FastAPI, Uvicorn
- **AI Integration:** Official `google-genai` ('gemini-2.5-flash')
- **PDF Extraction:** PyPDF2

---

## ⚙️ Local Development Quickstart

To run the application locally, you'll need to run both the frontend and backend servers.

### 1. Set up the Python Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend server on `localhost:8000`:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Set up the Next.js Frontend

Open a **new** terminal session and navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```

The frontend will run automatically on **http://localhost:3006**.
