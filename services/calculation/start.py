#!/usr/bin/env python3
"""
CarbonScore Calculation Service Startup Script
"""

import sys
import subprocess
import os
from pathlib import Path

def install_dependencies():
    """Install required Python packages"""
    print("Installing dependencies...")
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ])
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        sys.exit(1)

def check_data_file():
    """Check if ADEME data file exists"""
    data_path = Path("../../data/basecarbone-v17-fr.csv")
    if data_path.exists():
        print(f"✅ ADEME data file found: {data_path}")
        return True
    else:
        print(f"⚠️  ADEME data file not found: {data_path}")
        print("   Using default emission factors")
        return False

def start_service():
    """Start the FastAPI service"""
    print("Starting CarbonScore Calculation Service...")
    print("🚀 Service will be available at: http://localhost:8001")
    print("📊 API documentation at: http://localhost:8001/docs")
    print("🔍 Health check at: http://localhost:8001/health")
    print("\nPress Ctrl+C to stop the service\n")
    
    try:
        import uvicorn
        uvicorn.run(
            "api:app",
            host="0.0.0.0",
            port=8001,
            reload=True,
            log_level="info"
        )
    except ImportError:
        print("❌ uvicorn not installed. Installing dependencies first...")
        install_dependencies()
        import uvicorn
        uvicorn.run(
            "api:app",
            host="0.0.0.0",
            port=8001,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Service stopped")
    except Exception as e:
        print(f"❌ Failed to start service: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("🌱 CarbonScore Calculation Service")
    print("=" * 40)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version.split()[0]}")
    
    # Check dependencies
    try:
        import fastapi
        import pandas
        import numpy
        print("✅ Core dependencies available")
    except ImportError:
        print("📦 Installing missing dependencies...")
        install_dependencies()
    
    # Check data file
    check_data_file()
    
    # Start service
    start_service()
