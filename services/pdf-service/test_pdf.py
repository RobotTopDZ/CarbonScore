#!/usr/bin/env python3
"""
Test script for PDF service
"""

import requests
import json
from datetime import datetime

# Test data payload
test_payload = {
    "company_info": {
        "name": "Test Company",
        "sector": "services",
        "employees": "10-49",
        "revenue": 500000,
        "location": "France"
    },
    "emission_data": {
        "total_co2e": 15000,
        "scope_1": 3000,
        "scope_2": 5000,
        "scope_3": 7000,
        "breakdown": {
            "electricite": 4000,
            "gaz": 1000,
            "carburants": 2000,
            "vehicules": 3000,
            "vols_domestiques": 2000,
            "vols_internationaux": 1000,
            "achats": 2000
        },
        "intensity_per_employee": 500,
        "carbon_efficiency_score": 75,
        "sustainability_grade": "B",
        "intensity_per_revenue": 0.03,
        "calculated_at": datetime.now().isoformat(),
        "cost_of_carbon": 1200
    },
    "recommendations": [
        "Optimiser les consommations énergétiques",
        "Réduire les déplacements professionnels",
        "Améliorer l'efficacité des équipements",
        "Sensibiliser les équipes aux éco-gestes"
    ],
    "benchmark_position": "Votre entreprise se situe dans la moyenne de votre secteur",
    "equivalent_metrics": {
        "trees_to_plant": 682,
        "cars_off_road": 3.3,
        "homes_energy_year": 2.5,
        "flights_paris_ny": 15
    },
    "reduction_potential": {
        "immediate": 2250,
        "short_term": 4500,
        "long_term": 7500
    },
    "template": "comprehensive"
}

def test_pdf_generation():
    """Test PDF generation endpoint"""
    try:
        print("Testing PDF generation...")
        
        # Test the endpoint
        response = requests.post(
            "http://localhost:8020/api/v1/pdf/generate",
            json=test_payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("PDF generation successful!")
            print(f"Filename: {result['filename']}")
            print(f"Size: {result['size_bytes']} bytes")
            return True
        else:
            print("PDF generation failed!")
            try:
                error_detail = response.json()
                print(f"Error: {error_detail}")
            except:
                print(f"Raw error: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("Cannot connect to PDF service. Is it running on port 8020?")
        return False
    except Exception as e:
        print(f"Test failed: {e}")
        return False

def test_health_check():
    """Test health check endpoint"""
    try:
        response = requests.get("http://localhost:8020/")
        if response.status_code == 200:
            print("PDF service is healthy")
            return True
        else:
            print("PDF service health check failed")
            return False
    except:
        print("PDF service is not responding")
        return False

if __name__ == "__main__":
    print("Testing PDF Service")
    print("=" * 50)
    
    # Test health check first
    if test_health_check():
        # Test PDF generation
        test_pdf_generation()
    else:
        print("Please start the PDF service first:")
        print("cd d:\\Carbogo\\services\\pdf-service")
        print("python app/main.py")
