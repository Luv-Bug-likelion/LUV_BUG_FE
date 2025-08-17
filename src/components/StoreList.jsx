import { useState } from "react";
import addressIcon from "../assets/addressNotice.svg";
import clockIcon from "../assets/clock.svg";
import phoneIcon from "../assets/phone.svg";
import closeIcon from "../assets/silverX.svg";

const StoreList = ({ stores, marketName, signPost }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);

    const handleStoreClick = (store) => {
        setSelectedStore(store);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedStore(null);
    };

  return (
    <ul className="store-list">
      {stores.length > 0 ? (
        stores
          .filter((store) => store && store.name)
          .map((store) => (
          <li key={`${store.name}-${store.phoneNumber}`} className="store-item">
            <div className="store-info">
              {marketName && (
                  <p style={{ fontSize: '12px', fontWeight: '700', marginTop:'12px', color:'#17416B' }}>
                    {marketName}
                  </p>
                )}
              <p style={{ fontSize:'20px', fontWeight:'500', marginTop:'12px'}}>{store.name}</p>
              <div className="sub-info-container">
                <img src={addressIcon} alt='주소표시 아이콘' style={{width:'10px', height:'12ox', marginRight:'4px'}}/>
                <p style={{fontSize: '14px', fontWeight: '500'}}>{signPost} · {store.industry}</p>
              </div>
            </div>
            <button className="details-button" onClick={() => handleStoreClick(store)}>상세보기</button>
            {isModalOpen && selectedStore?.name === store.name && (
                <div className="store-item-modal">
                  <button className="close-modal" onClick={handleModalClose}><img src={closeIcon} alt="닫기" style={{width:'10px', height:'10px'}}/></button>
                  <div className="store-modal-content">
                    <div className="modal-each-container">
                      <img src={addressIcon} alt='주소표시 아이콘' style={{width:'10px', height:'12ox', marginRight:'8px'}}/>
                      <p style={{fontSize: '12px', fontWeight: '500'}}>{store.address}</p>
                    </div>
                     <div className="modal-each-container">
                      <img src={clockIcon} alt='시계 아이콘' style={{width:'10px', height:'12ox', marginRight:'8px'}}/>
                      <p style={{fontSize: '12px', fontWeight: '500'}}>영업시간</p>
                    </div>
                    <div className="modal-each-container">
                      <img src={phoneIcon} alt='전화 아이콘' style={{width:'10px', height:'12ox', marginRight:'8px'}}/>
                      <p style={{fontSize: '12px', fontWeight: '500'}}>{store.phoneNumber}</p>
                    </div>
                  </div>
                </div>
              )}
          </li>
        ))
      ) : (
        <p className="no-stores">해당 카테고리의 점포가 없습니다.</p>
      )}
    </ul>
  );
};

export default StoreList;