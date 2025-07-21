from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

# Get MongoDB URI from environment variable
MONGO_URI = os.getenv("MONGO_URI")

# Connect to MongoDB Atlas
client = MongoClient(MONGO_URI)

db = client.trip_planner
predictions_collection = db.predictions

# ✅ TEST CONNECTION
if __name__ == "__main__":
    try:
        # Test insert
        test_doc = {
            "test_field": "MongoDB Atlas connection successful",
        }
        result = predictions_collection.insert_one(test_doc)
        print("✅ Document inserted! ID:", result.inserted_id)

        # Test read
        found = predictions_collection.find_one({"_id": result.inserted_id})
        print("📄 Retrieved Document:", found)

    except Exception as e:
        print("❌ Error:", e)
