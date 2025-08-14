import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import mascot from "../../assets/한복핸썹.png";
import "./SuccessReceipt.css";

const SuccessReceipt = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {state} = location;

  useEffect(() => {
     if (state) {
      const { result, capturedImage } = state;

      console.log('결과 데이터:', result);
      console.log('캡처된 이미지:', capturedImage);
     }
  }, [state]);

  const buttonReturnToMap = () => {
    navigate('/map');
  };

  return (
    <div className="check-container">
      <p style={{ color: '#111', fontSize: '20px', fontWeight:'500', marginTop:'27px'}}>{state.result.storeName}</p>
      <img src={mascot} alt="마스코트" className="hands-up" />
      <p style={{ color: '#111', fontSize: '18px', fontWeight:'500', marginTop:'20px' }}>당신의 참여가 지역 시장에 활력을 더했어요!</p>
      <div className="log-container">
        <div>
            <div style={{ color:'#111', fontSize:'24px', fontWeight:'500'}}>영수증 내역</div>
            <div className="date-container">
                <p style={{ color: '#ACACAC', fontSize: '14px', fontWeight:'500' }}>방문일</p>
                <p style={{ color: '#111', fontSize: '14px', fontWeight:'500', marginLeft:'5px' }}>{state.result.date}</p>
            </div>
        </div>
        <img src={state.capturedImage} alt='찍은 영수증' className="receiptimg"/>
      </div>
      <hr style={{width: '90%', height:'2px', backgroundColor:'#AAA', marginTop:'22px'}}/>
      <div className="amount-container">
        <p style={{ color: '#111', fontSize: '18px', fontWeight:'500' }}>합계</p>
        <p style={{ color: '#C46D48', fontSize: '20px', fontWeight:'500' }}>{state.result.totalPrice}원</p>
      </div>
      <hr style={{width:'90%', height:'2px', backgroundColor:'#F2F2F2', marginTop:'15px'}}/>
      <div className="notice">영수증에서 인식한 정보입니다</div>
      <button onClick={buttonReturnToMap} className="complete-button">구매 인증 완료</button>
    </div>
  );
};

export default SuccessReceipt;
