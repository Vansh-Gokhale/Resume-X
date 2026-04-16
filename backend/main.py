import os
import io
import json
import time
import asyncio
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import PyPDF2
from google import genai
from google.genai import types

# Load environment variables from .env
load_dotenv()

app = FastAPI(title="ResumeX API")

# Configure CORS
# Using ["*"] temporarily to diagnose deployment issues
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the official Google GenAI Client
# NOTE: The client automatically picks up `GEMINI_API_KEY` from the environment
try:
    client = genai.Client()
except Exception as e:
    client = None
    print(f"Warning: Failed to initialize Gemini client. Ensure GEMINI_API_KEY is set. Error: {e}")

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extracts text from a PDF file using PyPDF2."""
    try:
        pdf_file_obj = io.BytesIO(pdf_bytes)
        reader = PyPDF2.PdfReader(pdf_file_obj)
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted
        return text
    except Exception as e:
        raise Exception(f"Failed to read PDF: {str(e)}")

@app.post("/api/optimize")
async def optimize_resume(
    resume: UploadFile = File(...),
    jd: str = Form(...)
):
    if not client:
        raise HTTPException(
            status_code=500, 
            detail="Gemini client is not initialized. Ensure GEMINI_API_KEY is configured in your .env file."
        )

    if not resume.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        # Read uploaded PDF
        resume_content = await resume.read()
        
        # Extract text from PDF
        resume_text = extract_text_from_pdf(resume_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF upload: {str(e)}")

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from the provided PDF. It might be an image-based PDF.")

    # Construct the prompt for the Gemini model
    prompt = f"""
You are an expert ATS (Applicant Tracking System) optimizer and career coach.
I am providing you with my current resume and a job description (JD).

Job Description:
{jd}

Current Resume:
{resume_text}

Your task:
1. Rewrite and optimize the resume to perfectly tailor it to the job description. Enhance the metrics, incorporate relevant keywords from the JD naturally, and make the bullets more impactful.
2. Draft a personalized cold email to the recruiter summarizing why I am a great fit for the role based on the newly optimized resume and the JD.

Output strictly in JSON format with exactly the following two keys:
"tailored_resume": "The full text of the optimized resume"
"cold_email": "The full text of the cold email"
"""

    # Ordered list of models to try — if one is overloaded, fall through to the next
    MODELS = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash-lite",
        "gemini-flash-latest",
    ]
    MAX_RETRIES = 3          # retries per model
    INITIAL_BACKOFF = 2      # seconds

    last_error = None

    for model_name in MODELS:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                print(f"[ResumeX] Trying model={model_name}, attempt {attempt}/{MAX_RETRIES}")
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                    ),
                )

                response_text = response.text

                # Validate JSON
                result_data = json.loads(response_text)

                if "tailored_resume" not in result_data or "cold_email" not in result_data:
                    raise ValueError("Model response missing required keys.")

                print(f"[ResumeX] Success with model={model_name} on attempt {attempt}")
                return {
                    "tailored_resume": result_data["tailored_resume"],
                    "cold_email": result_data["cold_email"]
                }

            except json.JSONDecodeError as e:
                last_error = e
                print(f"[ResumeX] JSON parse error with {model_name}: {e}")
                break  # retrying won't help for a parse error — try next model

            except Exception as e:
                last_error = e
                error_str = str(e)
                # Retry on 503 / UNAVAILABLE / rate-limit errors
                if any(code in error_str for code in ["503", "UNAVAILABLE", "429", "RESOURCE_EXHAUSTED", "overloaded"]):
                    wait = INITIAL_BACKOFF * (2 ** (attempt - 1))  # exponential backoff
                    print(f"[ResumeX] {model_name} returned transient error, retrying in {wait}s … ({error_str[:120]})")
                    await asyncio.sleep(wait)
                    continue
                else:
                    # Non-transient error — skip retries for this model
                    print(f"[ResumeX] Non-transient error with {model_name}: {error_str[:200]}")
                    break

        # If we exhausted retries for this model, move to the next one
        print(f"[ResumeX] All {MAX_RETRIES} attempts exhausted for {model_name}, trying next model…")

    # All models failed
    raise HTTPException(
        status_code=503,
        detail=f"All Gemini models are currently unavailable. Please try again in a minute. Last error: {str(last_error)}"
    )

@app.post("/api/search-jobs")
async def search_jobs(
    resume: UploadFile = File(...),
    location: str = Form(...)
):
    """Analyze a resume and find matching job opportunities based on the candidate's profile and preferred location."""
    if not client:
        raise HTTPException(
            status_code=500,
            detail="Gemini client is not initialized. Ensure GEMINI_API_KEY is configured in your .env file."
        )

    if not resume.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        resume_content = await resume.read()
        resume_text = extract_text_from_pdf(resume_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF upload: {str(e)}")

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from the provided PDF. It might be an image-based PDF.")

    prompt = f"""
You are an expert career advisor and job market analyst.
Analyze the following resume and find the best matching jobs available in or near the specified location.

Resume:
{resume_text}

Preferred Location: {location}

Your task:
1. Analyze the resume to identify: key skills, experience level, desired role/industry.
2. Based on your deep knowledge of the current job market, generate 8-10 realistic job listings that would be an excellent match for this candidate.
3. For each job, provide a match score and explanation of why it's a good fit.

Output strictly in JSON format with the following structure:
{{
  "candidate_profile": {{
    "name": "Extracted name from resume",
    "top_skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
    "experience_level": "Entry/Mid/Senior/Lead",
    "suggested_title": "Best matching job title"
  }},
  "jobs": [
    {{
      "title": "Job Title",
      "company": "Realistic Company Name that actually hires for this role",
      "location": "City, State/Country",
      "type": "Full-time/Part-time/Contract/Remote",
      "salary_range": "$XX,000 - $XX,000/year",
      "description": "Brief job description in 2-3 sentences",
      "requirements": ["requirement1", "requirement2", "requirement3", "requirement4"],
      "match_score": 85,
      "match_reason": "Brief explanation of why this is a strong match for the candidate",
      "posted_days_ago": 3,
      "linkedin_search_url": "https://www.linkedin.com/jobs/search/?keywords=URL+Encoded+Job+Title&location=URL+Encoded+Location"
    }}
  ]
}}

IMPORTANT RULES:
- Generate realistic company names that actually hire for these roles in the specified location.
- Match scores MUST range from 55 to 97, with realistic variation — not every job should be above 90.
- The linkedin_search_url must be a valid LinkedIn job search URL with properly URL-encoded keywords and location.
- Sort jobs by match_score in descending order.
- Include a mix of job types if applicable (full-time, remote, hybrid).
- Make descriptions specific, realistic, and varied.
- salary_range should reflect realistic market rates for the role and location.
"""

    MODELS = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash-lite",
        "gemini-flash-latest",
    ]
    MAX_RETRIES = 3
    INITIAL_BACKOFF = 2

    last_error = None

    for model_name in MODELS:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                print(f"[ResumeX Jobs] Trying model={model_name}, attempt {attempt}/{MAX_RETRIES}")
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                    ),
                )

                response_text = response.text
                result_data = json.loads(response_text)

                if "jobs" not in result_data:
                    raise ValueError("Model response missing required 'jobs' key.")

                print(f"[ResumeX Jobs] Success with model={model_name} on attempt {attempt} — {len(result_data['jobs'])} jobs found")
                return result_data

            except json.JSONDecodeError as e:
                last_error = e
                print(f"[ResumeX Jobs] JSON parse error with {model_name}: {e}")
                break

            except Exception as e:
                last_error = e
                error_str = str(e)
                if any(code in error_str for code in ["503", "UNAVAILABLE", "429", "RESOURCE_EXHAUSTED", "overloaded"]):
                    wait = INITIAL_BACKOFF * (2 ** (attempt - 1))
                    print(f"[ResumeX Jobs] {model_name} returned transient error, retrying in {wait}s … ({error_str[:120]})")
                    await asyncio.sleep(wait)
                    continue
                else:
                    print(f"[ResumeX Jobs] Non-transient error with {model_name}: {error_str[:200]}")
                    break

        print(f"[ResumeX Jobs] All {MAX_RETRIES} attempts exhausted for {model_name}, trying next model…")

    raise HTTPException(
        status_code=503,
        detail=f"All Gemini models are currently unavailable. Please try again in a minute. Last error: {str(last_error)}"
    )


# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8006, reload=True)
