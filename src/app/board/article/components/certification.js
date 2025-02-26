"use client";

import React, { useState, useEffect } from "react";

const Certification = () => {
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [bbscttSj, setBbscttSj] = useState("");
  const [file, setFile] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // 선택된 데이터 (수정 모드)

  const fetchData = async () => {
    try {
      const response = await fetch("/api/about?table=HOME_BOARD&CL_CD=P005");
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
      alert("인증서명을 입력해주세요!");
      return;
    }

    const requestBody = {
      CL_CD: "P005",
      table: "HOME_BOARD",
      bbscttSj,
    };

    // 파일이 있을 때만 처리
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result.split(",")[1]; // Base64 데이터만 추출
        requestBody.file = base64Image;
        requestBody.fileName = file.name;

        let response;
        if (selectedItem) {
          requestBody.BBSCTT_NO = selectedItem.BBSCTT_NO; // 기본키 추가
          response = await fetch("/api/upload", {
            method: "PUT", // 수정
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });
        } else {
          response = await fetch("/api/upload", {
            method: "POST", // 등록
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
      reader.readAsDataURL(file);
    } else {
      alert(`처리 실패..`);
    }
  };
  const editSubmit = async (e) => {
    e.preventDefault();

    if (!bbscttSj) {
      alert("인증서명을 입력해주세요!");
      return;
    }

    const requestBody = {
      CL_CD: "P005",
      table: "HOME_BOARD",
      bbscttSj,
    };

    let response;
    if (selectedItem) {
      requestBody.BBSCTT_NO = selectedItem.BBSCTT_NO; // 기본키 추가
      response = await fetch("/api/upload", {
        method: "PUT", // 수정
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      console.log(JSON.stringify(requestBody));
    } else {
      alert("왜 여기로와 수정실패..");
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
        `/api/upload?table=HOME_BOARD&BBSCTT_NO=${item.BBSCTT_NO}`,
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

  const handleRowClick = async (item) => {
    try {
      const response = await fetch(`/api/upload?BBSCTT_NO=${item.BBSCTT_NO}`);
      const data = await response.json();
      if (data.length > 0) {
        setSelectedItem(item);
        setBbscttSj(data[0]?.BBSCTT_SJ || ""); // 제목 설정
        setFile(data[0]?.ORIGIN_FILE_NM || ""); // 파일명 설정
      }
    } catch (error) {
      // console.error("데이터 불러오기 실패:", error);
    }
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && !selectedFile.type.startsWith("image/")) {
      alert("이미지 파일만 선택할 수 있습니다.");
      setFile(null); // 선택된 파일을 초기화
      document.getElementById("file").value = "";
    } else {
      setFile(selectedFile);
    }
  };

  return (
    <>
      <div className="main">
        <div className="title">인증서 목록</div>
        {list === null ? (
          <p>로딩 중...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <td>번호</td>
                <td>인증서명</td>
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
          <form onSubmit={selectedItem ? editSubmit : handleSubmit}>
            <div>
              <label>인증서명　:　</label>
              <input
                type="text"
                value={bbscttSj}
                onChange={(e) => setBbscttSj(e.target.value)}
                required
              />
            </div>
            <div>
              {!selectedItem || !file ? (
                // selectedItem이 없거나 file이 없으면 파일 선택 input 표시
                <>
                  <label>첨부파일　:　</label>
                  <input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    required
                    accept="image/*"
                  />
                </>
              ) : (
                // selectedItem이 있고 file이 있을 때는 파일명 표시
                <p id="file">첨부파일　:　{file}</p>
              )}
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

export default Certification;
