const StoreList = ({ stores }) => {
  return (
    <ul className="store-list">
      {stores.length > 0 ? (
        stores.map((store) => (
          <li key={`${store.name}-${store.address}`} className="store-item">
            <div className="store-info">
              <h3 style={{ fontSize:'20px', fontWeight:'500'}}>{store.name}</h3>
              <p>{store.address}</p>
              <p>{store.phoneNumber}</p>
            </div>
            {/* 향후 상세정보 모달을 보여줄 버튼은 
              이곳에 추가하면 됩니다. 
            */}
            <button className="details-button">상세보기</button>
          </li>
        ))
      ) : (
        <p className="no-stores">해당 카테고리의 점포가 없습니다.</p>
      )}
    </ul>
  );
};

export default StoreList;