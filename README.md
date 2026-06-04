# ShadowAI Dashboard

Flask API and visualization dashboard for real-time AI-generated network traffic detection.

## Project Structure

```
├── main.py                  # Flask API (predict, results, users routes)
├── db.py                   # SQLite database management
├── model.pkl               # Classification model 
├── data/
│   └── flows.db            # SQLite database 
├── templates/
│   └── index.html          # HTML dashboard
└── static/
    ├── css/
    │   └── main.css
    └── js/
        ├── api.js           # Polling and fetch
        ├── charts.js        # Chart.js graphs
        ├── dashboard.js     # Dashboard page rendering
        ├── users.js         # Users page rendering
        └── app.js           # Navigation and init
```

## Requirements

```bash
pip install flask pandas scikit-learn lightgbm
```

## Installation

```bash
# Clone the repo
git clone "https://github.com/Shadow-AI-Detection/dashboard-flask.git"
cd dashboard-flask

# Create the data folder
mkdir data

# Create and activate the venv
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Running

```bash
python3 main.py
```

The dashboard is available at `http://localhost:5001`.
