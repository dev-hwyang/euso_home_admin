"use client";

import React, { useState } from "react";
import His from "./components/his";
import Biz from "./components/biz";

const Article = () => {
  const [activeTab, setActiveTab] = useState("his"); // 새로고침 시 제일 첫번째 탭으로

  return (
    <>
      <div className="tabs">
        <button
          className={activeTab === "his" ? "active" : ""}
          onClick={() => setActiveTab("his")}
        >
          일반
        </button>
        <button
          className={activeTab === "biz" ? "active" : ""}
          onClick={() => setActiveTab("biz")}
        >
          사업
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "his" && <His />}
        {activeTab === "biz" && <Biz />}
      </div>

      <br />
      <a href="/">
        <button className="gradient_button">메인화면으로</button>
      </a>
    </>
  );
};

export default Article;
