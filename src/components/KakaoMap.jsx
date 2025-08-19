import { useEffect, useRef } from "react";
import './KakaoMap.css';
import meatIcon from '../assets/carrot.svg';
import vegetableIcon from '../assets/carrot.svg';
import fruitIcon from '../assets/carrot.svg';
import fishIcon from '../assets/carrot.svg';
import defaultIcon from '../assets/carrot.svg';

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
                    gridSize: 100,
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

                             circle.appendChild(image);
                             content.appendChild(circle);

                             const customOverlay = new window.kakao.maps.CustomOverlay({
                                 map: map,
                                 position: coords,
                                 content: content,
                                 yAnchor: 1 // InfoWindow yAnchor 값과 동일하게 설정
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