// src/pages/reward/Reward.jsx
import React, { useEffect, useRef, useState } from "react";
import "./Reward.css";
import "../../components/QRHeader";
import QRHeader from "../../components/QRHeader";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* axios 기본 */
const BASE = (import.meta.env.VITE_BACKEND_DOMAIN_KEY || "").replace(
  /\/+$/,
  ""
);
axios.defaults.baseURL = BASE;
axios.defaults.withCredentials = true;

const USER_KEY = import.meta.env.VITE_USER_KEY || "";

/* QR 소스 추출 */
function pickQrSrc(data) {
  const raw =
    data?.data?.qrBase64 ??
    data?.data?.qr ??
    data?.qrBase64 ??
    data?.qr ??
    data?.qrcode ??
    null;
  if (!raw) return null;
  if (typeof raw === "string" && raw.startsWith("data:image")) return raw;
  if (typeof raw === "string") return `data:image/png;base64,${raw}`;
  return null;
}
function fmt(isoLike) {
  if (!isoLike) return "-";
  const d = new Date(isoLike);
  if (isNaN(d.getTime())) return String(isoLike);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(
    d.getHours()
  )}:${p(d.getMinutes())}`;
}

function Reward() {
  const navigate = useNavigate();
  const handleStart = () => navigate("/budget");

  // 목데이터
  const fallback = {
    issuedAt: "2025.08.25 13:45",
    marketName: "역곡남부시장",
    usedAmount: 30000,
    rewardRate: "10%",
    rewardAmount: 3000,
    rewardMethod: "현장지급",
    qrUrl: "/assets/mock-qr.png",
  };

  const [data, setData] = useState(fallback);

  // StrictMode에서 useEffect가 두 번 도는 걸 차단
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    let mounted = true;
    (async () => {
      try {
        // ★ GET + camelCase userKey
        const res = await axios.get("/reward", {
          params: { userKey: USER_KEY },
          headers: { Accept: "application/json" },
        });

        if (!mounted) return;

        const body = res?.data ?? {};
        const qrUrl = pickQrSrc(body) ?? fallback.qrUrl;

        const issuedAtRaw =
          body?.data?.issuedAt ??
          body?.issuedAt ??
          body?.data?.issueTime ??
          body?.issueTime ??
          new Date();

        const usedAmountNum =
          Number(
            body?.data?.usedAmount ?? body?.usedAmount ?? fallback.usedAmount
          ) || 0;

        const percentNum =
          Number(
            body?.data?.percent ??
              body?.percent ??
              parseInt(fallback.rewardRate)
          ) || 10;

        const rewardAmountNum =
          Number(body?.data?.rewardAmount ?? body?.rewardAmount) ||
          Math.floor(usedAmountNum * (percentNum / 100));

        const marketNameVal =
          body?.data?.marketName ?? body?.marketName ?? fallback.marketName;

        const rewardMethodVal =
          body?.data?.payout ?? body?.payout ?? fallback.rewardMethod;

        setData({
          issuedAt: fmt(issuedAtRaw),
          marketName: marketNameVal,
          usedAmount: usedAmountNum,
          rewardRate: `${percentNum}%`,
          rewardAmount: rewardAmountNum,
          rewardMethod: rewardMethodVal,
          qrUrl,
        });
      } catch (e) {
        console.error("[Reward] /reward 실패:", e?.response?.data || e);
        if (!mounted) return;
        setData((d) => ({ ...d })); // 목데이터 유지
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="reward-page">
      <QRHeader />
      <hr className="divider" />
      <h2>
        축하합니다
        <br /> 리워드 지급이 완료되었습니다
      </h2>

      <img src={data.qrUrl} alt="리워드 QR" className="RewardQR" />

      <div className="reward-info">
        <p className="reward-give">[리워드 지급 내역]</p>
        <p>발급일시 : {data.issuedAt}</p>
        <p>미션 진행시장 : {data.marketName}</p>
        <p>사용금액 : {Number(data.usedAmount).toLocaleString()}원</p>
        <p>리워드 지급 기준 : 결제 금액의 {data.rewardRate}</p>
        <p>지급 리워드 : {Number(data.rewardAmount).toLocaleString()}원</p>
        <p>지급방법 : {data.rewardMethod}</p>
      </div>

      <button className="reward-btn" onClick={handleStart}>
        확인
      </button>
    </div>
  );
}

export default Reward;
