import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import KakaoMap from "../../components/KakaoMap";
import triangleIcon from "../../assets/triangle.svg";
import Mission from "../../components/Mission.jsx";
import StoreList from "../../components/StoreList.jsx";
import Explain from "../../components/Explain.jsx";
import "./MarketMap.css";

const mockData = {
  "code": 200,
  "message": "상점 목록 조회 성공",
  "data": {
    "marketName": "역곡남부시장",
    "signPost": "역곡역 2번출구",
    "meat": [
      {
        "name": "상점 A 정육점",
        "address": "경기 부천시 소사구 괴안동 224-1",
        "phoneNumber": "032-123-4567",
        "industry": "정육점",
        "x": "126.8123",
        "y": "37.4823"
      }
    ],
    "fish": [
      {
        "name": "상점 C 수산",
        "address": "경기 부천시 소사구 부광로16번길 33 1층",
        "phoneNumber": "032-987-6543",
        "industry": "수산물 가게",
        "x": "126.8125",
        "y": "37.4825"
      }
    ],
    "vegetable": [],
    "fruit": []
  }
};

const categoryKorean = {
  meat: "육류",
  vegetable: "채소",
  fruit: "과일",
  fish: "수산물",
};

const excludedKeys = ["marketName", "signPost"];

const MarketMap = () => {
  const [mapCenter, setMapCenter] = useState({ lat: 37.482, lng: 126.8117 });
  const BACKEND_KEY = import.meta.env.VITE_BACKEND_DOMAIN_KEY;

  const [storeData, setStoreData] = useState(null);
  const [missionOpen, setMissionOpen] = useState(false);
  const [counter, setCounter] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const userKey = localStorage.getItem("userKey");
        if (!userKey) throw new Error("User key not found in localStorage");

        const response = await axios.get(`${BACKEND_KEY}/mission/stores`, {
          headers: {
            userKey: userKey,
          },
        });

        setStoreData(response.data.data);
        console.log("성공!", response.data.data);
      } catch (err) {
        console.error("API 요청 실패:", err);
        console.log("목 데이터를 사용합니다.");
        setStoreData(mockData.data);
      }
    };

    const fetchModalData = async () => {
      try {
        const userKey = localStorage.getItem("userKey");
        if (!userKey) throw new Error("User key not found in localStorage");

        const response = await axios.get(`${BACKEND_KEY}/스토리접근URI`, {
          headers: {
            'userKey': userKey
          }
        });
        sessionStorage.setItem('explained', 'true');

        setModalData(response.data); // 받아온 데이터를 state에 저장
        setIsExplainModalOpen(true); // 데이터 로딩 성공 후 모달을 열도록 설정
      } catch (error) {
        console.error("Modal API 요청 실패:", error);
        // 모달 데이터 로딩 실패 시에는 모달을 띄우지 않습니다.

        const mockModalData = {
          explain: "이것은 API 연동 실패 시 나타나는 목업 데이터입니다. 여기서 디자인을 확인하세요."
        };

        // ✨ 2. API가 성공했을 때와 동일한 로직을 실행해 모달을 띄웁니다.
        console.log("목데이터로 모달을 띄웁니다.");
        sessionStorage.setItem('explained', 'true'); // 방문 기록 저장
        setModalData(mockModalData); // 목데이터로 상태 설정
        setIsExplainModalOpen(true);  // 모달 열기
      }
    };

    fetchStoreData();

    const explainModalShown = sessionStorage.getItem('explained');
    if (!explainModalShown) {
      fetchModalData(); // 최초 방문 시에만 모달 데이터 요청
    }
  }, [BACKEND_KEY]);

  useEffect(() => {
    if (!storeData) return;

    // 'marketName', 'signPost'를 제외한 모든 상점 데이터를 하나의 배열로 합칩니다.
    const allStores = Object.keys(storeData)
      .filter(key => !excludedKeys.includes(key))
      .flatMap(key => storeData[key]);

    // 상점 데이터가 없으면 아무 작업도 하지 않습니다.
    if (allStores.length === 0) return;

    let totalLat = 0;
    let totalLng = 0;

    // 모든 상점의 위도(y)와 경도(x)를 합산합니다.
    allStores.forEach(store => {
      // 좌표값이 문자열일 수 있으므로 숫자로 변환합니다.
      totalLat += parseFloat(store.y);
      totalLng += parseFloat(store.x);
    });
    
    // 평균값을 계산합니다.
    const avgLat = totalLat / allStores.length;
    const avgLng = totalLng / allStores.length;
    
    // 계산된 평균값으로 지도 중심 state를 업데이트합니다.
    setMapCenter({ lat: avgLat, lng: avgLng });

  }, [storeData]); // storeData가 변경될 때마다 이 effect가 실행됩니다.

  const mapData = useMemo(() => {
    if (!storeData) return null;
    const { marketName, signPost, ...filteredData } = storeData;
    return filteredData;
  }, [storeData]);

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
      <Explain
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
        data={modalData}
      />

      <div className="header">
        <div className="header-contents">
          <p>{storeData?.marketName}</p>
          <img src={triangleIcon} alt="Triangle" className="triangle-icon" />
        </div>
      </div>

      <KakaoMap center={mapCenter} storeData={mapData} />

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
      <div className="store-content">
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
          <div className="filter-container">
            <button
              onClick={() => setSelectedCategory("전체")}
              className={`filter-button ${
                selectedCategory === "전체" ? "active" : ""
              }`}
            >
              전체
            </button>
            {storeData &&
              Object.keys(storeData)
                .filter((key) => !excludedKeys.includes(key))
                .map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`filter-button ${
                      selectedCategory === category ? "active" : ""
                    }`}
                  >
                    {categoryKorean[category] || category}
                  </button>
                ))}
          </div>

          {/* 🔹 2. 기존 ul 태그 대신 StoreList 컴포넌트를 사용하고, props로 데이터를 전달합니다. */}
          <StoreList
            stores={filteredStores}
            marketName={storeData?.marketName}
            signPost={storeData?.signPost}
          />
        </div>
      </div>
    </div>
  );
};

export default MarketMap;
