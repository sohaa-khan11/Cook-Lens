# CookLens

CookLens is an intelligent, AI-powered culinary assistant that transforms the ingredients you have into five-star recipes. Using computer vision to detect ingredients from a simple scan, it builds a digital archive (vault) and synthesizes personalized, zero-waste recipes tailored to what's in your kitchen.

## Project Structure

This repository is split into two main parts:
- **`backend/`**: A FastAPI application powered by Python and YOLOv8 for ingredient detection, connected to the Gemini API for recipe synthesis.
- **`frontend/`**: A modern, responsive Next.js application built with React, Tailwind CSS, and Framer Motion, utilizing the "Lucid Assistant" design system.

---

## 🚀 Setup & Installation

### 1. Backend Setup (FastAPI + YOLOv8)

Navigate to the backend directory:
```bash
cd backend
```

**Create and activate a virtual environment:**
- Windows:
  ```bash
  python -m venv venv
  .\venv\Scripts\activate
  ```
- macOS/Linux:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Configure Environment Variables:**
Create a `.env` file in the `backend/` directory and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_api_key_here
```

**Run the Backend Server:**
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://127.0.0.1:8000`.

---

### 2. Frontend Setup (Next.js)

Navigate to the frontend directory:
```bash
cd frontend
```

**Install dependencies:**
```bash
npm install
```

**Configure Environment Variables (Optional):**
If you need to customize the API URL, you can create a `.env.local` file in the `frontend/` directory. By default, it points to `http://127.0.0.1:8000`.

**Run the Frontend Development Server:**
```bash
npm run dev
```
The web application will be available at `http://localhost:3000`.

---

## 🎯 Usage Flow

1. Open the frontend application in your browser.
2. Click **Start Scan** to upload or take a picture of your kitchen counter.
3. The YOLOv8 model on the backend will detect the ingredients and populate your **Vault**.
4. Click **Generate Recipes** to let the Gemini API synthesize creative, step-by-step recipes.
5. Cook, learn, and enjoy!

---

## 🛠 Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, Framer Motion
- **Backend:** Python, FastAPI, Ultralytics YOLOv8, Google Generative AI (Gemini)
