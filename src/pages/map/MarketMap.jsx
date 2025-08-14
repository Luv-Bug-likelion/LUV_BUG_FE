import { useState, useEffect } from "react";
import axios from "axios";
import StoreBottomSheet from "../../components/StoreBottomSheet.jsx";
import KakaoMap from "../../components/KakaoMap";
import triangleIcon from "../../assets/triangle.svg";
import Mission from "../../components/Mission.jsx";
import "./MarketMap.css";

const mockData = {
  meat: [
    {
      name: "상점 A 정육점",
      address: "경기 부천시 소사구 괴안동 224-1",
      phoneNumber: "032-123-4567",
    },
    {
      name: "상점 B 정육점",
      address: "경기 부천시 소사구 부광로16번길 33 1층",
      phoneNumber: "032-987-6543",
    },
  ],
  vegetable: [
    {
      name: "싱싱 야채",
      address: "경기 부천시 소사구 경인로498번길 26 역곡남부시장",
      phoneNumber: "032-111-2222",
    },
  ],
};

const MarketMap = () => {
  const mapCenter = { lat: 37.480701, lng: 126.8117 };
  const BACKEND_KEY = import.meta.env.VITE_BACKEND_DOMAIN_KEY;

  const [storeData, setStoreData] = useState(null);
  const [missionOpen, setMissionOpen] = useState(false);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const userKey = localStorage.getItem("userKey");
        if (!userKey) throw new Error("User key not found in localStorage");

        const response = await axios.post(`${BACKEND_KEY}/story/location`, {
          userKey: userKey,
        });

        setStoreData(response.data);
        console.log("성공!", response.data);
      } catch (err) {
        console.error("API 요청 실패:", err);
        console.log("목 데이터를 사용합니다.");
        setStoreData(mockData);
      }
    };

    fetchStoreData();
  }, []);

  console.log("[MarketMap] 렌더링 직전 storeData:", storeData);

  return (
    <div>
      <div className="header">
        <div className="header-contents">
          <p>역곡남부시장</p>
          <img src={triangleIcon} alt="Triangle" className="triangle-icon" />
          <button
            onClick={() => {
              // 🔹 미션현황 버튼은 '열기만' 하도록 (여기서 +1 하지 않음)
              setMissionOpen(true);
            }}
          >
            미션현황({counter} / 5)
          </button>
        </div>
      </div>

      <KakaoMap center={mapCenter} storeData={storeData} />

      <StoreBottomSheet>
        <div>
          <p>여기에 가게 정보 리스트가 들어옵니다.</p>
          <div
            style={{
              height: "800px",
              background: "#f0f0f0",
              marginTop: "16px",
            }}
          >
            가게 목록 바텀시트
          </div>
        </div>
      </StoreBottomSheet>

      {missionOpen && (
        <div className="modal-overlay" onClick={() => setMissionOpen(false)}>
          <div className="modal-body" onClick={(e) => e.stopPropagation()}>
            <Mission
              stamps={counter} // 진행개수 전달
              onClose={() => setMissionOpen(false)}
              onReward={() =>
                // 리워드 받을 때만 +1
                setCounter((prev) => (prev >= 5 ? prev : prev + 1))
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketMap;
