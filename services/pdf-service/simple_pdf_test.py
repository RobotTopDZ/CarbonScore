#!/usr/bin/env python3
"""
Simple PDF generation test
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
import io

def create_simple_pdf():
    """Create a simple PDF to test basic functionality"""
    try:
        # Create PDF buffer
        buffer = io.BytesIO()
        
        # Create document
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        
        # Get styles
        styles = getSampleStyleSheet()
        
        # Build story
        story = []
        story.append(Paragraph("Test PDF Report", styles['Title']))
        story.append(Spacer(1, 20))
        story.append(Paragraph("This is a simple test PDF to verify ReportLab works correctly.", styles['Normal']))
        story.append(Spacer(1, 10))
        story.append(Paragraph("Company: Test Company", styles['Normal']))
        story.append(Paragraph("Total CO2e: 15,000 kg", styles['Normal']))
        story.append(Paragraph("Grade: B", styles['Normal']))
        
        # Build PDF
        doc.build(story)
        
        # Get PDF bytes
        buffer.seek(0)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        print(f"Simple PDF created successfully! Size: {len(pdf_bytes)} bytes")
        
        # Save to file for testing
        with open("simple_test.pdf", "wb") as f:
            f.write(pdf_bytes)
        
        return pdf_bytes
        
    except Exception as e:
        print(f"Error creating simple PDF: {e}")
        raise

if __name__ == "__main__":
    create_simple_pdf()
