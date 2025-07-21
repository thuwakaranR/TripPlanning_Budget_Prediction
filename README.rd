
Trip Planner API
===================

A machine learning-based FastAPI application that predicts **custom travel budget plans** based on user preferences like location, duration, package type, and travel companion. Built using **XGBoost**, **Pandas**, and connected to **MongoDB** for request logging and analytics.

Features
-----------

- Predicts budget for travel packages across multiple locations
- Accepts preferences like rating range, travel companion type, total days, etc.
- Trained using XGBoost regression
- MongoDB integration for storing API requests
- Swagger documentation for easy testing (`/docs`)

Requirements
---------------

- Python 3.8+
- MongoDB (running locally or remotely)

Install dependencies:

pip install -r requirements.txt

Setup Instructions
----------------------

1. Clone the Repo

git clone https://github.com/thuwakaranR/TripPlanning_Budget_Prediction.git
cd TripPlanning_Budget_Prediction

2. Activate Virtual Environment (recommended)

python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

3. Run FastAPI Server

uvicorn main:app --reload

Visit Swagger UI: http://127.0.0.1:8000/docs

Sample API Request
---------------------

POST /predict

{
  "locations": ["LOC_11", "LOC_42", "LOC_6"],
  "package": "Moderate",
  "total_days": 12,
  "rating_range": "3-5",
  "travel_companion": "Family"
}

Model Training (Reference)
-----------------------------

- Dataset: trip_dataset.xlsx
- Model: Trained using XGBRegressor with hyperparameter tuning
- Encoded using LabelEncoder for categorical features
- Model and encoders are pre-trained and saved locally
