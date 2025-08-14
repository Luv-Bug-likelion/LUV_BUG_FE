import { useEffect, useRef } from "react";
import './KakaoMap.css'; 

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
                    center: new window.kakao.maps.LatLng(center.lat, center.lng),
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

                window.kakao.maps.event.addListener(clusterer, 'clusterclick', function(cluster) {
                  const center = cluster.getCenter();
                  const adjustedLat = center.getLat() - 0.0011; //중심좌표 조절
                  const adjustedLng = center.getLng()
                  const newCenter = new window.kakao.maps.LatLng(adjustedLat, adjustedLng);

                  map.setCenter(newCenter);

                  const currentLevel = map.getLevel();
                  if (currentLevel > 2) {
                      map.setLevel(currentLevel - 1);
                  }
              });

                const transparentMarkerImage = new window.kakao.maps.MarkerImage(
                    "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==", // 1x1 투명 GIF
                    new window.kakao.maps.Size(1, 1),
                    { offset: new window.kakao.maps.Point(0, 0) }
                );

                const geocoder = new window.kakao.maps.services.Geocoder();
                const categoryMap = {
                    meat: '육류', vegetable: '채소', fruit: '과일', fish: '수산물',
                };

                const geocodingPromises = Object.entries(storeData).flatMap(([category, stores]) =>
                    stores.map(store => new Promise((resolve) => {
                        geocoder.addressSearch(store.address, (result, status) => {
                            if (status === window.kakao.maps.services.Status.OK) {
                                const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
                                
                                const marker = new window.kakao.maps.Marker({
                                    position: coords,
                                    image: transparentMarkerImage,
                                });

                                const customOverlay = new window.kakao.maps.CustomOverlay({
                                    position: coords,
                                    content: `<div class="custom-marker-label">${categoryMap[category]}</div>`,
                                    map: null,
                                });

                                resolve({ marker, customOverlay });
                            } else {
                                resolve(null);
                            }
                        });
                    }))
                );
                
                Promise.all(geocodingPromises).then(results => {
                    const validResults = results.filter(r => r !== null);
                    const markers = validResults.map(r => r.marker);
                    
                    clusterer.addMarkers(markers);
                    
                    window.kakao.maps.event.addListener(map, 'idle', () => {
                        validResults.forEach(r => {
                            if (r.marker.getMap()) {
                                r.customOverlay.setMap(map);
                            } else {
                                r.customOverlay.setMap(null);
                            }
                        });
                    });
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