from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import TripRequest
from app.utils import predict_budget_multiple_options, load_dataset
from app.database import predictions_collection
import traceback

app = FastAPI(
    title="Trip Budget Prediction API",
    description="API to predict trip budget combinations based on travel inputs",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

df = load_dataset()

@app.get("/", summary="Root health check")
async def root():
    return {"message": "Trip Budget Prediction API is up and running!"}

@app.post("/predict", summary="Predict trip budget options")
async def predict_trip(req: TripRequest):
    try:
        results = predict_budget_multiple_options(
            locations=req.locations,
            package=req.package,
            total_days=req.total_days,
            rating_range=req.rating_range,
            travel_companion=req.travel_companion,
        )
        
        print("DEBUG: Results from prediction function:", results)

        data_to_save = req.dict()
        data_to_save["predictions"] = [
            {
                "plan": plan.get("plan", []),  # plan is already a list of dicts, no need to convert
                "total_days": plan.get("total_days"),
                "total_budget": plan.get("total_budget"),
                "travel_companion": plan.get("travel_companion")
            }
            for plan in results
        ]

        predictions_collection.insert_one(data_to_save)

        return {"combinations": data_to_save["predictions"]}

    except Exception as e:
        print("🔥 ERROR:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

