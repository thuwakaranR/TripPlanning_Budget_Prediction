import React from 'react';

export default function Predictions({ data }) {
  if (!data || data.length === 0) return <p className="text-center mt-4">No predictions available.</p>;

  return (
    <div className="mt-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">🎯 Predicted Budget Combinations</h2>
      {data.map((option, index) => (
        <div key={index} className="border border-gray-300 rounded-xl mb-10 shadow-md overflow-hidden">
          <div className="bg-blue-600 text-white text-center py-2 text-xl font-bold">
            ✨ Trip Plan {index + 1} ✨
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left table-auto">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-2">Location</th>
                  <th className="px-4 py-2">Package ID</th>
                  <th className="px-4 py-2">Package Type</th>
                  <th className="px-4 py-2">Days</th>
                  <th className="px-4 py-2">Accommodation</th>
                  <th className="px-4 py-2">Food & Transport</th>
                  <th className="px-4 py-2">Avg Rating</th>
                  <th className="px-4 py-2">Activities</th>
                  <th className="px-4 py-2">Predicted Budget (LKR)</th>
                </tr>
              </thead>
              <tbody>
                {option.plan.map((pkg, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2">{pkg.Location}</td>
                    <td className="px-4 py-2">{pkg.Package_ID}</td>
                    <td className="px-4 py-2">{pkg.Package_Type}</td>
                    <td className="px-4 py-2">{pkg.Days}</td>
                    <td className="px-4 py-2">{pkg.Accommodation}</td>
                    <td className="px-4 py-2">{pkg['Food & Transport']}</td>
                    <td className="px-4 py-2">{pkg.Avg_Rating}</td>
                    <td className="px-4 py-2">
                      <ul className="list-disc ml-4">
                        {pkg.Activities.map((act, idx) => (
                          <li key={idx}>{act}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-2 font-medium">{pkg.Predicted_Budget}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-100 px-6 py-4 text-sm text-gray-800 border-t">
            <p className="mb-1">
              <span className="font-semibold">👨‍👩‍👧‍👦 Travel Companion:</span> {option.travel_companion}
            </p>
            <p className="mb-1">
              <span className="font-semibold">🕒 Total Duration:</span> {option.total_days} days
            </p>
            <p>
              <span className="font-semibold">💰 Total Budget:</span> {option.total_budget.toFixed(2)} LKR
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}