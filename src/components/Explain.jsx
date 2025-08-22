import handsup from "../assets/한복핸썹여백없음.png";
import './Explain.css';

const Explain = ({ isOpen, onClose }) => {
    if (!isOpen) {
    return null;
  }

  const storyId = localStorage.getItem('storyId');
  const missionText = storyId === '1' ? 
    `조선 삼대 의적으로 불린 임꺽정은 다양한 무대에서 활동했습니다. 임꺽정은 황해도 청석골 화적패의 두령이 되기 전 계양산에서 1년 반 동안 검술을 익히게 됩니다. 수련을 하던 임꺽정은 관군의 눈을 피해 소래산, 성주산, 원미산 줄기를 타고 하구에서 배를 타고 황해도로 잠입하게 됩니다.

    당신은 임꺽정의 오른팔입니다. 검술 수련을 마치고 이동하던 임꺽정은 배가 너무 고파 부천 지역의 장터에서 끼니거리를 구하려 합니다. 임꺽정은 이미 관군의 추적을 받고있어 얼굴이 알려져 민가에 쉽게 접근할 수 없어 부하인 당신에게 식량을 구해오는 지령을 내려줍니다. 장터에서 식량을 구해 임꺽정의 주린 배를 채워줍시다!
` :
    storyId === '2' ?
    `친구들과 재밌게 뛰어놀고 집에 돌아온 당신. 부엌에선 덜컥거리는 밥솥 소리와 보글보글 냄비 소리가 들려옵니다. 
“다녀왔니?. 저녁 준비 중인데 엄마 심부름 좀 해줄래?”
심부름은 너무 귀찮았지만 엄마의 명품 요리 솜씨를 생각하면 당신은 반드시 재료를 사와 맛있는 저녁에 일조하게 됩니다.
“여기 사와야 될 것들을 적었어. 잘 보고 사오면 돼.”
필요한 재료 목록을 보고 시장에서 장을 봐 맛있는 저녁 식사를 완성합시다!
` :
    data?.explain ?? '미션 설명을 불러올 수 없습니다.';


  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* API로 받은 데이터가 있다면 그 데이터를, 없다면 기본 메시지를 표시합니다. */}
        <p style={{fontSize:'20px', fontWeight:'800', color:'#2d2d2d', marginTop:'25px'}}>미션 생성완료!</p>
        <img src={handsup} alt='핸썹이' style={{width:'118px', height:'160px', marginTop:'20px'}} />
        <p style={{fontSize:'12px', fontWeight:'600', lineHeight:'15px', marginTop:'20px'}}>{missionText}</p>
        <button className='explain-modal-btn' onClick={onClose}>미션하러 가기</button>
      </div>
    </div>
  );


}

export default Explain;