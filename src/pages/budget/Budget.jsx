import React, { useState, useEffect } from "react";
import "./Budget.css";
import mascot2 from "../../assets/한복핸썹여백없음.png";
import Story from "../../components/Story";
import Sijang from "../../components/Sijang";
import { useNavigate, useLocation } from "react-router-dom";

const Budget = ({ budget, setBudget, onNext }) => {
  // 프롭 없을 대비 폴백
  const [localBudget, setLocalBudget] = useState("");
  const budgetVal = budget ?? localBudget;
  const setBudgetFn = setBudget ?? setLocalBudget;

  const [made, setMade] = useState(false); // AI 미션 생성 완료 여부
  const [showStory, setShowStory] = useState(false); // 스토리 모달
  const [storyId, setStoryId] = useState(null); // 선택된 스토리
  const [marketStep, setMarketStep] = useState(false); // 버튼 "시장 선택하기" 단계
  const [showSijang, setShowSijang] = useState(false); // 시장 모달
  const [marketId, setMarketId] = useState(null); // 선택된 시장

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.fromStory) {
      setMarketStep(true);
      if (location.state.storyId) setStoryId(location.state.storyId);
    }
  }, [location.state]);

  const handleButtonClick = () => {
    // 시장 단계면 라우팅 대신 모달 오픈 (팝업으로)
    if (marketStep) {
      setShowSijang(true);
      return;
    }
    // AI 미션 생성 단계
    if (!made) {
      if (!budgetVal || !budgetVal.trim()) return;
      setMade(true);
      onNext?.(budgetVal);
      return;
    }
    // 스토리 선택 단계 → 스토리 모달 오픈
    setShowStory(true);
  };

  // 스토리 모달에서 확인 눌렀을 때
  const handleStorySelect = (id, fromStory) => {
    setStoryId(id);
    setShowStory(false);
    // 모달 모드에선 바로 "시장 선택하기" 단계로
    if (fromStory) {
      setMarketStep(true);
    } else {
      // 페이지 모드로 스토리 화면에 가고 싶을 때 사용(현재는 모달 플로우가 기본)
      navigate("/story", { state: { budget: budgetVal, storyId: id } });
    }
  };

  const buttonLabel = marketStep
    ? "시장 선택하기"
    : !made
    ? "AI 미션 생성하기"
    : "스토리 선택하기";

  return (
    <div className={`budget-page ${showStory || showSijang ? "blur" : ""}`}>
      <h1>시장통</h1>
      <p>#시간 가는 줄 모르고 장 보며 통 크게 리워드 얻자!</p>

      <div>
        <div className="speech-bubble">
          저와 함께 미션을 깨고, 리워드를 얻어봐요!
        </div>
        <div className="money-character">
          <img src={mascot2} alt="마스코트" className="character-img" />
        </div>
      </div>

      <div className="budget-wrap">
        <input
          type="text"
          className="budget-box"
          value={budgetVal}
          onChange={(e) => setBudgetFn(e.target.value)}
          placeholder=" 사용 가능한 예산을 입력해주세요"
        />
        <span className="won-adorn">원</span>
      </div>

      <button
        type="button"
        className="mission-button"
        onClick={handleButtonClick}
      >
        {buttonLabel}
      </button>
      {/* 스토리 모달 */}
      {showStory && (
        <div className="modal-backdrop" onClick={() => setShowStory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <Story
              onSelect={(id) => {
                handleStorySelect(id, true);
              }}
            />
          </div>
        </div>
      )}
      {/* 시장 모달 */}
      {showSijang && (
        <div className="modal-backdrop" onClick={() => setShowSijang(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <Sijang
              onSelect={(id) => {
                setMarketId(id);
                setShowSijang(false);
                // navigate("/map", { state: { budget: budgetVal, storyId, marketId: id } });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;
