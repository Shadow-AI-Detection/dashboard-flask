# ShadowAI Dashboard

Flask API and visualization dashboard for real-time AI-generated network traffic detection.

## Project Structure

```
├── app.py                  # App factory + blueprint registration
├── db.py                   # SQLite database management
├── model.pkl               # Classification model 
├── routes/
│   ├── predict_routes.py   # Blueprint: /predict
│   ├── result_routes.py    # Blueprint: /results
│   └── user_routes.py      # Blueprint: /users
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
python3 app.py
```

The dashboard is available at `http://localhost:5001`

## API Routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/predict/` | Receives flows, runs prediction and saves to database |
| `GET` | `/results/` | Returns all flows with predictions |
| `GET` | `/users/` | Returns all registered users |
| `POST` | `/users/` | Creates a new user |
| `DELETE` | `/users/<id>` | Deletes a user |
| `GET` | `/` | Serves the dashboard |

