import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import loadingIcon from '../../assets/loadingIcon.svg';
import './Loading.css';

const BACKEND_KEY = import.meta.env.VITE_BACKEND_DOMAIN_KEY;

const Loading = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. 로컬 스토리지에서 'userKey' 값을 가져옵니다.
    const userKey = window.localStorage.getItem('userKey');

    // 2. userKey가 로컬 스토리지에 없는 경우에 대한 예외 처리
    if (!userKey) {
      alert("사용자 정보를 찾을 수 없습니다. 메인 페이지로 이동합니다.");
      navigate('/');
      return;
    }

    // API를 호출하는 비동기 함수
    const processMission = async () => {
      try {
        // 3. 로컬 스토리지에서 가져온 userKey로 API를 요청합니다.
        await axios.get(`${BACKEND_KEY}/mission`, {
          headers: { 'userKey': userKey },
        });

        console.log("미션 처리 요청 성공");

        // 4. 요청 성공 시, 데이터를 전달하지 않고 원하는 다음 페이지로 이동시킵니다.
        navigate('/map', { replace: true }); 
        } catch (error) {
        console.error("미션 처리 요청 실패:", error);
        alert("오류가 발생했습니다. 이전 페이지로 돌아갑니다.");
        navigate(-1); // 이전 페이지로 돌아가기
      }
    };

    processMission();
  }, [navigate]);

  return (
    <div className="loading-container">
      <p style={{ fontWeight: '800', fontSize: '40px', marginTop: '166px' }}>미션 생성중</p>
      <img src={loadingIcon} alt="로딩 아이콘" className="loading-icon"/>
      <p style={{ fontWeight: '600', fontSize: '16px', marginTop: '49px' }}>핸썹이가 오늘의 미션을 열심히 준비 중이에요!</p>
    </div>
  );
};
export default Loading;