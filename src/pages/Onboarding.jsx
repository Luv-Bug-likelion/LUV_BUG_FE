import "./Onboarding.css";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/guide"); // 5초 후에 /second 경로로 이동
    }, 5000); // 5000ms = 5초

    // 컴포넌트가 언마운트될 때 타이머 정리 (메모리 누수 방지)
    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-panel">
      <div className="onboarding-container">
        <h1>시장통</h1>
        <p>#시간 가는 줄 모르고 장 보며 통 크게 리워드 받자!</p>
      </div>
    </div>
  );
};

export default Onboarding;
