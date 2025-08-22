import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import KakaoMap from "../../components/KakaoMap";
import triangleIcon from "../../assets/triangle.svg";
import Mission from "../../components/Mission.jsx";
import StoreList from "../../components/StoreList.jsx";
import Explain from "../../components/Explain.jsx";
import "./MarketMap.css";

// 1. 변경된 API 형식에 맞게 mockData를 수정합니다.
const mockData = {
    "code": 200,
    "message": "상점 목록 조회 성공",
    "data": [
        {
            "name": "엄지농산물 역곡중국식품",
            "address": "경기 부천시 소사구 괴안동 115",
            "phoneNumber": "010-9900-0994",
            "x": "126.811408753172",
            "y": "37.4832365002343",
            "industry": "가정,생활 > 식품판매",
            "subwayName": "역곡역 1호선",
            "subwayDistance": "237m"
        },
        {
            "name": "마임건강식품 역곡남부센터",
            "address": "경기 부천시 소사구 괴안동 115-5",
            "phoneNumber": "032-343-2655",
            "x": "126.812319163446",
            "y": "37.4835911448229",
            "industry": "의료,건강 > 건강식품판매",
            "subwayName": "역곡역 1호선",
            "subwayDistance": "192m"
        },
        {
            "name": "삼화종합식품",
            "address": "경기 부천시 소사구 괴안동 105-2",
            "phoneNumber": "032-341-3486",
            "x": "126.81198639288829",
            "y": "37.48193005894606",
            "industry": "가정,생활 > 식품판매",
            "subwayName": "역곡역 1호선",
            "subwayDistance": "375m"
        },
        {
            "name": "완도화목식품",
            "address": "경기 부천시 소사구 괴안동 119-7",
            "phoneNumber": "",
            "x": "126.814141217401",
            "y": "37.4815307178032",
            "industry": "가정,생활 > 식품판매",
            "subwayName": "역곡역 1호선",
            "subwayDistance": "458m"
        },
        {
            "name": "홍운중국식품",
            "address": "경기 부천시 소사구 괴안동 127-8",
            "phoneNumber": "",
            "x": "126.812804114707",
            "y": "37.4840829631675",
            "industry": "가정,생활 > 식품판매",
            "subwayName": "역곡역 1호선",
            "subwayDistance": "151m"
        },
        {
            "name": "다원중국식품",
            "address": "경기 부천시 소사구 괴안동 115-13",
            "phoneNumber": "",
            "x": "126.811680908936",
            "y": "37.4829170767007",
            "industry": "가정,생활 > 식품판매",
            "subwayName": "역곡역 1호선",
            "subwayDistance": "268m"
        },
        {
            "name": "한우촌정육점",
            "address": "경기 부천시 소사구 괴안동 116-13",
            "phoneNumber": "",
            "x": "126.81205341749148",
            "y": "37.482254528315835",
            "industry": "가정,생활 > 식품판매 > 정육점",
            "subwayName": "역곡역 1호선",
            "subwayDistance": "339m"
        },
        {
            "name": "계경목장 부천역곡점",
            "address": "경기 부천시 소사구 괴안동 115-7",
            "phoneNumber": "032-341-4106",
            "x": "126.812778170693",
            "y": "37.4836053881713",
            "industry": "가정,생활 > 식품판매 > 정육점",
            "subwayName": "역곡역 1호선",
            "subwayDistance": "199m"
        },
        {
            "name": "강원축산",
            "address": "경기 부천시 소사구 괴안동 105-3",
            "phoneNumber": "032-341-0828",
            "x": "126.812190580629",
            "y": "37.4816600813982",
            "industry": "가정,생활 > 식품판매 > 정육점",
            "subwayName": "역곡역 1호선",
            "subwayDistance": "405m"
        },
        {
            "name": "옥주축산",
            "address": "경기 부천시 소사구 괴안동 115-14",
            "phoneNumber": "",
            "x": "126.8116025898754",
            "y": "37.48303858784928",
            "industry": "가정,생활 > 식품판매 > 정육점",
            "subwayName": "역곡역 1호선",
            "subwayDistance": "255m"
        },
        {
            "name": "금산수산",
            "address": "경기 부천시 소사구 괴안동 107-8",
            "phoneNumber": "",
            "x": "126.811508632874",
            "y": "37.4826338856378",
            "industry": "가정,생활 > 식품판매 > 수산물판매",
            "subwayName": "역곡역 1호선",
            "subwayDistance": "301m"
        },
        {
            "name": "근해안강망수협 역곡역지점",
            "address": "경기 부천시 소사구 괴안동 109-5",
            "phoneNumber": "032-344-8111",
            "x": "126.81038158345332",
            "y": "37.48345289999461",
            "industry": "금융,보험 > 금융서비스 > 은행 > 수협",
            "subwayName": "역곡역 1호선",
            "subwayDistance": "254m"
        },
        {
            "name": "금자네수산",
            "address": "경기 부천시 소사구 괴안동 105-2",
            "phoneNumber": "032-344-2780",
            "x": "126.811931843211",
            "y": "37.4820416970728",
            "industry": "음식점 > 한식 > 해물,생선 > 회",
            "subwayName": "역곡역 1호선",
            "subwayDistance": "363m"
        },
        {
            "name": "e편한마트",
            "address": "경기 부천시 소사구 괴안동 116",
            "phoneNumber": "032-342-3655",
            "x": "126.811722154318",
            "y": "37.4827009006388",
            "industry": "가정,생활 > 슈퍼마켓",
            "subwayName": "역곡역 1호선",
            "subwayDistance": "291m"
        },
        {
            "name": "지짐이랑막걸리랑",
            "address": "경기 부천시 소사구 괴안동 126-1",
            "phoneNumber": "",
            "x": "126.813046482457",
            "y": "37.4839193635938",
            "industry": "음식점 > 술집 > 호프,요리주점",
            "subwayName": "역곡역 1호선",
            "subwayDistance": "177m"
        },
        {
            "name": "오시오호프치킨",
            "address": "경기 부천시 소사구 괴안동 109-12",
            "phoneNumber": "",
            "x": "126.81057343738424",
            "y": "37.48314596423096",
            "industry": "음식점 > 술집",
            "subwayName": "역곡역 1호선",
            "subwayDistance": "274m"
        }
    ]
};

// 2. 카테고리 이름을 한글로 매핑합니다.
const categoryKorean = {
  meat: "육류",
  vegetable: "채소",
  fruit: "과일",
  fish: "수산물",
  etc: "기타",
};

// 3. ✨ industry 키워드를 기반으로 카테고리를 분류하는 규칙을 정의합니다.
// 새로운 업종이 추가되면 이 배열에 키워드를 추가하여 관리할 수 있습니다.
const nameBasedCategoryKeywords = {
  meat: ["축산", "정육"],
  fish: ["수산", "생선", "어시장"],
  vegetable: ["야채", "농산물"],
  fruit: ["과일", "청과"],
};

const industryNameMapping = {
  meat: "정육점",
  fish: "수산물 가게",
  vegetable: "야채 가게",
  fruit: "과일 가게",
  etc: "기타",
};

// API 응답 데이터를 프론트엔드에서 사용하기 편한 형태로 가공하는 함수
const processData = (stores) => {
  const categorizedStores = {
    meat: [],
    fish: [],
    vegetable: [],
    fruit: [],
    etc: [],
  };

  stores.forEach((store) => {
     if (exclusionKeywords.some(keyword => store.name.includes(keyword))) {
      return; // 포함되어 있다면, 이 점포에 대한 처리를 중단하고 다음 점포로 넘어갑니다.
    }
    let isCategorized = false; // ✨ 해당 점포가 분류되었는지 확인하는 플래그

    // nameBasedCategoryKeywords 기준으로 분류 시도
    for (const category in nameBasedCategoryKeywords) {
      // ✨ store.industry 대신 store.name을 확인하도록 변경
      if (nameBasedCategoryKeywords[category].some(keyword => store.name.includes(keyword))) {
        
        const modifiedStore = {
          ...store,
          industry: industryNameMapping[category] 
        };

        categorizedStores[category].push(modifiedStore);
        isCategorized = true; // 분류되었음으로 표시
        break; 
      }
    }

    // ✨ for 루프가 끝날 때까지 분류되지 않았다면 '기타' 카테고리로 처리
    if (!isCategorized) {
      const modifiedStore = {
        ...store,
        industry: industryNameMapping.etc
      };
      categorizedStores.etc.push(modifiedStore);
    }
  });

  return {
    marketName: "역곡남부시장",
    signPost: "역곡역 2번출구",
    ...categorizedStores
  };
};

const excludedKeys = ["marketName", "signPost"];
const exclusionKeywords = ["홍운", "막걸리", "치킨", "계경", "수협", "마임", "완도"]; 

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
        console.log("원래 데이터 :", response.data.data);

        // 4. API로부터 받은 데이터를 `processData` 함수로 가공합니다.
        const processed = processData(response.data.data);
        setStoreData(processed);
        console.log("성공!", processed);
      } catch (err) {
        console.error("API 요청 실패:", err);
        console.log("목 데이터를 사용합니다.");
        // 5. 목 데이터도 동일하게 `processData` 함수로 가공합니다.
        const processedMock = processData(mockData.data);
        setStoreData(processedMock);
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
          미션 현황 ({counter}/5)
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
