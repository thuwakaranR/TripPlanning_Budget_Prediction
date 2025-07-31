import React, { useState } from 'react';
import BudgetForm from '../components/BudgetForm';
import Predictions from '../components/Predictions';
import { postPrediction } from '../api/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../App.css';

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

  function PredictionsWrapper({ data, setPredictions }) {
    const [showPredictions, setShowPredictions] = useState(true);

    const handleHide = () => {
      setShowPredictions(false);
      setPredictions(null); // completely removes the white wrapper div
    };

    if (!showPredictions) return null;

    return (
      <div className="bg-white rounded-3xl shadow-2xl p-10 sm:p-14">
        <Predictions data={data} onCloseAll={handleHide} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex items-start justify-center py-16 px-6 sm:px-10 lg:px-16">
      <div className="w-full max-w-5xl">
        {/* Enhanced Title */}
        <h1 className="text-center text-6xl sm:text-7xl font-extrabold leading-snug text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600 mb-14 drop-shadow-lg zoom-animation">
          Trip Budget Prediction
        </h1>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 sm:p-14 mb-14">
          <BudgetForm onSubmit={handleSubmit} />
        </div>

        {/* Loading Indicator */}
        {loading && (
          <p className="text-center text-indigo-600 text-xl font-semibold animate-pulse select-none">
            Loading predictions...
          </p>
        )}

        {/* Predictions Output */}
        {predictions && predictions.length > 0 && (
          <PredictionsWrapper data={predictions} setPredictions={setPredictions} />
        )}

        <ToastContainer position="bottom-right" autoClose={1000} hideProgressBar />
      </div>
    </div>
  );
}