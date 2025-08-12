import { BrowserRouter, Routes, Route } from "react-router-dom";
import Onboarding from "./pages/Onboarding";
import MarketMap from "./pages/map/MarketMap";
import Guide from "./pages/guide/Guide";
import Story from "./components/Story";
import Budget from "./pages/budget/Budget";
import Sijang from "./components/Sijang";
import Loading from "./pages/loading/Loading";

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
    </Routes>
  </BrowserRouter>
);

export default Router;
