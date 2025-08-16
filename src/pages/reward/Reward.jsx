import React from "react";
import "./Reward.css";
import "../../components/QRHeader";
import QRHeader from "../../components/QRHeader";
import { useNavigate } from "react-router-dom";

function Reward() {
  const navigate = useNavigate();
  const handleStart = () => navigate("/budget");

  const data = {
    issuedAt: "2025.08.25 13:45",
    marketName: "역곡남부시장",
    usedAmount: 30000,
    rewardRate: "10%",
    rewardAmount: 3000,
    rewardMethod: "현장지급",
    qrUrl: "/assets/mock-qr.png",
  };

  return (
    <div className="reward-page">
      <QRHeader />
      <hr className="divider" />
      <h2>
        축하합니다<br></br> 리워드 지급이 완료되었습니다
      </h2>
      <img src={data.qrUrl} alt="리워드 QR" className="RewardQR" />
      <div className="reward-info">
        <p className="reward-give">[리워드 지급 내역]</p>
        <p>발급일시 : {data.issuedAt}</p>
        <p>미션 진행시장 : {data.marketName}</p>
        <p>사용금액 : {data.usedAmount.toLocaleString()}원</p>
        <p>리워드 지급 기준 : 결제 금액의 {data.rewardRate}</p>
        <p>지급 리워드 : {data.rewardAmount.toLocaleString()}원</p>
        <p>지급방법 : {data.rewardMethod}</p>
      </div>
      <button className="reward-btn" onClick={handleStart}>
        확인
      </button>
    </div>
  );
}

export default Reward;
