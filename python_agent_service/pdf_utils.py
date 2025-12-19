"""
PDF Extraction Utilities
Extracts text from PDF files using PyMuPDF (fitz)
"""

import fitz  # PyMuPDF
from typing import Dict, Any
import io


def extract_text_from_pdf(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Extract text from PDF bytes
    
    Args:
        pdf_bytes: PDF file content as bytes
        
    Returns:
        Dictionary with extracted text and metadata
    """
    try:
        # Open PDF from bytes
        pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        # Extract text from all pages
        full_text = ""
        page_texts = []
        
        for page_num in range(len(pdf_document)):
            page = pdf_document[page_num]
            page_text = page.get_text()
            page_texts.append({
                "page_number": page_num + 1,
                "text": page_text
            })
            full_text += page_text + "\n\n"
        
        # Get metadata
        metadata = pdf_document.metadata
        
        pdf_document.close()
        
        return {
            "success": True,
            "text": full_text.strip(),
            "page_count": len(page_texts),
            "pages": page_texts,
            "metadata": {
                "title": metadata.get("title", ""),
                "author": metadata.get("author", ""),
                "subject": metadata.get("subject", ""),
                "creator": metadata.get("creator", "")
            }
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "text": ""
        }


def extract_text_from_pdf_file(file_path: str) -> Dict[str, Any]:
    """
    Extract text from PDF file path
    
    Args:
        file_path: Path to PDF file
        
    Returns:
        Dictionary with extracted text and metadata
    """
    try:
        with open(file_path, 'rb') as f:
            pdf_bytes = f.read()
        return extract_text_from_pdf(pdf_bytes)
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "text": ""
        }
