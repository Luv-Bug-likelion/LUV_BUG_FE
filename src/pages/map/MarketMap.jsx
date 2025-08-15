import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import KakaoMap from "../../components/KakaoMap";
import triangleIcon from "../../assets/triangle.svg";
import Mission from "../../components/Mission.jsx";
import StoreList from "../../components/StoreList.jsx";
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

const categoryKorean = {
  meat: "육류",
  vegetable: "채소",
  fruit: "과일",
};

const MarketMap = () => {
  const mapCenter = { lat: 37.480701, lng: 126.8117 };
  const BACKEND_KEY = import.meta.env.VITE_BACKEND_DOMAIN_KEY;

  const [storeData, setStoreData] = useState(null);
  const [missionOpen, setMissionOpen] = useState(false);
  const [counter, setCounter] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("전체");

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const userKey = localStorage.getItem("userKey");
        if (!userKey) throw new Error("User key not found in localStorage");

        const response = await axios.get(`${BACKEND_KEY}/mission/stores`, {
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
  }, [BACKEND_KEY]);

  console.log("[MarketMap] 렌더링 직전 storeData:", storeData);

  const filteredStores = useMemo(() => {
    if (!storeData) return []; // 데이터가 없으면 빈 배열 반환
    if (selectedCategory === "전체") {
      // '전체'일 경우 모든 카테고리의 점포를 하나의 배열로 합침
      return Object.values(storeData).flat();
    }
    // 특정 카테고리가 선택된 경우 해당 점포 목록 반환
    return storeData[selectedCategory] || [];
  }, [storeData, selectedCategory]);

  return (
    <div>
      <div className="header">
        <div className="header-contents">
          <p>역곡남부시장</p>
          <img src={triangleIcon} alt="Triangle" className="triangle-icon" />
        </div>
      </div>


      <KakaoMap center={mapCenter} storeData={storeData} />

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

      <button
            onClick={() => {
              // 🔹 미션현황 버튼은 '열기만' 하도록 (여기서 +1 하지 않음)
              setMissionOpen(true);
            }}
            className="mission-board-button"
          >
            미션현황({counter} / 5)
          </button>
       <div className="store-list-container">
        <div className="filter-buttons">
          <button
            onClick={() => setSelectedCategory("전체")}
            className={selectedCategory === "전체" ? "active" : ""}
          >
            전체
          </button>
          {storeData && Object.keys(storeData).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "active" : ""}
            >
              {categoryKorean[category] || category}
            </button>
          ))}
        </div>
        
        {/* 🔹 2. 기존 ul 태그 대신 StoreList 컴포넌트를 사용하고, props로 데이터를 전달합니다. */}
        <StoreList stores={filteredStores} />

      </div>

    </div>
  );
};

export default MarketMap;
