import os
import sys

# Add the backend directory to the Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Import the FastAPI app from the backend
from main import app

# This is needed for WSGI servers
application = app 