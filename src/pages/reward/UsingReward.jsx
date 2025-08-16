import React from "react";
import QRHeader from "../../components/QRHeader";
import "./UsingReward.css";

function UsingReward() {
  const navigate = useNavigate();
  const handleStart = () => navigate("/budget");
  return (
    <div className="usingreward-page">
      <QRHeader />
      <hr className="divider" />
      <div className="usingreward-info">
        <p>이미 사용 완료된 QR입니다</p>
      </div>
      <button className="usingreward-btn" onClick={handleStart}>
        확인
      </button>
    </div>
  );
}

export default UsingReward;
