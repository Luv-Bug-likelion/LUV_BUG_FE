import { useEffect, useRef } from "react";
import './KakaoMap.css';
import meatIcon from '../assets/meat.svg';
import vegetableIcon from '../assets/carrot.svg';
import fruitIcon from '../assets/apple.svg';
import fishIcon from '../assets/fish.svg';
import defaultIcon from '../assets/etc.svg';

const KakaoMap = ({ center, storeData }) => {
    const mapRef = useRef(null);
    const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;

    useEffect(() => {
        if (!storeData) return;

        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false&libraries=services,clusterer`;
        script.async = true;

        script.onload = () => {
            window.kakao.maps.load(() => {
                if (!mapRef.current) return;
                
                const map = new window.kakao.maps.Map(mapRef.current, {
                    center: new window.kakao.maps.LatLng(center.lat-0.0008, center.lng),
                    level: 3
                });

                const clusterer = new window.kakao.maps.MarkerClusterer({
                    map: map,
                    averageCenter: true,
                    minLevel: 3,
                    gridSize: 500,
                    disableClickZoom: true,
                    styles: [{
                        width: '40px', height: '40px',
                        background: 'rgba(125,125,125, .75)',
                        borderRadius: '20px',
                        color: '#fff',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        lineHeight: '40px',
                    }],
                });

                 const activeColors = {
                    meat: '#F94963',      // 육류: 붉은 계열
                    fish: '#5D35FF',      // 수산물: 푸른 계열
                    vegetable: '#F5AE1B', // 채소: 녹색 계열
                    fruit: '#F00',     // 과일: 주황 계열
                    default: '#777777'    // 기타: 회색 계열
                };
                const defaultColor = '#42433F'; // 원래의 어두운 색
                const defaultTextColor = '#333';

                let selectedOverlay = null;

                const imageSize = new window.kakao.maps.Size(38, 38);
                const markerImageSources = {
                    meat: meatIcon,
                    vegetable: vegetableIcon,
                    fruit: fruitIcon,
                    fish: fishIcon,
                };

                const categoryMarkerImages = {};
                for (const key in markerImageSources) {
                    categoryMarkerImages[key] = new window.kakao.maps.MarkerImage(markerImageSources[key], imageSize);
                }
                const defaultMarkerImageSrc = defaultIcon;

                // 3. 마커 생성 로직을 이미지 마커 방식으로 변경합니다.
                const markers = Object.entries(storeData).flatMap(([category, stores]) =>
                    stores.map(store => {
                        if (store.y && store.x) {
                            const coords = new window.kakao.maps.LatLng(store.y, store.x);
                             const iconSrc = markerImageSources.hasOwnProperty(category) ? markerImageSources [category] : defaultMarkerImageSrc;

                             // 💡 동그라미 안에 이미지를 넣는 HTML content를 생성합니다.
                             const content = document.createElement('div');
                             content.className = 'custom-marker-container';

                             const circle = document.createElement('div');
                             circle.className = 'custom-marker-circle';

                             const image = document.createElement('img');
                             image.className = 'custom-marker-image';
                             image.src = iconSrc;

                             // ✨ 1. 상점 이름을 표시할 라벨 요소를 생성합니다.
                            const label = document.createElement('div');
                            label.className = 'map-marker-label'; // CSS에서 정의한 클래스
                            label.textContent = store.name;   // store 데이터에서 이름을 가져옴

                             circle.appendChild(image);
                             content.appendChild(circle);
                             content.appendChild(label);

                             const customOverlay = new window.kakao.maps.CustomOverlay({
                                 map: map,
                                 position: coords,
                                 content: content,
                                 yAnchor: 1 // InfoWindow yAnchor 값과 동일하게 설정
                             });
                            // ✨ 3. 각 마커(content)에 클릭 이벤트를 추가합니다.
                            content.addEventListener('click', () => {
                                // 4-1. 이전에 선택된 마커가 있다면 원래 색으로 되돌립니다.
                                if (selectedOverlay && selectedOverlay !== customOverlay) {
                                    const prevContent = selectedOverlay.getContent();
                                    const prevCircle = prevContent.querySelector('.custom-marker-circle');
                                    prevCircle.style.backgroundColor = defaultColor;
                                    prevCircle.style.borderColor = defaultColor;

                                    const prevLabel = prevContent.querySelector('.map-marker-label');
                                    if(prevLabel) prevLabel.classList.remove('active');
                                    prevLabel.style.color = defaultTextColor;
                                }

                                // 4-2. 현재 클릭한 마커의 색을 카테고리에 맞게 변경합니다.
                                const activeColor = activeColors[category] || activeColors.default;
                                circle.style.backgroundColor = activeColor;
                                circle.style.borderColor = activeColor;

                                label.classList.add('active');
                                label.style.color = activeColor; 

                                // 4-3. 현재 클릭한 마커를 '선택된 마커'로 지정합니다.
                                selectedOverlay = customOverlay;
                            });

                            return customOverlay;
                        }
                        return null;
                    }).filter(Boolean)
                );
                
                // 생성된 마커들을 클러스터러에 추가합니다.
                clusterer.addMarkers(markers);
                
                // ℹ️ 기존의 transparentMarkerImage, customOverlay, idle 이벤트 리스너는 제거되었습니다.

                // --- 주요 변경 사항 끝 ---

                // 클러스터 클릭 이벤트는 그대로 유지됩니다.
                window.kakao.maps.event.addListener(clusterer, 'clusterclick', function(cluster) {
                    const center = cluster.getCenter();
                    const adjustedLat = center.getLat() - 0.0011;
                    const adjustedLng = center.getLng();
                    const newCenter = new window.kakao.maps.LatLng(adjustedLat, adjustedLng);

                    map.setCenter(newCenter);

                    const currentLevel = map.getLevel();
                    if (currentLevel > 2) {
                        map.setLevel(currentLevel - 1);
                    }
                });
            });
        };

        document.head.appendChild(script);

        return () => {
        };
    }, [center, storeData, KAKAO_JS_KEY]);

    return <div ref={mapRef} className="kakaomap-container" style={{ width: "100%", height: "597px" }} />;
};

export default KakaoMap;