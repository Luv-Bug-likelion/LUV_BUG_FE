import React, { useState } from "react";
import "./Story.css";
import { useNavigate, useLocation } from "react-router-dom";

function Story({ onSelect }) {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const budget = location.state?.budget;

  const items = [
    { id: 1, text: "1. 기본 - 일상 속 일반적인 일 기반" },
    { id: 2, text: "2. 레시피 기반 - 레시피를 위해 재료 구매" },
    { id: 3, text: "3. 부천의 역사이야기 - 부천의 역사 기반" },
  ];

  const handleConfirm = () => {
    if (!selected) return;

    // 모달(Budget 위에서) 사용 중
    if (typeof onSelect === "function") {
      onSelect(selected, true); // 두 번째 인자: fromStory 플래그
      return;
    }

    // /story 라우트로 직접 들어온 경우 → Budget으로 복귀하여 버튼 전환
    navigate("/budget", {
      state: { fromStory: true, budget, storyId: selected },
    });
  };

  return (
    <div className="box">
      {items.map((item) => (
        <div key={item.id}>
          <div
            className={`item ${selected === item.id ? "active" : ""}`}
            onClick={() => setSelected(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" ? setSelected(item.id) : null)}
          >
            {item.text}
          </div>
        </div>
      ))}

      <button
        className="story-check"
        onClick={handleConfirm}
        disabled={!selected}
      >
        확인
      </button>
    </div>
  );
}

export default Story;
