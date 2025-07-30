import React, { useState } from 'react';
import BudgetForm from '../components/BudgetForm';
import Predictions from '../components/Predictions';
import { postPrediction } from '../api/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setPredictions(null);
    try {
      const response = await postPrediction(formData);
      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        setPredictions(response.data.combinations);
        toast.success("Prediction successful!");
      }
    } catch (error) {
      toast.error("Prediction failed. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10">
          Trip Budget Prediction
        </h1>

        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 mb-8">
          <BudgetForm onSubmit={handleSubmit} />
        </div>

        {loading && (
          <p className="text-center text-blue-600 text-lg font-medium animate-pulse">
            Loading predictions...
          </p>
        )}

        {predictions && (
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
            <Predictions data={predictions} />
          </div>
        )}

        <ToastContainer position="top-center" />
      </div>
    </div>
  );
}
