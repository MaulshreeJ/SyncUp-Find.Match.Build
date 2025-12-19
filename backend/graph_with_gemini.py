import os
import google.generativeai as genai
from typing import Dict, Any

# Configure the Gemini model using the environment variable
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    print("✅ Gemini API Key configured")
else:
    print("⚠️ No GEMINI_API_KEY set — mock responses will be used")

def call_gemini(prompt: str) -> str:
    """Call Gemini 2.5 Flash to get reasoning; fallback mock if key missing."""
    if not api_key:
        return f"[MOCK GEMINI] {prompt[:120]}..."

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")  # or "gemini-2.5-flash"
        response = model.generate_content(prompt)
        if hasattr(response, "text"):
            return response.text.strip()
        else:
            return "[ERROR] No text in response"
    except Exception as e:
        return f"[Gemini Error] {str(e)}"


# Agentic nodes

def profile_analyzer_agent(user_profile: Dict[str, Any]) -> Dict[str, Any]:
    missing = [k for k, v in user_profile.items() if not v]
    prompt = (
        f"Inspect this user profile: {user_profile}\\n"
        f"List missing or inconsistent fields in one sentence."
    )
    reasoning = call_gemini(prompt)
    cleaned = {k: v for k, v in user_profile.items() if v}
    cleaned["missing_fields"] = missing
    return {
        "cleaned_profile": cleaned,
        "reasoning": reasoning
    }

def skill_verifier_agent(cleaned_profile: Dict[str, Any]) -> Dict[str, Any]:
    skills = cleaned_profile.get("skills", [])
    verified = {s: len(s) > 2 for s in skills}
    prompt = f"Evaluate credibility of these skills: {skills}. Summarize trustworthiness."
    reasoning = call_gemini(prompt)
    return {
        "verified_skills": verified,
        "reasoning": reasoning
    }

def trust_score_agent(verified_skills: Dict[str, bool]) -> Dict[str, Any]:
    total = len(verified_skills)
    positive = sum(1 for v in verified_skills.values() if v)
    score = int((positive / total) * 100) if total else 0
    prompt = f"Explain how trust score {score} is derived from verified skills: {list(verified_skills.items())}."
    reasoning = call_gemini(prompt)
    return {
        "trust_score": score,
        "reasoning": reasoning
    }

def matchmaking_agent(trust_score: int, verified_skills: Dict[str, bool], themes: list) -> Dict[str, Any]:
    # Example match logic — replace with your data source later
    matches = [
        {"name": "Teammate_A", "compatibility": trust_score * 0.9},
        {"name": "Teammate_B", "compatibility": trust_score * 0.8}
    ]
    prompt = (
        f"Given trust score {trust_score}, skills {list(verified_skills.keys())}, "
        f"and user themes {themes}, suggest two ideal teammates."
    )
    reasoning = call_gemini(prompt)
    return {
        "recommended_matches": matches,
        "reasoning": reasoning
    }

def ai_coach_agent(cleaned_profile: Dict[str, Any], trust_score: int) -> Dict[str, Any]:
    missing = cleaned_profile.get("missing_fields", [])
    prompt = (
        f"Based on this user profile {cleaned_profile} and trust score {trust_score}, "
        f"give short personalized coaching tips to improve collaboration and credibility."
    )
    reasoning = call_gemini(prompt)
    advice = f"Focus on improving {', '.join(missing) if missing else 'soft skills'}."
    return {"ai_coach_advice": advice, "reasoning": reasoning}


def run_syncup_pipeline(user_profile: Dict[str, Any]) -> Dict[str, Any]:
    print("🔧 Running SyncUp pipeline with:", user_profile)

    # Step 1: Analyze profile
    profile_out = profile_analyzer_agent(user_profile)

    # Step 2: Verify skills
    skills_out = skill_verifier_agent(profile_out["cleaned_profile"])

    # Step 3: Compute trust score
    trust_out = trust_score_agent(skills_out["verified_skills"])

    # Step 4: Matchmaking
    match_out = matchmaking_agent(
        trust_out["trust_score"],
        skills_out["verified_skills"],
        user_profile.get("themes", []),
    )

    # Step 5: AI coach
    coach_out = ai_coach_agent(profile_out["cleaned_profile"], trust_out["trust_score"])

    # Combine all results
    return {
        "status": "success",
        "agents": {
            "profile_analysis": profile_out,
            "skill_verification": skills_out,
            "trust_computation": trust_out,
            "matchmaking": match_out,
            "ai_coach": coach_out
        }
    }
