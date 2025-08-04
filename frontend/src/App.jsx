import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ConfirmedPlans from "./pages/ConfirmedPlans";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/confirmed-plans" element={<ConfirmedPlans />} />
      </Routes>
    </Router>
  );
}

export default App;



