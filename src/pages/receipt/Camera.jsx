import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // useLocation 추가
import Webcam from 'react-webcam';
import axios from 'axios';
import turnIcon from '../../assets/turnCamera.svg';
import caseImage from '../../assets/case.svg';
import receiptImage from '../../assets/receiptIcon.svg';
import './Camera.css';

const mockData = {
  userKey : "unique-user-key-1234",
  mission_id: 1,
}

// 라이브 프리뷰용 저해상도 설정
const lowResConstraints = { width: 640, height: 480 };
// 캡처용 고해상도 설정 (ideal 사용)
const highResConstraints = { width: { ideal: 1920 }, height: { ideal: 1080 } };

const Camera = () => {
  const navigate = useNavigate();
  const location = useLocation(); // location 객체 사용
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  // 이전 페이지에서 넘어온 mission_id 추출
  //const { mission_id } = location.state || {};

    // [목 데이터] 개발용 mission_id 사용 - 나중에 API 개발되면 지우면 됨
  const { mission_id } = mockData;
  // UI 상태 관리
  const [capturedImageSrc, setCapturedImageSrc] = useState(null); // 최종 고화질 이미지
  const [showGuide, setShowGuide] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false); // 촬영 중(검은 화면) 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 분석 중(반투명 오버레이) 상태
  const [isSwitching, setIsSwitching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 카메라 장치 관리
  const [cameraIds, setCameraIds] = useState({ front: null, back: null });
  const [activeDeviceId, setActiveDeviceId] = useState(null);

  useEffect(() => {
    // mission_id가 없는 비정상적인 접근 처리
    if (!mission_id) {
      alert("잘못된 접근입니다. 미션 페이지로 돌아갑니다.");
      navigate(-1); // 이전 페이지 또는 미션 목록 페이지로 이동
    }

    const timer = setTimeout(() => {
      setShowGuide(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [mission_id, navigate]);

  const handleClose = () => {
    navigate(-1);
  };

  const handleDevices = useCallback((mediaDevices) => {
    const videoDevices = mediaDevices.filter(({ kind }) => kind === "videoinput");
    const front = videoDevices.find(device =>
      device.label.toLowerCase().includes('front') || device.label.toLowerCase().includes('전면')
    );
    const back = videoDevices.find(device =>
      device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('후면')
    );
    setCameraIds({ front: front?.deviceId, back: back?.deviceId });

    if (back) {
      setActiveDeviceId(back.deviceId);
    } else if (videoDevices.length > 0) {
      setActiveDeviceId(videoDevices[0].deviceId);
    } else {
      setIsLoading(false);
      alert("사용 가능한 카메라를 찾을 수 없습니다.");
    }
  }, [setCameraIds]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  const handleSwitchCamera = () => {
    setIsSwitching(true);
    setTimeout(() => {
      if (activeDeviceId === cameraIds.back && cameraIds.front) {
        setActiveDeviceId(cameraIds.front);
      } else if (cameraIds.back) {
        setActiveDeviceId(cameraIds.back);
      }
    }, 10);
  };

  const handleUserMedia = () => {
    setIsLoading(false);
    setIsSwitching(false);
  };

  const finalVideoConstraints = {
    ...lowResConstraints,
    deviceId: activeDeviceId ? { exact: activeDeviceId } : undefined,
  };

  /**
   * 이미지를 백엔드 API로 업로드하는 함수
   * @param {object} params - 매개변수 객체
   * @param {File} params.file - 전송할 이미지 파일
   * @param {string} params.imageSrc - 결과 페이지로 전달할 이미지의 Data URL
   */
  const uploadImage = useCallback(async ({ file, imageSrc }) => {
    if (!file || !mission_id) return;

    // 로컬 스토리지에서 userKey 가져오기
    /*const userKey = localStorage.getItem('userKey');
    if (!userKey) {
        alert("사용자 인증 정보가 없습니다. 다시 로그인해주세요.");
        setIsAnalyzing(false);
        setCapturedImageSrc(null);
        // 필요시 로그인 페이지로 리다이렉트
        // navigate('/login');
        return;
    }*/

    const { userKey } = mockData;

    setIsAnalyzing(true); // '분석 중' 오버레이 표시

    const formData = new FormData();
    formData.append('receipt', file);
    formData.append('mission_id', mission_id); // mission_id 추가

    try {
      const response = await axios.post('YOUR_BACKEND_API_ENDPOINT', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${userKey}` // 인증 헤더 추가
        },
      });

      // 200 OK 응답 확인
      if (response.status === 200) {
        console.log('서버 응답:', response.data);
        // 응답 데이터와 고화질 이미지를 함께 다음 페이지로 전달
        navigate('/recieptcheck', {
          state: {
            result: response.data,
            capturedImage: imageSrc
          }
        });
      } else {
        // 200이 아닌 다른 상태 코드 처리
        throw new Error(`서버 응답 코드: ${response.status}`);
      }

    } catch (error) {
      console.error("업로드 실패 (개발 모드):", error);
      console.log("개발 모드: Mock 데이터로 결과 페이지로 이동합니다.");

            // 다음 페이지에서 사용할 가상의 result 객체
      const mockResult = {
        message: "API 연동 전 Mock 데이터입니다.",
        storeName: "엄지네 농산",
        date: "2025-08-15",
        totalPrice: 8000,
        mission_id: mission_id
      };

      // 에러가 발생해도 캡처한 이미지와 Mock 데이터를 가지고 다음 페이지로 이동
      navigate('/checksuccess', {
        state: {
          result: mockResult, // 가상 결과 데이터 전달
          capturedImage: imageSrc // 캡처한 고화질 이미지 전달
        }
      });
      
      /*console.error("업로드 실패:", error);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
      setIsAnalyzing(false);
      setCapturedImageSrc(null); // 에러 발생 시 캡처 이미지 초기화*/
    }
  }, [navigate, mission_id]); // useCallback 의존성 배열에 mission_id 추가

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageSrc = reader.result;
        setCapturedImageSrc(imageSrc); // 화면에 선택한 이미지 표시
        uploadImage({ file, imageSrc }); // 업로드 함수 호출
      };
      reader.readAsDataURL(file);
    }
    event.target.value = null;
  };

  const handleRetake = () => {
    setCapturedImageSrc(null);
    setIsAnalyzing(false);
  };

  const captureAndProcess = useCallback(async () => {
    if (!webcamRef.current?.video?.srcObject) return;

    setIsCapturing(true);

    // 짧은 딜레이 후 캡처 프로세스 시작 (화면 깜빡임 효과)
    setTimeout(async () => {
      const video = webcamRef.current.video;
      const track = video.srcObject.getVideoTracks()[0];

      try {
        const currentFacingMode = activeDeviceId === cameraIds.front ? "user" : "environment";
        await track.applyConstraints({ ...highResConstraints, facingMode: currentFacingMode });

        // 카메라 해상도 변경 및 안정화를 위한 대기 시간
        await new Promise(resolve => setTimeout(resolve, 100));

        const highResImageSrc = webcamRef.current.getScreenshot();
        if (!highResImageSrc) throw new Error("고화질 캡처 실패");

        setCapturedImageSrc(highResImageSrc); // 고화질 이미지로 화면 업데이트
        setIsCapturing(false); // 검은 화면 제거

        // base64 이미지를 File 객체로 변환
        const blob = await (await fetch(highResImageSrc)).blob();
        const file = new File([blob], "receipt.jpg", { type: "image/jpeg" });
        
        // 이미지 업로드 함수 호출
        await uploadImage({ file, imageSrc: highResImageSrc });

      } catch (error) {
        console.error("캡처 프로세스 실패:", error);
        alert("사진 촬영에 실패했습니다.");
        setIsCapturing(false);
      } finally {
        // 촬영 후 다시 저해상도 프리뷰로 복귀
        try {
          await track.applyConstraints({ ...lowResConstraints, deviceId: activeDeviceId ? { exact: activeDeviceId } : undefined });
        } catch (revertError) {
          console.error("저해상도 복귀 실패:", revertError);
        }
      }
    }, 10);
  }, [webcamRef, uploadImage, activeDeviceId, cameraIds]);

  return (
    <div className="camera-container">
      {/* --- 오버레이 (로딩, 전환, 캡처 중) --- */}
      {(isLoading || isSwitching || isCapturing) && (
        <div className="processing-overlay">
          {isLoading && <p>카메라 준비 중...</p>}
        </div>
      )}

      {showGuide && (
        <div className="guide-overlay">
          <div>
            <img src={caseImage} alt="영수증 촬영 안내1" className="guide-image1" />
            <img src={receiptImage} alt="영수증 촬영 안내2" className="guide-image2" />
          </div>
          <p className="guide-text">
            직접 방문한 장소 영수증의<br />
            사업자 정보와 결제 정보가<br />
            잘 나오게 찍어주세요.
          </p>
        </div>
      )}

      {!isAnalyzing && !isSwitching && !isCapturing && (
        <button onClick={handleClose} className="close-button">×</button>
      )}

      {/* --- 메인 뷰 (웹캠 또는 캡처 이미지) --- */}
      {capturedImageSrc ? (
        <img src={capturedImageSrc} alt="캡처된 영수증" className="captured-image" />
      ) : (
        activeDeviceId && (
          <Webcam
            audio={false}
            ref={webcamRef}
            videoConstraints={finalVideoConstraints}
            mirrored={activeDeviceId === cameraIds.front}
            onUserMedia={handleUserMedia}
            onUserMediaError={(error) => {
              console.error("카메라 에러:", error);
              alert("카메라를 시작할 수 없습니다. 브라우저의 카메라 권한을 확인해주세요.");
              setIsLoading(false);
            }}
          />
        )
      )}

      {/* --- 분석 중 오버레이 --- */}
      {isAnalyzing && (
        <div className="analysis-overlay">
          <p>영수증을 분석중입니다.</p>
        </div>
      )}

      {/* --- 하단 컨트롤 UI (상황에 따라 변경) --- */}
      {!isLoading && (
        capturedImageSrc ? (
          // 이미지 캡처 후 UI (재촬영 버튼)
          <div className="controls">
            <button onClick={handleRetake} className="retake-button" disabled={isAnalyzing}>
              {isAnalyzing ? '분석 중...' : '다시 촬영'}
            </button>
          </div>
        ) : (
          // 기본 카메라 촬영 UI
          <div className="controls">
            <div className="controls-section left">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="gallery-button"
                aria-label="갤러리에서 사진 선택"
                disabled={isCapturing || isSwitching}
              >
              </button>
            </div>
            <div className="controls-section center">
              <button
                onClick={captureAndProcess}
                className="capture-button"
                aria-label="사진 촬영 및 전송"
                disabled={isCapturing || isSwitching || !activeDeviceId}
              />
            </div>
            <div className="controls-section right">
              {cameraIds.front && cameraIds.back && !isCapturing && !isSwitching && (
                <button onClick={handleSwitchCamera} className="switch-button">
                  <img src={turnIcon} alt="카메라전환" className="turn-icon" />
                </button>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Camera;