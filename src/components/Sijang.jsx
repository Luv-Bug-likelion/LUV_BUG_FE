import React, { useState, useEffect, useCallback } from "react";
import "./Sijang.css";

function Sijang({ onSelect, onClose, onConfirm }) {
  const [selected, setSelected] = useState(null);

  const items = [
    { id: 1, text: "자유시장", value: "자유시장" },
    { id: 2, text: "상동시장", value: "상동시장" },
    { id: 3, text: "중동시장", value: "중동시장" },
    { id: 4, text: "원미종합", value: "원미종합" },
    { id: 5, text: "원미부흥", value: "원미부흥" },
    { id: 6, text: "역곡남부", value: "역곡남부시장" }, // 👈 표시: 역곡남부 / 전달: 역곡남부시장
    { id: 7, text: "역곡상상", value: "역곡상상" },
    { id: 8, text: "원종종합", value: "원종종합" },
    { id: 9, text: "원종중앙", value: "원종중앙" },
    { id: 10, text: "소사종합", value: "소사종합" },
    { id: 11, text: "부천제일", value: "부천제일" },
    { id: 12, text: "고강시장", value: "고강시장" },
    { id: 13, text: "한신시장", value: "한신시장" },
    { id: 14, text: "강남시장", value: "강남시장" },
    { id: 15, text: "오정시장", value: "오정시장" },
    { id: 16, text: "신흥시장", value: "신흥시장" },
  ];

  const handleConfirm = () => {
    if (!selected) return;
    onSelect?.(selected);
    onConfirm?.(selected); // ✅ value값("역곡남부시장") 전달
    onClose?.();
  };

  const stop = (e) => e.stopPropagation();

  // ESC로 닫기
  const onEsc = useCallback(
    (e) => {
      if (e.key === "Escape") onClose?.();
    },
    [onClose]
  );
  useEffect(() => {
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onEsc]);

  return (
    <>
      {/* 뒤 배경 (블러+딤) */}
      <div className="sijang-overlay" onClick={onClose} />

      <div className="sijang-modal" onClick={onClose}>
        <div
          className="sijang-card"
          onClick={stop}
          role="dialog"
          aria-modal="true"
          aria-label="시장 선택"
        >
          <div className="sijang-grid">
            {items.map((item) => (
              <div
                key={item.id}
                className={`sijang-cell ${
                  selected === item.value ? "active" : ""
                } ${item.id !== 6 ? "disabled" : ""}`}
                onClick={() => {
                  if (item.id === 6) setSelected(item.value); // ✅ value 저장
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && item.id === 6)
                    setSelected(item.value); // ✅ value 저장
                }}
              >
                {item.text}
              </div>
            ))}
          </div>

          <button
            className="sijang-confirm"
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

export default Sijang;
