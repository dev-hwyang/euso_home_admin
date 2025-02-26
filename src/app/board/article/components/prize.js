"use client";

import React, { useState, useEffect } from "react";

const Prize = () => {
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [bbscttSj, setBbscttSj] = useState("");
  const [selectedItem, setSelectedItem] = useState(null); // 선택된 데이터 (수정 모드)

  const fetchData = async () => {
    try {
      const response = await fetch("/api/about?table=HOME_BOARD&CL_CD=P001");
      const data = await response.json();
      setList(data);
    } catch (error) {
      // console.error("데이터 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bbscttSj) {
      alert("수상내역을 입력해주세요!");
      return;
    }

    const requestBody = {
      CL_CD: "P001",
      table: "HOME_BOARD",
      bbscttSj,
    };

    let response;
    if (selectedItem) {
      requestBody.BBSCTT_NO = selectedItem.BBSCTT_NO; // 기본키 추가
      response = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
    } else {
      response = await fetch("/api/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
    }

    const result = await response.json();
    if (response.ok) {
      alert(selectedItem ? "수정 완료!" : "등록 완료!");
      setShowModal(false);
      setBbscttSj("");
      setSelectedItem(null); // 선택 데이터 초기화
      fetchData(); // 데이터 새로고침
    } else {
      alert(`처리 실패: ${result.error}`);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(
        `/api/about?table=HOME_BOARD&BBSCTT_NO=${item.BBSCTT_NO}`,
        {
          method: "DELETE",
        }
      );
      const result = await response.json();
      if (response.ok) {
        alert("삭제 완료!");
        fetchData(); // 데이터 새로고침
      } else {
        alert(`삭제 실패: ${result.error}`);
      }
    } catch (error) {
      // console.error("삭제 실패:", error);
    }
  };

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setBbscttSj(item.BBSCTT_SJ || "");
    setShowModal(true);
  };

  return (
    <>
      <div className="main">
        <div className="title">수상 목록</div>
        {list === null ? (
          <p>로딩 중...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <td>번호</td>
                <td>수상내역</td>
                <td>등록일</td>
                <td>삭제</td>
              </tr>
            </thead>
            <tbody>
              {list.map((item, index) => (
                <tr key={index} style={{ cursor: "pointer" }}>
                  <td onClick={() => handleRowClick(item)}>
                    {item?.BBSCTT_NO}
                  </td>
                  <td onClick={() => handleRowClick(item)}>
                    {item?.BBSCTT_SJ}
                  </td>
                  <td onClick={() => handleRowClick(item)}>
                    {item?.REGIST_DT
                      ? (() => {
                          const date = new Date(item.REGIST_DT);
                          date.setHours(date.getHours() + 9);
                          const formattedDate = date
                            .toISOString()
                            .split("T")[0];
                          return formattedDate;
                        })()
                      : ""}
                  </td>
                  <td>
                    <button type="button" onClick={() => handleDelete(item)}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button
          className="instBtn"
          onClick={() => {
            setSelectedItem(null);
            setBbscttSj("");
            setShowModal(true);
          }}
        >
          등록
        </button>
      </div>

      {/* 등록/수정 팝업 */}
      {showModal && (
        <div className="modal">
          <div style={{ font: "30px bold" }}>
            {selectedItem ? "수정하기" : "등록하기"}
          </div>
          <form onSubmit={handleSubmit}>
            <div>
              <label>수상내역　:　</label>
              <input
                type="text"
                value={bbscttSj}
                onChange={(e) => setBbscttSj(e.target.value)}
                required
              />
            </div>
            <div>
              <button type="submit">{selectedItem ? "수정" : "등록"}</button>
              <button type="button" onClick={() => setShowModal(false)}>
                취소
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Prize;
