"use client";

import React, { useState } from "react";
import Prize from "./components/prize";
import Patent from "./components/patent";
import Copyright from "./components/copyright";
import TechnologyEscrow from "./components/technologyEscrow";
import Certification from "./components/certification";
import News from "./components/news";

const Article = () => {
  const [activeTab, setActiveTab] = useState("prize"); // 새로고침 시 제일 첫번째 탭으로

  return (
    <>
      <div className="tabs">
        <button
          className={activeTab === "prize" ? "active" : "수상"}
          onClick={() => setActiveTab("prize")}
        >
          수상
        </button>
        <button
          className={activeTab === "patent" ? "active" : "특허"}
          onClick={() => setActiveTab("patent")}
        >
          특허
        </button>
        <button
          className={activeTab === "copyright" ? "active" : "저작권"}
          onClick={() => setActiveTab("copyright")}
        >
          저작권
        </button>
        <button
          className={activeTab === "technologyEscrow" ? "active" : "기술임치"}
          onClick={() => setActiveTab("technologyEscrow")}
        >
          기술임치
        </button>
        <button
          className={activeTab === "certification" ? "active" : "인증서"}
          onClick={() => setActiveTab("certification")}
        >
          인증서
        </button>
        <button
          className={activeTab === "news" ? "active" : "뉴스"}
          onClick={() => setActiveTab("news")}
        >
          뉴스
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "prize" && <Prize />}
        {activeTab === "patent" && <Patent />}
        {activeTab === "copyright" && <Copyright />}
        {activeTab === "technologyEscrow" && <TechnologyEscrow />}
        {activeTab === "certification" && <Certification />}
        {activeTab === "news" && <News />}
      </div>

      <br />
      <a href="/">
        <button className="gradient_button">메인화면으로</button>
      </a>
    </>
  );
};

export default Article;
