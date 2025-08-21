import React, { useState, useEffect, useCallback, useRef } from "react";
// ⬇️ 1. react-router-dom에서 useNavigate를 import 합니다.
import { useNavigate } from "react-router-dom";
import "./Mission.css";
import mascot from "../assets/한복핸썹여백없음.png";
import axios from "axios";

// --- Axios 기본 설정 ---
const BASE = (import.meta.env.VITE_BACKEND_DOMAIN_KEY || "").replace(
  /\/+$/,
  ""
);
axios.defaults.baseURL = BASE;
axios.defaults.withCredentials = true;

// --- API 요청 함수들 ---
async function apiGetMission() {
  const userKey = localStorage.getItem("userKey");
  if (!userKey) {
    throw new Error("userKey가 없습니다. 먼저 로그인을 해주세요.");
  }
  return axios.get("/mission", {
    headers: {
      userKey: userKey,
    },
  });
}

// 🛑 2. 파일 업로드 관련 API 함수 제거
// async function apiUploadReceipt({ missionId, file }) { ... }

async function apiGetReward() {
  return axios.get("/reward", {
    headers: { Accept: "application/json" },
  });
}

// --- Mission 컴포넌트 ---
function Mission({ onSelect, onClose, onReward, onReceipt, refetchMissions }) {
  // ⬇️ 3. useNavigate 훅을 초기화합니다.
  const navigate = useNavigate();
  const MIN_FOR_REWARD = 3;

  const [sourceList, setSourceList] = useState([]);
  const [header, setHeader] = useState({
    title: "미션 진행중!",
    desc: "미션을 불러오는 중입니다...",
  });
  const [selected, setSelected] = useState(null);

  // 🛑 2. 파일 업로드 관련 state 및 ref 제거
  // const [pendingMission, setPendingMission] = useState(null);
  // const fileInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const missionRes = await apiGetMission();
        const missionData = missionRes.data?.data;
        if (missionData && missionData.missionList) {
          setHeader((prevHeader) => ({
            ...prevHeader,
            desc: `“${missionData.missionTitle}”\n핸썹이와 재료를 구매하세요`,
          }));
          const formattedMissions = missionData.missionList.map((item) => ({
            id: item.missionId,
            title: `평균가격 : ${item.expectedPrice.toLocaleString()} 원`,
            desc: item.missionDetail,
            is_successed: Number(item.is_success),
          }));
          setSourceList(formattedMissions);
        }
      } catch (e) {
        console.error("[Mission] 초기화 실패:", e?.response?.data || e);
        alert(e.message || "미션을 불러오는 데 실패했습니다.");
      }
    })();
  }, []);

  const completedCount = sourceList.filter((m) => m.is_successed === 1).length;
  const canClaimReward = completedCount >= MIN_FOR_REWARD;
  const totalSpent = sourceList
    .filter((m) => m.is_successed === 1)
    .reduce((sum, m) => sum + (Number(m.title.replace(/[^0-9]/g, "")) || 0), 0);
  const rewardAmount = canClaimReward ? Math.floor(totalSpent * 0.1) : 0;

  const handleConfirm = async () => {
    if (!canClaimReward) return;
    try {
      const res = await apiGetReward();
      onSelect?.(selected, true);
      onReward?.({ clientEstimated: rewardAmount, server: res?.data });
    } catch (e) {
      console.error("[Mission] /reward 실패:", e?.response?.data || e);
      onSelect?.(selected, true);
      onReward?.(rewardAmount);
    } finally {
      setSelected(null);
      onClose?.();
    }
  };

  const onEsc = useCallback(
    (e) => {
      if (e.key === "Escape") onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", onEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [onEsc]);

  // 🛑 2. 파일 업로드 관련 함수들(openFilePicker, onFilePicked) 제거

  // ⬇️ 4. 페이지 이동과 함께 missionId를 전달하는 함수
  const handleNavigateToReceipt = (missionId) => {
    // '/receipt-auth'는 영수증 인증 페이지의 경로입니다. 실제 경로에 맞게 수정해주세요.
    navigate("/camera", { state: { missionId: missionId } });
    console.log(`Navigating to receipt auth page with missionId: ${missionId}`);
  };

  return (
    <div
      className="mission-header-wrap"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 🛑 2. input file 태그 제거 */}
      <div
        className="mission-close"
        role="button"
        tabIndex={0}
        onClick={onClose}
        aria-label="닫기"
      >
        ✕
      </div>
      <h2 className="mission-title-large">{header.title}</h2>
      <img className="mission-mascot" src={mascot} alt="핸썹이" />
      <p className="mission-subtitle" style={{ whiteSpace: "pre-wrap" }}>
        {header.desc}
      </p>

      <div className="mission-list custom-scrollbar">
        {sourceList.map((item) => {
          const verified = item.is_successed === 1;
          return (
            <div
              key={item.id}
              className={`mission-item ${selected === item.id ? "active" : ""}`}
              onClick={() => setSelected(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelected(item.id)}
            >
              <div className="mission-card">
                <div className="mission-card-text">
                  <div className="mission-title">{item.title}</div>
                  <div className="mission-desc">{item.desc}</div>
                </div>
                <button
                  type="button"
                  className={`receipt-badge ${verified ? "verified" : ""}`}
                  // ⬇️ 5. onClick 이벤트를 handleNavigateToReceipt 호출로 변경
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!verified) handleNavigateToReceipt(item.id);
                  }}
                  disabled={verified}
                >
                  {verified ? (
                    <>
                      {" "}
                      도장
                      <br />
                      완료
                    </>
                  ) : (
                    <>
                      {" "}
                      영수증
                      <br />
                      인증
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="mission-btn"
        onClick={handleConfirm}
        disabled={!canClaimReward}
      >
        {canClaimReward ? `리워드 받기` : `리워드 받기`}
      </button>
    </div>
  );
}

export default Mission;
