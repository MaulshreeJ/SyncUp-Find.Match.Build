# graph_runner.py
from agentic_service.graph_with_gemini import run_syncup_pipeline

if __name__ == "__main__":
    test_user = {
        "name": "John Doe",
        "skills": ["React", "Node", "Python"],
        "themes": ["AI", "Collaboration"],
        "linkedin": "https://linkedin.com/in/johndoe",
    }
    output = run_syncup_pipeline(test_user)
    print("\n==== Final Gemini Output ====")
    for key, val in output.items():
        print(f"\n--- {key.upper()} ---")
        print(val)
