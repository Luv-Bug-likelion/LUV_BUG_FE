import React from "react";
import "./Guide.css";
import mascot from "../../assets/한복핸썹.png";

const Guide = () => {
  return (
    <div className="guide-page">
      <h1 className="guide-title">사용방법</h1>
      <p className="guide-sub">
        #시간 가는 줄 모르고 장 보며 통 크게 리워드 받자!
      </p>
      <div className="guide-card">
        <div className="guidestory">
          <div className="guide-story">
            <strong>1. 예산 입력 및 미션 생성</strong>
            <p>
              사용가능한 예산을 입력하고, <b>[AI 미션 생성하기]</b> 버튼을
              눌러주세요
            </p>
          </div>
          <div className="guide-story">
            <strong>2. 스토리 및 시장 선택</strong>
            <p>
              원하는 <b>미션 스토리</b>를 고른 뒤, 방문할 전통시장(ex. 역곡
              남부시장)을 선택합니다.
            </p>
          </div>
          <div className="guide-story">
            <strong>3. AI 미션 확인</strong>
            <p>
              AI가 예산과 스토리에 맞춰 <b>구매해야 할 품목 목록</b>을 자동
              생성합니다.
            </p>
          </div>
          <div className="guide-story">
            <strong>4. 시장 방문 및 품목 구매</strong>
            <p>
              <b>지도에 표시된 가게</b>를 참고하여 미션에 나온 품목을 직접
              구매하세요.
            </p>
          </div>
          <div className="guide-story">
            <strong>5. 영수증 인증</strong>
            <p>
              구매 후 받은 <b>영수증 사진을 미션창에서 업로드 하여</b> 미션을
              인증합니다.
            </p>
          </div>
          <div className="guide-story">
            <strong>6. 미션 3개 달성 시 리워드 지급</strong>
            <p>
              <b>최소 3개의 미션을 완료하면,</b> 리워드 지급 조건을 충족하여,
              리워드를 받을 수 있습니다.
            </p>
          </div>
          <div className="guide-story">
            <strong>7. 사용 금액의 10% 리워드 받기</strong>
            <p>
              미션을 진행하는 동안 <b>총 사용한 금액의 10%</b>가 현장에서
              지역화폐 교환권으로 지급됩니다.
            </p>
          </div>
        </div>
      </div>
      <button className="guide-button">시작하기</button>

      <img src={mascot} alt="마스코트" className="character" />
    </div>
  );
};

export default Guide;
