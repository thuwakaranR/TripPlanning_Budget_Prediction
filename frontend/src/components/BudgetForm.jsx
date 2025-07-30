import React, { useState } from "react";
import { toast } from "react-toastify";
import { ImSpinner2 } from "react-icons/im";

const initialFormState = {
  locations: "",
  package: "Moderate",
  total_days: 1,
  min_rating: "3.0",
  max_rating: "5.0",
  travel_companion: "Solo",
};

const sampleFormState = {
  locations: "LOC_11, LOC_42, LOC_67",
  package: "Moderate",
  total_days: 5,
  min_rating: "3.0",
  max_rating: "5.0",
  travel_companion: "Family",
};

export default function BudgetForm({ onSubmit }) {
  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);

  const ratingOptions = ["0.0", "1.0", "2.0", "3.0", "4.0", "5.0"];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "min_rating") {
      // Prevent min_rating > current max_rating
      if (parseFloat(value) > parseFloat(formData.max_rating)) {
        toast.error("Minimum rating cannot exceed maximum rating.");
        return;
      }
      setFormData((prev) => ({ ...prev, min_rating: value }));
    } else if (name === "max_rating") {
      // Prevent max_rating < current min_rating
      if (parseFloat(value) < parseFloat(formData.min_rating)) {
        toast.error("Maximum rating cannot be less than minimum rating.");
        return;
      }
      setFormData((prev) => ({ ...prev, max_rating: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Parse locations
    const locationsArray = formData.locations
      .split(",")
      .map((loc) => loc.trim())
      .filter(Boolean);

    if (locationsArray.length === 0) {
      toast.error("Please enter at least one location.");
      return;
    }

    if (formData.total_days < 1) {
      toast.error("Total days must be at least 1.");
      return;
    }

    const rating_range = `${formData.min_rating}-${formData.max_rating}`;

    const finalData = {
      ...formData,
      locations: locationsArray,
      total_days: Number(formData.total_days),
      rating_range,
    };

    setIsLoading(true);
    try {
      await onSubmit(finalData);
    } catch {
      toast.error("Something went wrong.");
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    setFormData(initialFormState);
    toast.info("Form reset to defaults.");
  };

  const handleSample = () => {
    setFormData(sampleFormState);
    toast.success("Sample data added!");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border space-y-5"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Trip Budget Prediction
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="locations"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Locations (comma separated):
          </label>
          <input
            type="text"
            id="locations"
            name="locations"
            value={formData.locations}
            onChange={handleChange}
            placeholder="e.g., LOC_11, LOC_42"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="package"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Package Type:
          </label>
          <select
            id="package"
            name="package"
            value={formData.package}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="Basic">Basic</option>
            <option value="Moderate">Moderate</option>
            <option value="Premium">Premium</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="total_days"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Total Days:
          </label>
          <input
            type="number"
            id="total_days"
            name="total_days"
            min={1}
            value={formData.total_days}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating Range:
          </label>
          <div className="flex gap-3">
            <select
              name="min_rating"
              value={formData.min_rating}
              onChange={handleChange}
              className="w-1/2 border border-gray-300 rounded-md px-3 py-2"
            >
              {ratingOptions.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
            <select
              name="max_rating"
              value={formData.max_rating}
              onChange={handleChange}
              className="w-1/2 border border-gray-300 rounded-md px-3 py-2"
            >
              {ratingOptions.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="travel_companion"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Travel Companion:
          </label>
          <select
            id="travel_companion"
            name="travel_companion"
            value={formData.travel_companion}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="Solo">Solo</option>
            <option value="Couple">Couple</option>
            <option value="Family">Family</option>
            <option value="Friends">Friends</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap justify-between mt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && <ImSpinner2 className="animate-spin" />}
          Predict Budget
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 bg-gray-100 text-gray-700 border rounded hover:bg-gray-200"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={handleSample}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Fill Sample
        </button>
      </div>
    </form>
  );
}
