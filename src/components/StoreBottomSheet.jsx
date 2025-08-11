import { Drawer } from 'vaul';
import './StoreBottomSheet.css'; // Vaul 커스텀 스타일을 위한 CSS 파일

const StoreBottomSheet = ({ children }) => {
  return (
    // Vaul의 Drawer.Root가 전체 컨테이너 역할을 합니다.
    // open prop을 항상 true로 설정하면 기본적으로 열려있습니다.
    <Drawer.Root open={true} snapPoints={[0.5, 1]} activeSnapPoint={0.5}>

      {/* 배경 콘텐츠와의 상호작용을 위해 Portal을 사용하지 않습니다. */}
      <Drawer.Trigger asChild>
        {/* 트리거가 필요 없으므로 빈 Fragment를 둡니다. */}
        <></>
      </Drawer.Trigger>
      
      {/* Drawer.Content가 실제 보이는 시트 부분입니다. */}
      <Drawer.Content className="store-bottom-sheet-content">
        {/* 핸들(상단 바) 부분 */}
        <div className="handle-bar-container">
          <div className="handle-bar" />
        </div>
        
        {/* 페이지에서 전달받은 자식 요소(가게 목록 등) */}
        {children}
      </Drawer.Content>

    </Drawer.Root>
  );
};

export default StoreBottomSheet;