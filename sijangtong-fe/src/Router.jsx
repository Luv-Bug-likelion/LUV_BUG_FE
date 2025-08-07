import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Router = () => {
    return(
        <BrowserRouter>
            <Routes>
                
                
            </Routes>
        </BrowserRouter>
    );

};

export default Router;

//예시
/*
import문 : import FindMidpoint from './pages/middlepoint/FindMidpoint';
상대경로 철자 등 꼼꼼히 체크

<Route path="/" element={<FindMidpoint />} />
상단에 import문과 상시 체크
*/