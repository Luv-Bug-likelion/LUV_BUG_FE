import React from "react";
import { useNavigate } from "react-router-dom";
import "./QRHeader.css";

function QRHeader() {
  const navigate = useNavigate();

  return (
    <div className="qr-header">
      <button className="back-btn" onClick={() => navigate(-1)}>
        &lt;
      </button>
      <span className="title">QR코드 화면</span>
    </div>
  );
}

export default QRHeader;
