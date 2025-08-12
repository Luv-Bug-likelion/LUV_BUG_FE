import loadingIcon from '../../assets/triangle.svg';
import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-container">
      <p style={{ fontWeight: '800', fontSize: '40px', marginTop: '166px' }}>미션 생성중</p>
      <img src={loadingIcon} alt="로딩 아이콘" className="loading-icon"/>
      <p style={{ fontWeight: '600', fontSize: '16px', marginTop: '49px' }}>핸썹이가 오늘의 미션을 열심히 준비 중이에요!</p>
    </div>
  );
};
export default Loading;