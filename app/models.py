from pydantic import BaseModel, Field
from typing import List

class TripRequest(BaseModel):
    locations: List[str] = Field(..., description="List of location codes, e.g. ['LOC_11', 'LOC_42']")
    package: str = Field(..., description="Package type, e.g. 'Moderate'")
    total_days: int = Field(..., ge=1, description="Total number of travel days (must be >= 1)")
    rating_range: str = Field(
        ..., 
        pattern=r"^\d+(\.\d+)?-\d+(\.\d+)?$", 
        description="Rating range as 'min-max', e.g. '3-5'"
    )
    travel_companion: str = Field(..., description="Travel companion type, e.g. 'Family', 'Solo', 'Couple', 'Friends'")

