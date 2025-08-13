import React, { useState, useEffect, useCallback } from "react";
import "./Mission.css";
import mascot from "../assets/한복핸썹여백없음.png";

/**
 * props
 * - missions: 백엔드에서 오는 미션 배열
 *   [{ id, title, desc, step_code: "4.1", is_successed: 0|1 }, ...]
 *   * 헤더 카드는 별도로 관리하므로 일반 미션만 주는 걸 권장
 * - onClose: 모달 닫기
 * - onSelect: (선택미션id, true) - 필요 시 유지
 * - onReward: 리워드 화면 이동/후처리 등(선택)
 * - onReceipt: (payload) => { ... } 영수증 인증 흐름 시작 (카메라/업로드로 이동)
 * - refetchMissions: () => Promise<void>  인증 후 돌아왔을 때 최신 미션 재조회
 * - header: { title, desc } 상단 안내 카드 (옵션)
 */

function Mission({
  missions,
  onSelect,
  onClose,
  onReward,
  onReceipt, //  영수증 인증 트리거(부모가 처리: 촬영/업로드 화면 이동)
  refetchMissions, // 인증 완료 후 돌아오면 최신 리스트 재조회
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

  // 렌더용 소스: 백엔드 -> props.missions 우선, 없으면 예시
  const sourceList =
    Array.isArray(missions) && missions.length > 0 ? missions : fallbackItems;
  const [selected, setSelected] = useState(null);

  const totalTasks = sourceList.length;
  const completedCount = sourceList.filter(
    (m) => Number(m.is_successed) === 1
  ).length;
  const canClaimReward = completedCount >= MIN_FOR_REWARD;

  // 리워드 받기 클릭
  const handleConfirm = () => {
    if (!canClaimReward) return; // 3개 미만이면 비활성
    onSelect?.(selected, true);
    onReward?.(); // 필요 시 리워드 화면 이동 등
    setSelected(null);
    onClose?.();
  };

  // ESC 닫기
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

  // 영수증 인증 버튼
  const handleReceiptVerify = async (mission) => {
    //어느 미션인지 식별 + 4.1(영수증 촬영)하도록 함
    const payload = {
      mission_id: mission.id,
      step_code: mission.step_code || "4.1",
      action: "영수증 촬영",
    };

    await onReceipt?.(payload);

    // 인증을 마치고 다시 이 화면으로 돌아오면,
    // 프론트는 직접 상태를 바꾸지 않고 백엔드에서 최신 미션리스트를 다시 받아옴
    // → is_successed 가 1로 업데이트되어 내려오면 UI에 '도장' 표시
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

      <h2 className="mission-title-large">{header.title}</h2>
      <img className="mission-mascot" src={mascot} alt="핸썹이" />
      <p className="mission-subtitle">{header.desc}</p>

      <div className="mission-list">
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

                {/* ✅ 영수증 인증 버튼: 미션별로 트리거 */}
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
                      영수증<br></br>인증
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ 3개 이상 성공해야 활성화 */}
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
