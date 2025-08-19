import React, { useState, useEffect, useCallback, useRef } from "react";
import "./Mission.css";
import mascot from "../assets/한복핸썹여백없음.png";
import axios from "axios";

const BASE = (import.meta.env.VITE_BACKEND_DOMAIN_KEY || "").replace(
  /\/+$/,
  ""
);

axios.defaults.baseURL = BASE;
axios.defaults.withCredentials = true;

async function apiInitHome() {
  const res = await axios.post("/home", {
    market: "부천역곡남부시장",
    budget: 10000,
    storyId: 1,
  });
  const key = res.data?.data?.userKey;
  if (key) {
    localStorage.setItem("userKey", key);
    console.log("[Init] userKey 저장:", key);
  }
  return res;
}

async function apiGetMission() {
  const userKey = localStorage.getItem("userKey");
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

function Mission({
  missions,
  onSelect,
  onClose,
  onReward,
  onReceipt,
  refetchMissions,
  header = {
    title: "미션 진행중!",
    desc: "“엄마가 오징어 볶음 재료를 사오래요”\n핸썹이와 재료를 구매하세요",
  },
}) {
  const MIN_FOR_REWARD = 3;

  const fallbackItems = [
    {
      id: 1,
      title: "평균가격 : 4,000 원",
      desc: "역곡 남부시장에서 양파 구매하기",
      step_code: "4.1",
      is_successed: 0,
    },
    {
      id: 2,
      title: "평균가격 : 4,400 원",
      desc: "역곡 남부 시장에서 고춧가루 구매하기",
      step_code: "4.1",
      is_successed: 0,
    },
    {
      id: 3,
      title: "평균가격 : 4,400 원",
      desc: "역곡 남부 시장에서 고등어 사기",
      step_code: "4.1",
      is_successed: 0,
    },
    {
      id: 4,
      title: "평균가격 : 4,400 원",
      desc: "역곡 남부 시장에서 고춧가루 구매하기",
      step_code: "4.1",
      is_successed: 0,
    },
    {
      id: 5,
      title: "평균가격 : 4,400 원",
      desc: "역곡 남부 시장에서 라면 사기",
      step_code: "4.1",
      is_successed: 0,
    },
  ];

  const [sourceList, setSourceList] = useState(fallbackItems);
  const [selected, setSelected] = useState(null);
  const [pendingMission, setPendingMission] = useState(null);
  const fileInputRef = useRef(null);
  useEffect(() => {
    (async () => {
      try {
        const homeRes = await axios.post("/home", {
          market: "부천역곡남부시장",
          budget: 10000,
          storyId: 1,
        });
        const userKey = homeRes.data?.data;
        if (userKey) {
          localStorage.setItem("userKey", userKey);
        }

        const missionRes = await apiGetMission();
        console.log("[Mission] /mission 응답:", missionRes.data);
      } catch (e) {
        console.error("[Mission] 초기화 실패:", e?.response?.data || e);
      }
    })();
  }, []);

  const completedCount = sourceList.filter(
    (m) => Number(m.is_successed) === 1
  ).length;
  const canClaimReward = completedCount >= MIN_FOR_REWARD;

  const totalSpent = sourceList
    .filter((m) => Number(m.is_successed) === 1)
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
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prev;
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
      console.log("[Mission] 영수증 응답:", data);
      alert(data?.message || "영수증 인증 성공");

      onReceipt?.({
        mission_id: pendingMission.id,
        step_code: pendingMission.step_code || "4.1",
        action: "영수증 촬영",
        result: data,
      });
      await refetchMissions?.();
    } catch (err) {
      console.error(
        "[Mission] /mission/status 실패:",
        err?.response?.data || err
      );
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
      <p className="mission-subtitle">{header.desc}</p>

      <div className="mission-list custom-scrollbar">
        {sourceList.map((item) => {
          const verified = Number(item.is_successed) === 1;
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
        {canClaimReward ? `리워드 받기` : "리워드 받기"}
      </button>
    </div>
  );
}

export default Mission;
