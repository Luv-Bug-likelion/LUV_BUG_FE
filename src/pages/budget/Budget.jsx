import React, { useState, useEffect, useMemo } from "react";
import "./Budget.css";
import mascot2 from "../../assets/한복핸썹여백없음.png";
import Story from "../../components/Story";
import Sijang from "../../components/Sijang";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const BACKEND_KEY = import.meta.env.VITE_BACKEND_DOMAIN_KEY;

const Budget = ({ budget, setBudget, onNext }) => {
  const [localBudget, setLocalBudget] = useState("");
  const budgetVal = budget ?? localBudget;
  const setBudgetFn = setBudget ?? setLocalBudget;

  const [made, setMade] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [storyId, setStoryId] = useState(null);
  const [marketStep, setMarketStep] = useState(false);
  const [showSijang, setShowSijang] = useState(false);
  const [marketId, setMarketId] = useState(null);

  const [toastMsg, setToastMsg] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const bubbleText = useMemo(() => {
    const msgs = [
      "저와 함께 미션을 깨고, 리워드를 얻어봐요!",
      "저는 부천 마스코트 핸썹이에요! 부천핸썹!",
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }, []);

  useEffect(() => {
    if (location.state?.fromStory) {
      setMarketStep(true);
      if (location.state.storyId) setStoryId(location.state.storyId);
    }
  }, [location.state]);

  const handleBudgetChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, "");
    setBudgetFn(onlyDigits);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 1800);
  };

  const isValidBudget = () => {
    const n = Number(budgetVal);
    if (!budgetVal.trim().length || !Number.isFinite(n) || n <= 0) {
      return { valid: false, reason: "empty" }; // 입력 없음
    }
    if (n < 30000) {
      return { valid: false, reason: "tooLow" }; // 3만원 미만
    }
    return { valid: true };
  };

  const handleButtonClick = async () => {
    console.log("버튼 눌림");

    const check = isValidBudget();
    if (!check.valid) {
      if (check.reason === "empty") {
        showToast("예산을 먼저 입력해야 미션 생성이 가능합니다.");
      } else if (check.reason === "tooLow") {
        showToast("3만원 이상 입력해주세요.");
      }
      return;
    }

    if (marketStep) {
      setShowSijang(true);
      return;
    }

    setShowStory(true);
  };

  const createMission = async (selectedMarketName) => {
    try {
      const res = await axios.post(`${BACKEND_KEY}/home`, {
        market: selectedMarketName || "부천역곡남부시장",
        budget: Number(budgetVal),
        storyId: storyId ?? 1,
      });

      if (res.data.code === 200) {
        console.log("스토리 생성 성공:", res.data.data);
        const userKey = res.data.data;
        window.localStorage.setItem("userKey", userKey);
        setMade(true);
        onNext?.(budgetVal);
        navigate("/loading");
      } else {
        showToast(
          "스토리 생성 실패: " + (res.data?.message ?? "알 수 없는 오류")
        );
      }
    } catch (err) {
      console.error("API 호출 에러:", err);
      showToast("서버 오류가 발생했어요.");
    }
  };

  const handleStorySelect = (id, fromStory) => {
    setStoryId(id);
    setShowStory(false);
    if (fromStory) {
      setMarketStep(true);
    } else {
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
        <div className="speech-bubble">{bubbleText}</div>
        <div className="money-character">
          <img src={mascot2} alt="마스코트" className="character-img" />
        </div>
      </div>

      <div className="budget-wrap">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className="budget-box"
          value={budgetVal}
          onChange={handleBudgetChange}
          placeholder=" 사용 가능한 예산을 입력해주세요"
        />
        <span className="won-adorn">원</span>
      </div>

      <button
        type="button"
        className={`mission-button ${marketStep ? "market" : ""} ${
          isValidBudget() ? "is-active" : "is-disabled"
        }`}
        disabled={!isValidBudget()}
        onClick={handleButtonClick}
      >
        {buttonLabel}
      </button>

      {/* Story 모달 */}
      {showStory && (
        <Story
          onSelect={(id) => handleStorySelect(id, true)}
          onClose={() => setShowStory(false)}
        />
      )}

      {/* Sijang 모달 */}
      {showSijang && (
        <Sijang
          onConfirm={async (marketName) => {
            console.log("시장 최종 선택됨:", marketName);
            setMarketId(marketName);
            setShowSijang(false);

            if (!made && isValidBudget()) {
              await createMission(marketName);
            }
          }}
          onClose={() => setShowSijang(false)}
        />
      )}

      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
};

export default Budget;
