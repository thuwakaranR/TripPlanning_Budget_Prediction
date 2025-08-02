from pydantic import BaseModel, Field, validator
from typing import List, Optional, Any
from datetime import datetime

class TripRequest(BaseModel):
    locations: List[str] = Field(
        ...,
        min_items=1,
        description="List of location codes, e.g. ['LOC_11', 'LOC_42']"
    )
    package: str = Field(
        ...,
        description="Package type, e.g. 'Moderate'"
    )
    total_days: int = Field(
        ...,
        ge=1,
        description="Total number of travel days (must be >= 1)"
    )
    rating_range: str = Field(
        ...,
        pattern=r"^\d+(\.\d+)?-\d+(\.\d+)?$",
        description="Rating range as 'min-max', e.g. '3.0-5.0'"
    )
    travel_companion: str = Field(
        ...,
        description="Travel companion type, e.g. 'Family', 'Solo', 'Couple', 'Friends'"
    )

    @validator('travel_companion')
    def validate_travel_companion(cls, v):
        allowed = ['Solo', 'Couple', 'Family', 'Friends']
        if v not in allowed:
            raise ValueError(f"travel_companion must be one of {allowed}")
        return v

    @validator('rating_range')
    def validate_rating_range_values(cls, v):
        try:
            min_rating, max_rating = map(float, v.split('-'))
            if not (0.0 <= min_rating <= 5.0 and 0.0 <= max_rating <= 5.0 and min_rating <= max_rating):
                raise ValueError("Values must be between 0.0 and 5.0 and min must be ≤ max.")
        except Exception:
            raise ValueError("rating_range must be in format 'min-max' with values between 0.0 and 5.0")
        return v
class ConfirmPlanRequest(BaseModel):
    user_id: Optional[str] = Field(
        None,
        description="Optional user identifier (if available)"
    )
    plan_number: int = Field(
        ...,
        ge=0,
        description="Index of the selected plan (0-based)"
    )
    package_ids: List[str] = Field(
        ...,
        min_items=1,
        description="List of Package_IDs confirmed for the trip"
    )
    confirmed_at: datetime = Field(
        ...,
        description="ISO formatted datetime when the plan was confirmed"
    )
    full_plan: Optional[Any] = Field(
        None,
        description="Full plan data for reference (optional)"
    )



