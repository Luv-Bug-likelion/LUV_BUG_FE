import React, { useState } from "react";
import "./Story.css";

function Sijang({ onSelect, onClose }) {
  // ← onClose 추가(바깥 클릭/확인 닫기)
  const [selected, setSelected] = useState(null);

  const items = [
    { id: 1, text: "자유시장" },
    { id: 2, text: "상동시장" },
    { id: 3, text: "중동시장" },
    { id: 4, text: "원미종합" },
    { id: 5, text: "원미부흥" },
    { id: 6, text: "역곡남부" },
    { id: 7, text: "역곡상상" },
    { id: 8, text: "원종종합" },
    { id: 9, text: "원종중앙" },
    { id: 10, text: "소사종합" },
    { id: 11, text: "부천제일" },
    { id: 12, text: "고강시장" },
    { id: 13, text: "한신시장" },
    { id: 14, text: "강남시장" },
    { id: 15, text: "오정시장" },
    { id: 16, text: "신흥시장" },
  ];

  const handleConfirm = () => {
    if (!selected) return;
    onSelect?.(selected);
    onClose?.(); // ← 확인 누르면 닫기
  };

  const stop = (e) => e.stopPropagation(); // ← 카드 내부 클릭 시 닫힘 방지

  return (
    <>
      {/* 1) 뒤 배경 블러 + 딤 */}
      <div className="modal-overlay" onClick={onClose} />

      {/* 2) 가운데 정렬 래퍼 */}
      <div className="modal" onClick={onClose}>
        {/* 3) 실제 카드 */}
        <div className="modal-card" onClick={stop}>
          <div className="box">
            {items.map((item) => (
              <div key={item.id}>
                <div
                  className={`item ${selected === item.id ? "active" : ""}`}
                  onClick={() => setSelected(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" ? setSelected(item.id) : null
                  }
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
        </div>
      </div>
    </>
  );
}

export default Sijang;
