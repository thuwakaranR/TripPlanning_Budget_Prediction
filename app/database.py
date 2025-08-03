from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Retrieve MongoDB connection URI from environment variable
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise EnvironmentError("MONGO_URI not set in .env file")

# Initialize MongoDB client and connect to the database
client = MongoClient(MONGO_URI)

# Access the 'trip_planner' database
db = client.trip_planner

# Define collections used by the app
predictions_collection = db.predictions
confirmed_plans_collection = db.confirmed_plans

if __name__ == "__main__":
    try:
        print("Connecting to MongoDB Atlas...")

        # Test insertion into predictions collection
        test_prediction = {"test_field": "MongoDB Atlas connection successful"}
        prediction_result = predictions_collection.insert_one(test_prediction)
        print("Prediction Document Inserted! ID:", prediction_result.inserted_id)

        # Test retrieval from predictions collection
        prediction_found = predictions_collection.find_one({"_id": prediction_result.inserted_id})
        print("Retrieved Prediction Document:", prediction_found)

        # Test insertion into confirmed_plans collection
        test_confirm_plan = {
            "plan_number": 1,
            "package_ids": ["PKG_123", "PKG_456"],
            "confirmed_at": "2025-08-02T12:00:00Z",
            "user_id": None,
            "full_plan": None
        }
        confirm_result = confirmed_plans_collection.insert_one(test_confirm_plan)
        print("Confirmed Plan Inserted! ID:", confirm_result.inserted_id)

        # Test retrieval from confirmed_plans collection
        confirm_found = confirmed_plans_collection.find_one({"_id": confirm_result.inserted_id})
        print("Retrieved Confirmed Plan Document:", confirm_found)

    except Exception as e:
        print("MongoDB Test Error:", e)

