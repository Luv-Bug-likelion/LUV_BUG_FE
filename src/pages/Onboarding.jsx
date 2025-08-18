import React from "react";
import "./Onboarding.css";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const navigate = useNavigate();
  const handleStart = () => navigate("/guide");

  return (
    <div className="app-panel">
      <div className="onboarding-container" onClick={handleStart}>
        <h1>시장통</h1>
        <p>#시간 가는 줄 모르고 장 보며 통 크게 리워드 받자!</p>
      </div>
    </div>
  );
};

export default Onboarding;
