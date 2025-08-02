from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import TripRequest, ConfirmPlanRequest
from app.utils import predict_budget_multiple_options, load_dataset
from app.database import predictions_collection, confirmed_plans_collection
from datetime import datetime
import traceback

# Initialize FastAPI app with metadata
app = FastAPI(
    title="Trip Budget Prediction API",
    description="API to predict and confirm trip budget plans based on user inputs",
    version="1.0.0"
)

# Setup CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your dataset
df = load_dataset()

@app.get("/", summary="Root health check")
async def root():
    """
    Simple health check endpoint
    """
    return {"message": "Trip Budget Prediction API is up and running!"}


@app.post("/predict", summary="Predict trip budget options")
async def predict_trip(req: TripRequest):
    """
    Predict trip budget options based on user inputs.
    Saves the prediction request and results to the database.
    """
    try:
        results = predict_budget_multiple_options(
            locations=req.locations,
            package=req.package,
            total_days=req.total_days,
            rating_range=req.rating_range,
            travel_companion=req.travel_companion,
        )

        print("DEBUG: Results from prediction function:", results)

        # Prepare document to save to MongoDB
        data_to_save = req.dict()
        data_to_save["predictions"] = [
            {
                "plan": plan.get("plan", []),
                "total_days": plan.get("total_days"),
                "total_budget": plan.get("total_budget"),
                "travel_companion": plan.get("travel_companion"),
            }
            for plan in results
        ]

        # Insert prediction document
        predictions_collection.insert_one(data_to_save)

        # Return only the predictions combinations to the client
        return {"combinations": data_to_save["predictions"]}

    except Exception as e:
        print("ERROR in /predict:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/confirm", summary="Confirm a selected trip plan")
async def confirm_plan(req: ConfirmPlanRequest):
    """
    Confirm a selected trip plan.
    Saves the confirmation details to the database.
    """
    try:
        doc = {
            "plan_number": req.plan_number,
            "package_ids": req.package_ids,
            "confirmed_at": req.confirmed_at.isoformat(),
            "user_id": req.user_id,
            "full_plan": req.full_plan,
        }

        # Insert confirmation document
        result = confirmed_plans_collection.insert_one(doc)

        return {
            "message": "Plan confirmed successfully",
            "id": str(result.inserted_id)
        }

    except Exception as e:
        print("ERROR in /confirm:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to confirm plan: {str(e)}")


