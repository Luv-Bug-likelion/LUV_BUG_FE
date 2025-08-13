import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 전환을 위해 import
import Webcam from 'react-webcam';
import axios from 'axios';
import './Camera.css';

// 라이브 프리뷰용 저해상도 설정
const lowResConstraints = { width: 640, height: 480, facingMode: "environment" };

// 캡처용 고해상도 설정 (ideal 사용)
const highResConstraints = { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: "environment" };

const Camera = () => {
  const navigate = useNavigate(); // 페이지 전환 함수
  const webcamRef = useRef(null);

  // UI 상태 관리
  const [freezeFrameSrc, setFreezeFrameSrc] = useState(null); // 화면 고정용 이미지 소스
  const [statusText, setStatusText] = useState(''); // 오버레이에 표시될 텍스트
  
  // 카메라 장치 관련 상태 및 함수 (이전과 동일)
  const [devices, setDevices] = useState([]);
  const [activeDeviceId, setActiveDeviceId] = useState(undefined);
  
  const handleDevices = useCallback((mediaDevices) => {
    const videoDevices = mediaDevices.filter(({ kind }) => kind === "videoinput");
    setDevices(videoDevices);
    const rearCamera = videoDevices.find(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('후면'));
    if (rearCamera) setActiveDeviceId(rearCamera.deviceId);
    else if (videoDevices.length > 0) setActiveDeviceId(videoDevices[0].deviceId);
  }, [setDevices]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  const handleSwitchCamera = () => {
    if (devices.length > 1) {
      const currentDeviceIndex = devices.findIndex(device => device.deviceId === activeDeviceId);
      const nextDeviceIndex = (currentDeviceIndex + 1) % devices.length;
      setActiveDeviceId(devices[nextDeviceIndex].deviceId);
    }
  };

  const finalVideoConstraints = {
    ...lowResConstraints,
    deviceId: activeDeviceId ? { exact: activeDeviceId } : undefined,
  };

  // 캡처부터 업로드, 페이지 전환까지 모든 과정을 지휘하는 함수
  const captureAndUpload = useCallback(async () => {
    if (!webcamRef.current?.video?.srcObject) return;

    // 1. 화면 고정 및 오버레이 표시
    const freezeFrame = webcamRef.current.getScreenshot();
    setFreezeFrameSrc(freezeFrame);
    setStatusText('고화질로 촬영 중...');
    
    // 렌더링을 위한 잠깐의 틈
    await new Promise(resolve => setTimeout(resolve, 10));

    const video = webcamRef.current.video;
    const track = video.srcObject.getVideoTracks()[0];

    try {
      // 2. 고해상도 전환 및 캡처
      await track.applyConstraints(highResConstraints);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const highResImageSrc = webcamRef.current.getScreenshot();

      if (!highResImageSrc) throw new Error("고화질 캡처에 실패했습니다.");

      // 3. 서버 전송 시작
      setStatusText('영수증을 분석 중입니다...');
      
      const blob = await (await fetch(highResImageSrc)).blob();
      const file = new File([blob], "receipt.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append('receipt', file);
      
      const response = await axios.post('YOUR_BACKEND_API_ENDPOINT', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 4. 성공 시 결과 페이지로 이동 (서버 응답 데이터와 함께)
      console.log('서버 응답:', response.data);
      alert('분석이 완료되었습니다.');
      navigate('/receipt/result', { state: { result: response.data } });

    } catch (error) {
      console.error("전체 프로세스 실패:", error);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
      // 5. 실패 시 초기 상태로 복귀
      setFreezeFrameSrc(null);
      setStatusText('');
    } finally {
      // 저해상도로 복귀 (오류가 나더라도 시도)
      try { await track.applyConstraints(lowResConstraints); } 
      catch (revertError) { console.error("저해상도 복귀 실패:", revertError); }
    }
  }, [webcamRef, navigate]);

  return (
    <div className="camera-container">
      {/* 화면 고정 및 오버레이 UI */}
      {freezeFrameSrc && (
        <div className="capture-overlay">
          <img src={freezeFrameSrc} alt="촬영 화면 고정" className="freeze-frame-bg" />
          <div className="overlay-content">
            <p>{statusText}</p>
            {/* 여기에 로딩 스피너 등을 추가할 수 있습니다. */}
          </div>
        </div>
      )}

      {/* 기본 카메라 UI */}
      <Webcam
        audio={false}
        ref={webcamRef}
        videoConstraints={finalVideoConstraints}
        // ... 기타 props
      />
      
      {devices.length > 1 && !freezeFrameSrc && (
        <div className="camera-controls-top">
          <button onClick={handleSwitchCamera} className="switch-button">
            카메라 전환
          </button>
        </div>
      )}

      <div className="controls">
        <button 
          onClick={captureAndUpload} 
          className="capture-button" 
          aria-label="사진 촬영 및 전송"
          disabled={!!freezeFrameSrc} // 촬영 시작 시 버튼 비활성화
        />
      </div>
    </div>
  );
};

export default Camera;