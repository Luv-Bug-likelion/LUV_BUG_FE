import React, { useState, useEffect, useCallback } from "react";
import "./Mission.css";
import mascot from "../assets/한복핸썹여백없음.png";

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

  // 테스트용 fallback 데이터
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
      title: "평균가격 : 5,000 원",
      desc: "역곡 남부시장에서 양파 구매하기",
      step_code: "4.1",
      is_successed: 0,
    },
    {
      id: 5,
      title: "평균가격 : 3,600 원",
      desc: "역곡 남부 시장에서 고춧가루 구매하기",
      step_code: "4.1",
      is_successed: 0,
    },
  ];

  const sourceList =
    Array.isArray(missions) && missions.length > 0 ? missions : fallbackItems;
  const [selected, setSelected] = useState(null);

  const completedCount = sourceList.filter(
    (m) => Number(m.is_successed) === 1
  ).length;
  const canClaimReward = completedCount >= MIN_FOR_REWARD;

  const handleConfirm = () => {
    if (!canClaimReward) return;
    onSelect?.(selected, true);
    onReward?.();
    setSelected(null);
    onClose?.();
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

  const handleReceiptVerify = async (mission) => {
    const payload = {
      mission_id: mission.id,
      step_code: mission.step_code || "4.1",
      action: "영수증 촬영",
    };
    await onReceipt?.(payload);
    await refetchMissions?.();
  };

  return (
    <div
      className="mission-header-wrap"
      role="dialog"
      aria-modal="true"
      aria-label="미션 선택"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 닫기 버튼 */}
      <div
        className="mission-close"
        role="button"
        tabIndex={0}
        onClick={onClose}
        onKeyDown={(e) => e.key === "Enter" && onClose()}
        aria-label="닫기"
      >
        ✕
      </div>

      {/* 헤더 */}
      <h2 className="mission-title-large">{header.title}</h2>
      <img className="mission-mascot" src={mascot} alt="핸썹이" />
      <p className="mission-subtitle">{header.desc}</p>

      {/* 미션 리스트 */}
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
                    handleReceiptVerify(item);
                  }}
                  disabled={verified}
                  aria-label={`영수증 인증 ${verified ? "완료됨" : "진행"}`}
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

      {/* 리워드 버튼 */}
      <button
        className="mission-btn"
        onClick={handleConfirm}
        disabled={!canClaimReward}
        aria-disabled={!canClaimReward}
        title={canClaimReward ? "리워드 받기" : "미션 3개 이상 달성 시 활성화"}
      >
        리워드 받기
      </button>
    </div>
  );
}

export default Mission;
