from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.models import TripRequest, ConfirmPlanRequest
from app.utils import predict_budget_multiple_options, load_dataset
from app.database import predictions_collection, confirmed_plans_collection
from datetime import datetime
from dotenv import load_dotenv
import traceback
import os
import cohere

load_dotenv()

# Initialize Cohere client
cohere_api_key = os.getenv("COHERE_API_KEY")
if not cohere_api_key:
    raise RuntimeError("COHERE_API_KEY not found in .env")

co = cohere.Client(cohere_api_key)

# Initialize FastAPI app
app = FastAPI(
    title="Trip Budget Prediction API",
    description="API to predict and confirm trip budget plans with chatbot support (Cohere)",
    version="1.2.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load dataset once
df = load_dataset()

@app.get("/", summary="Health check")
async def root():
    return {"message": "Trip Budget Prediction API is up and running with Cohere chatbot!"}

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

        predictions_collection.insert_one(data_to_save)

        return {"combinations": data_to_save["predictions"]}

    except Exception as e:
        print("ERROR in /predict:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/confirm", summary="Confirm a selected trip plan")
async def confirm_plan(req: ConfirmPlanRequest):
    try:
        doc = {
            "plan_number": req.plan_number,
            "package_ids": req.package_ids,
            "confirmed_at": req.confirmed_at.isoformat(),
            "user_id": req.user_id,
            "full_plan": req.full_plan,
        }

        result = confirmed_plans_collection.insert_one(doc)

        return {
            "message": "Plan confirmed successfully",
            "id": str(result.inserted_id)
        }

    except Exception as e:
        print("ERROR in /confirm:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to confirm plan: {str(e)}")

# ChatBot Models
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@app.post("/chatbot", response_model=ChatResponse, summary="Chatbot response using Cohere")
async def chatbot_endpoint(chat_request: ChatRequest):
    user_message = chat_request.message

    try:
        response = co.chat(
            message=user_message,
            model="command-r-plus",
            temperature=0.7,
        )

        return ChatResponse(reply=response.text.strip())

    except Exception as e:
        print("Cohere Error:", e)
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")


