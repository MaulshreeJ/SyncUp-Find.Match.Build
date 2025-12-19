#!/usr/bin/env python3
"""
Create a sample PDF resume for testing
"""

try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

def create_sample_pdf_resume():
    """Create a sample PDF resume for testing"""
    if not HAS_REPORTLAB:
        print("❌ ReportLab not available. Install with: pip install reportlab")
        return False
    
    filename = "career_agent/sample_resume.pdf"
    
    # Create PDF
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # Title
    c.setFont("Helvetica-Bold", 20)
    c.drawString(50, height - 50, "Sarah Johnson")
    
    c.setFont("Helvetica", 14)
    c.drawString(50, height - 80, "Senior Software Engineer")
    
    # Contact
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 110, "Email: sarah.johnson@email.com | Phone: (555) 123-4567")
    
    # Experience Section
    y_pos = height - 150
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y_pos, "EXPERIENCE")
    
    y_pos -= 30
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y_pos, "Senior Software Engineer - Tech Corp (2020-2024)")
    
    y_pos -= 20
    c.setFont("Helvetica", 10)
    experiences = [
        "• Led development of microservices architecture using Python and Docker",
        "• Built machine learning pipelines with TensorFlow and scikit-learn",
        "• Managed team of 6 engineers and improved deployment efficiency by 40%",
        "• Developed React-based dashboard serving 10,000+ daily users"
    ]
    
    for exp in experiences:
        c.drawString(70, y_pos, exp)
        y_pos -= 15
    
    y_pos -= 20
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y_pos, "Software Engineer - StartupXYZ (2018-2020)")
    
    y_pos -= 20
    c.setFont("Helvetica", 10)
    experiences2 = [
        "• Developed full-stack web applications using JavaScript, Node.js, and MongoDB",
        "• Implemented CI/CD pipelines with Jenkins and AWS",
        "• Created RESTful APIs handling 1M+ requests per day"
    ]
    
    for exp in experiences2:
        c.drawString(70, y_pos, exp)
        y_pos -= 15
    
    # Skills Section
    y_pos -= 30
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y_pos, "TECHNICAL SKILLS")
    
    y_pos -= 25
    c.setFont("Helvetica", 10)
    skills_text = [
        "Programming Languages: Python, JavaScript, TypeScript, Java, Go",
        "Frameworks: React, Node.js, Django, Flask, Express.js",
        "Databases: PostgreSQL, MongoDB, Redis, Elasticsearch",
        "Cloud & DevOps: AWS, Docker, Kubernetes, Jenkins, Terraform",
        "Machine Learning: TensorFlow, scikit-learn, pandas, numpy"
    ]
    
    for skill in skills_text:
        c.drawString(50, y_pos, skill)
        y_pos -= 15
    
    # Education Section
    y_pos -= 30
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y_pos, "EDUCATION")
    
    y_pos -= 25
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y_pos, "Master of Science in Computer Science")
    
    y_pos -= 15
    c.setFont("Helvetica", 10)
    c.drawString(50, y_pos, "Stanford University, 2018")
    
    y_pos -= 20
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y_pos, "Bachelor of Science in Software Engineering")
    
    y_pos -= 15
    c.setFont("Helvetica", 10)
    c.drawString(50, y_pos, "University of California, Berkeley, 2016")
    
    # Projects Section
    y_pos -= 40
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y_pos, "KEY PROJECTS")
    
    y_pos -= 25
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, y_pos, "AI-Powered Analytics Platform")
    
    y_pos -= 15
    c.setFont("Helvetica", 10)
    c.drawString(50, y_pos, "Built end-to-end ML platform processing 100GB+ daily data using Python, TensorFlow, and AWS")
    
    y_pos -= 20
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, y_pos, "Real-time Collaboration Tool")
    
    y_pos -= 15
    c.setFont("Helvetica", 10)
    c.drawString(50, y_pos, "Developed React-based collaborative workspace with WebSocket integration and Redis caching")
    
    # Save PDF
    c.save()
    
    print(f"✅ Sample PDF resume created: {filename}")
    return True

if __name__ == "__main__":
    success = create_sample_pdf_resume()
    if not success:
        print("Install ReportLab to create PDF: pip install reportlab")