import { BrowserRouter, Routes, Route } from "react-router-dom";
import Onboarding from "./pages/Onboarding";
import MarketMap from "./pages/map/MarketMap";
import Guide from "./pages/guide/Guide";
import Story from "./components/Story";
import Budget from "./pages/budget/Budget";
import Sijang from "./components/Sijang";
import Loading from "./pages/loading/Loading";
import Camera from "./pages/receipt/Camera";
import SuccessReceipt from "./pages/receipt/SuccessReceipt";


const Router = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/guide" element={<Guide />} />
      <Route path="/budget" element={<Budget />} />
      <Route path="/story" element={<Story />} />
      <Route path="/map" element={<MarketMap />} />
      <Route path="/sijang" element={<Sijang />} />
      <Route path="/loading" element={<Loading />} />
      <Route path="/camera" element={<Camera />} />
      <Route path="/checksuccess" element={<SuccessReceipt />} />
    </Routes>
  </BrowserRouter>
);

export default Router;
