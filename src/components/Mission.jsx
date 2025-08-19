import React, { useState, useEffect, useCallback, useRef } from "react";
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
    // userKey가 없으면 요청을 보내지 않고 에러를 발생시킴
    throw new Error("userKey가 없습니다. 먼저 로그인을 해주세요.");
  }
  return axios.get("/mission", {
    headers: {
      userKey: userKey,
    },
  });
}

async function apiUploadReceipt({ missionId, file }) {
  const fd = new FormData();
  fd.append("missionId", Number(missionId));
  fd.append("image", file);

  return axios.post("/mission/status", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

async function apiGetReward() {
  return axios.get("/reward", {
    headers: { Accept: "application/json" },
  });
}


// --- Mission 컴포넌트 ---
function Mission({ onSelect, onClose, onReward, onReceipt, refetchMissions }) {
  const MIN_FOR_REWARD = 3;

  const [sourceList, setSourceList] = useState([]);
  const [header, setHeader] = useState({
    title: "미션 진행중!",
    desc: "미션을 불러오는 중입니다...", // 초기 로딩 메시지
  });
  const [selected, setSelected] = useState(null);
  const [pendingMission, setPendingMission] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const missionRes = await apiGetMission();
        console.log("[Mission] /mission 응답:", missionRes.data);

        const missionData = missionRes.data?.data;
        if (missionData && missionData.missionList) {
          // 헤더 설명 업데이트
          setHeader((prevHeader) => ({
            ...prevHeader,
            desc: `“${missionData.missionTitle}”\n핸썹이와 재료를 구매하세요`,
          }));

          // 미션 목록 데이터 가공 및 상태 업데이트
          const formattedMissions = missionData.missionList.map((item) => ({
            id: item.missionId,
            title: `평균가격 : ${item.expectedPrice.toLocaleString()} 원`,
            desc: item.missionDetail,
            is_successed: Number(item.is_success), // boolean을 숫자로 변환 (true=1, false=0)
          }));
          setSourceList(formattedMissions);
        }
      } catch (e) {
        console.error("[Mission] 초기화 실패:", e?.response?.data || e);
        alert(e.message || "미션을 불러오는 데 실패했습니다.");
        setHeader((prevHeader) => ({
          ...prevHeader,
          desc: "미션을 불러오는 데 실패했습니다.",
        }));
      }
    })();
  }, []);

  // 완료한 미션 개수
  const completedCount = sourceList.filter(
    (m) => m.is_successed === 1
  ).length;

  // 리워드 가능 여부
  const canClaimReward = completedCount >= MIN_FOR_REWARD;

  // 총 사용 금액 계산 (레거시 코드 호환)
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

  const openFilePicker = (mission) => {
    setPendingMission(mission);
    fileInputRef.current?.click();
  };

  const onFilePicked = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !pendingMission) {
      e.target.value = "";
      return;
    }

    try {
      const { data } = await apiUploadReceipt({
        missionId: pendingMission.id,
        file,
      });
      alert(data?.message || "영수증 인증 성공");

      onReceipt?.({
        mission_id: pendingMission.id,
        action: "영수증 촬영",
        result: data,
      });
      await refetchMissions?.(); // 미션 목록 새로고침
    } catch (err) {
      console.error("[Mission] /mission/status 실패:", err?.response?.data || err);
      alert(err?.response?.data?.message || "영수증 인증 실패");
    } finally {
      e.target.value = "";
      setPendingMission(null);
    }
  };

  return (
    <div
      className="mission-header-wrap"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onFilePicked}
      />

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
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!verified) openFilePicker(item);
                  }}
                  disabled={verified}
                >
                  {verified ? (
                    <>
                      도장
                      <br />
                      완료
                    </>
                  ) : (
                    <>
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
        {canClaimReward ? `리워드 받기` : `미션 ${MIN_FOR_REWARD}개 이상 완료 시 리워드`}
      </button>
    </div>
  );
}

export default Mission;