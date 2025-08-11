import React, { useState, useEffect, useCallback } from "react";
import "./Story.css";
import { useNavigate, useLocation } from "react-router-dom";

function Story({ onSelect, onClose }) {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const budget = location.state?.budget;

  const items = [
    {
      id: 1,
      title: "1. 기본",
      desc: "일상 속 일어날법한 일을 기반으로 스토리를 생성해줍니다",
    },
    {
      id: 2,
      title: "2. 부천의 역사이야기",
      desc: "부천시의 역사 이야기를 기반으로 스토리를 생성해줍니다",
    },
    {
      id: 3,
      title: "3. 레시피 기반",
      desc: "요리연구가 A의 레시피를 위해 필요한 재료 구매",
    },
  ];

  const handleConfirm = () => {
    if (!selected) return;
    if (typeof onSelect === "function") {
      onSelect(selected, true);
      onClose?.();
      return;
    }
    navigate("/budget", {
      state: { fromStory: true, budget, storyId: selected },
    });
  };

  // 바깥 클릭 닫힘 방지
  const stop = (e) => e.stopPropagation();

  // ESC 닫기 + 바디 스크롤 락
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

  return (
    <>
      {/* 시장 모달처럼: 오버레이 */}
      <div className="story-overlay" onClick={onClose} />

      {/* 시장 모달처럼: 화면 중앙 고정 래퍼 */}
      <div className="story-modal" onClick={onClose}>
        <div
          className="story-box"
          onClick={stop}
          role="dialog"
          aria-modal="true"
          aria-label="스토리 선택"
        >
          <ul className="story-list">
            {items.map((item) => (
              <li
                key={item.id}
                className={`story-item ${
                  selected === item.id ? "active" : ""
                } ${item.id === 3 ? "disabled" : ""}`}
                onClick={() => {
                  if (item.id !== 3) setSelected(item.id); // 3번은 클릭 안 먹히게
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && item.id !== 3) setSelected(item.id);
                }}
              >
                <div className="story-title">{item.title}</div>
                <div className="story-desc">: {item.desc}</div>
              </li>
            ))}
          </ul>

          <button
            className="story-check"
            onClick={handleConfirm}
            disabled={!selected}
          >
            확인
          </button>
        </div>
      </div>
    </>
  );
}

export default Story;
