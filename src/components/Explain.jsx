import handsup from "../assets/한복핸썹여백없음.png";
import './Explain.css';

const Explain = ({ isOpen, onClose, data }) => {
    if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* API로 받은 데이터가 있다면 그 데이터를, 없다면 기본 메시지를 표시합니다. */}
        <p>미션 생성완료!</p>
        <img src={handsup} alt='핸썹이' style={{}} />
        <p>{data?.explain ?? '미션 설명을 불러올 수 없습니다.'}</p>
        <button onClick={onClose}>미션하러 가기</button>
      </div>
    </div>
  );


}

export default Explain;