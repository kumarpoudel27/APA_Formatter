import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Import the FastAPI app
from main import app

# This is needed for WSGI servers
application = app 