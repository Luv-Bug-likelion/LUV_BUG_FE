import React, { useEffect, useState } from "react";
import "./Reward.css";
import QRHeader from "../../components/QRHeader";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_DOMAIN_KEY || "";

export default function Reward() {
  const navigate = useNavigate();
  // 🔹 1. 각 API 응답을 저장하기 위한 세 개의 state
  const [rewardData, setRewardData] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [missionData, setMissionData] = useState(null); // 세 번째 요청을 위한 state 추가

  useEffect(() => {
    // 🔹 2. 세 개의 API를 동시에 호출하는 async 함수
    const fetchAllData = async () => {
      try {
        const userKey = localStorage.getItem("userKey");
        if (!userKey) {
          console.error("userKey 없음 → /home으로 이동");
          navigate("/home");
          return;
        }

        // 🔹 3. Promise.all을 사용해 세 개의 API를 병렬로 요청
        const [rewardResponse, storeResponse, missionResponse] = await Promise.all([
          // 첫 번째 요청: QR
          axios.get(`${BASE}/reward?userKey=${userKey}`),
          // 두 번째 요청: 시장이름
          axios.get(`${BASE}/mission/stores`, {
            headers: {
              userKey: userKey,
            },
          }),
          // 세 번째 요청: 기타등등
          axios.get(`${BASE}/mission`, { // ❗️여기에 세 번째 요청 URI를 넣으세요.
            headers: {
              userKey: userKey,
            },
          }),
        ]);

        console.log("리워드 응답:", rewardResponse.data);
        setRewardData(rewardResponse.data?.data);

        console.log("상점 응답:", storeResponse.data);
        setStoreData(storeResponse.data?.data);
        
        console.log("미션 응답:", missionResponse.data);
        setMissionData(missionResponse.data?.data); // 세 번째 응답 데이터 저장

      } catch (err) {
        console.error("데이터 조회 실패:", err);
      }
    };

    fetchAllData();
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
        src={rewardData || "/assets/mock-qr.png"}
        alt="리워드 QR"
        className="RewardQR"
      />

      <div className="reward-info">
        <p className="reward-give">[리워드 지급 내역]</p>
        <p>발급일자 : {missionData?.visitDate || "2025-08-26"}</p>
        <p>미션 진행시장 : {storeData?.marketName || "-"}</p>
        <p>사용금액 : {Number(missionData?.totalSpent || 0).toLocaleString()}원</p>
        <p>리워드 지급 기준 : 결제 금액의 10%</p>
        <p>
          지급 리워드 : {Number(missionData?.totalSpent*0.1 || 0).toLocaleString()}원
        </p>
        <p>지급방법 : 현장지급</p>
      </div>

      <button className="reward-btn" onClick={() => navigate("/budget")}>
        확인
      </button>
    </div>
  );
}
