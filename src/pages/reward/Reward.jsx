import React, { useEffect, useState } from "react";
import "./Reward.css";
import QRHeader from "../../components/QRHeader";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_DOMAIN_KEY || "";

export default function Reward() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const userKey =
      localStorage.getItem("userKey") || import.meta.env.VITE_USER_KEY || "";

    if (!userKey) {
      console.error("userKey 없음 → /home으로 이동");
      navigate("/home");
      return;
    }

    axios
      .get(`${BASE}/reward?userKey=${userKey}`)
      .then((res) => {
        console.log("응답:", res.data);
        setData(res.data?.data);
      })
      .catch((err) => {
        console.error("조회 실패:", err);
      });
  }, [navigate]);

  return (
    <div className="reward-page">
      <QRHeader />
      <hr className="divider" />
      <h2>
        축하합니다
        <br /> 리워드 지급이 완료되었습니다
      </h2>

      <img
        src={data?.qrUrl || "/assets/mock-qr.png"}
        alt="리워드 QR"
        className="RewardQR"
      />

      <div className="reward-info">
        <p className="reward-give">[리워드 지급 내역]</p>
        <p>발급일시 : {data?.issuedAt || "-"}</p>
        <p>미션 진행시장 : {data?.marketName || "-"}</p>
        <p>사용금액 : {Number(data?.usedAmount || 0).toLocaleString()}원</p>
        <p>리워드 지급 기준 : 결제 금액의 {data?.rewardRate || 0}%</p>
        <p>
          지급 리워드 : {Number(data?.rewardAmount || 0).toLocaleString()}원
        </p>
        <p>지급방법 : {data?.rewardMethod || "-"}</p>
      </div>

      <button className="reward-btn" onClick={() => navigate("/budget")}>
        확인
      </button>
    </div>
  );
}
