"""
Test script for PDF extraction functionality
"""

from pdf_utils import extract_text_from_pdf_file
import sys

def test_pdf_extraction(pdf_path):
    """Test PDF extraction with a sample file"""
    print(f"Testing PDF extraction for: {pdf_path}")
    print("-" * 50)
    
    result = extract_text_from_pdf_file(pdf_path)
    
    if result["success"]:
        print("✅ Extraction successful!")
        print(f"📄 Pages: {result['page_count']}")
        print(f"📝 Text length: {len(result['text'])} characters")
        print(f"📋 Metadata: {result['metadata']}")
        print("\n--- First 500 characters ---")
        print(result['text'][:500])
        print("\n--- Last 500 characters ---")
        print(result['text'][-500:])
    else:
        print("❌ Extraction failed!")
        print(f"Error: {result['error']}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_pdf_extraction.py <path_to_pdf>")
        print("\nExample:")
        print("  python test_pdf_extraction.py sample_resume.pdf")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    test_pdf_extraction(pdf_path)
