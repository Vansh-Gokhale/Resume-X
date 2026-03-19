<div align="center">
  
  # ✨ ResumeX
  **The AI-Powered ATS Optimizer & Cold Email Generator**

  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![n8n](https://img.shields.io/badge/n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)](https://n8n.io/)
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
- **n8n Automation Workflows:** Completely replaces hard-coded Python endpoints with visually programmed, highly scalable n8n workflows that instantly parse files and orchestrate the Gemini prompt chains.
- **Client-Side PDF Export:** Instantly download your new customized resume directly into a PDF payload on the frontend using `jsPDF`.

## 🛠️ Tech Stack

### Frontend (Next.js 16 App Router)
- **Framework:** React / Next.js
- **Styling:** Tailwind CSS v4, Framer Motion, Shadcn UI
- **PDF Export:** jsPDF
- **File Handling:** `react-dropzone`

### Backend (n8n Workflow Automation)
- **Workflow Engine:** n8n (Node-based automation)
- **AI Integration:** Native Google Gemini API Node ('gemini-2.5-flash')
- **Data Parsing:** Automated PDF Buffer Extraction within n8n

---

## ⚙️ Local Development Quickstart

To run the application locally, you'll need to run both the frontend and backend servers.

### 1. Set up the n8n Workflow

To handle the AI and PDF extraction, you will run an n8n webhook:
1. Spin up a local or cloud **n8n** instance.
2. Build a workflow connecting a `Webhook` node (listening for POST requests containing the PDF payload and JD text) to a `Google Gemini` API node.
3. Configure your Google Gemini Credentials securely inside the n8n dashboard.
4. Output the structured JSON containing `tailored_resume` and `cold_email` back as the webhook response.

### 2. Set up the Next.js Frontend

Open a **new** terminal session and navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```

The frontend will run automatically on **http://localhost:3006**.
