// src/pages/reward/Reward.jsx
import React, { useEffect, useRef, useState } from "react";
import "./Reward.css";
import QRHeader from "../../components/QRHeader";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* ===== axios 인스턴스 (충돌 방지) ===== */
const BASE = (import.meta.env.VITE_BACKEND_DOMAIN_KEY || "").replace(
  /\/+$/,
  ""
);
const api = axios.create({
  baseURL: BASE,
  withCredentials: true, // 쿠키 포함
});

/* ===== helpers ===== */
function pickQrSrc(payload) {
  const raw =
    payload?.data?.qrBase64 ??
    payload?.data?.qr ??
    payload?.qrBase64 ??
    payload?.qr ??
    payload?.qrcode ??
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

const FALLBACK = {
  issuedAt: "2025.08.25 13:45",
  marketName: "역곡남부시장",
  usedAmount: 30000,
  rewardRate: "10%",
  rewardAmount: 3000,
  rewardMethod: "현장지급",
  qrUrl: "/assets/mock-qr.png",
};

/* ===== 세션 보장: /home 호출로 JSESSIONID 받기 ===== */
async function ensureSession() {
  if (sessionStorage.getItem("SESSION_READY")) return;
  const res = await api.post("/home", {
    market: "부천역곡남부시장",
    budget: 10000,
    storyId: 1,
  });
  console.log("[Reward] /home OK:", res?.status);
  sessionStorage.setItem("SESSION_READY", "1");
}

export default function Reward() {
  const navigate = useNavigate();
  const [data, setData] = useState(FALLBACK);
  const didFetch = useRef(false); // StrictMode 중복 방지

  const handleStart = () => navigate("/budget");

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    let alive = true;

    const mapAndSet = (payload) => {
      const body = payload ?? {};
      const src = body?.data ?? body ?? {};

      const issuedAtRaw = src.issuedAt ?? src.issueTime ?? new Date();
      const usedAmountNum = Number(src.usedAmount ?? FALLBACK.usedAmount) || 0;

      const percentNum = (() => {
        const p = src.percent ?? src.rewardRate ?? "10";
        const n = Number(String(p).replace("%", ""));
        return Number.isFinite(n) ? n : 10;
      })();

      const rewardAmountNum =
        Number(src.rewardAmount) ||
        Math.floor((usedAmountNum * percentNum) / 100);

      setData({
        issuedAt: fmt(issuedAtRaw),
        marketName: src.marketName ?? FALLBACK.marketName,
        usedAmount: usedAmountNum,
        rewardRate: `${percentNum}%`,
        rewardAmount: rewardAmountNum,
        rewardMethod: src.payout ?? src.rewardMethod ?? FALLBACK.rewardMethod,
        qrUrl: pickQrSrc(body) ?? FALLBACK.qrUrl,
      });
    };

    const fetchReward = async () => {
      const res = await api.get("/reward", {
        headers: { Accept: "application/json" },
      });
      if (!alive) return;
      mapAndSet(res?.data);
    };

    (async () => {
      try {
        await ensureSession(); // 1) 세션 생성
        await fetchReward(); // 2) 리워드 조회
      } catch (e) {
        // 401이면 세션 재확보 → 한 번 더 시도
        if (e?.response?.status === 401) {
          try {
            sessionStorage.removeItem("SESSION_READY");
            await ensureSession();
            await fetchReward();
          } catch (ee) {
            // (선택) 디버그용 헤더 강제 주입 토글
            const DEV_ALLOW_HEADER =
              import.meta.env.VITE_DEV_ALLOW_HEADER === "1";
            const DEV_USER_KEY =
              localStorage.getItem("userKey") ||
              import.meta.env.VITE_USER_KEY ||
              "";
            if (DEV_ALLOW_HEADER && DEV_USER_KEY) {
              try {
                const r2 = await api.get("/reward", {
                  headers: {
                    Accept: "application/json",
                    // 서버가 헤더를 지원할 때만 효과 있음 (백이 세션만 보면 무시됨)
                    userKey: DEV_USER_KEY,
                  },
                });
                if (alive) mapAndSet(r2?.data);
                return;
              } catch (eee) {
                console.error(
                  "[Reward] 헤더강제 재시도 실패:",
                  eee?.response?.data || eee
                );
              }
            }
            console.error("[Reward] 최종 실패:", ee?.response?.data || ee);
          }
        } else {
          console.error("[Reward] 조회 실패:", e?.response?.data || e);
        }
        // 실패 시에는 FALLBACK 유지
      }
    })();

    return () => {
      alive = false;
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
