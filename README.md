# APA Formatter

A local web app to format pasted or uploaded documents according to APA style.

## Features
- Paste or upload plain text or .docx files (up to 100 pages)
- Detects headers, paragraphs, references, and page numbers
- Formats content per APA rules
- Shows original and formatted content side-by-side

## Prerequisites
- Python 3.x
- Node.js and npm
- Homebrew (for macOS users)

## Installation

### 1. Install Required Software

#### For macOS users:
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python and Node.js
brew install python node
```

## Getting Started

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the API server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend server will run on http://localhost:8000

### Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   The frontend will be available at http://localhost:3000

## Usage
1. Open http://localhost:3000 in your web browser
2. Paste your text or upload a document
3. The formatted content will appear side-by-side with the original

## Troubleshooting

### If port 8000 is already in use:
```bash
# Find and kill the process using port 8000
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### If you get "command not found" errors:
- Make sure Python and Node.js are properly installed
- Try using `python3` instead of `python` if needed
- Ensure your PATH includes the installed binaries

---

## Roadmap
- [x] Backend API stub
- [x] APA formatting logic
- [x] React frontend
- [ ] Download/Copy formatted output
