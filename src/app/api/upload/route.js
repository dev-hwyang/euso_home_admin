import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const BBSCTT_NO = searchParams.get("BBSCTT_NO");

  // 허용된 테이블 목록
  // const allowedTables = ["HOME_ATTACH"];

  // if (!table || !allowedTables.includes(table)) {
  //   return NextResponse.json(
  //     { error: "Invalid or missing table name" },
  //     { status: 400 }
  //   );
  // }

  try {
    // HOME_BOARD와 HOME_ATTACH 조인
    const sql = `
      SELECT * 
      FROM HOME_BOARD hb
      JOIN HOME_ATTACH ha ON hb.BBSCTT_NO = ha.REFER_NO
      WHERE hb.BBSCTT_NO = ?
    `;

    const results = await query(sql, [BBSCTT_NO]);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Database query failed" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { table, CL_CD, bbscttSj, file, fileName } = await req.json();

    if (!CL_CD || !table) {
      return NextResponse.json(
        { error: "필수 항목이 누락되었습니다" },
        { status: 400 }
      );
    }

    if (!file || !fileName) {
      return NextResponse.json(
        { error: "이미지 또는 파일명이 누락되었습니다." },
        { status: 400 }
      );
    }

    // 업로드 디렉토리 설정
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // 파일 저장 (Base64 디코딩)
    const newFileName = `${Date.now()}_${fileName}`;
    const filePath = path.join(uploadDir, newFileName);
    const buffer = Buffer.from(file, "base64");
    await fs.writeFile(filePath, buffer);

    let insertBoardSql = "";
    let boardValues = [];

    if (CL_CD === "P005") {
      // `HOME_BOARD`에 데이터 삽입
      insertBoardSql = `INSERT INTO ${table} (CL_CD, BBSCTT_SJ, REGIST_DT) VALUES (?, ?, NOW())`;
      boardValues = [CL_CD, bbscttSj];

      const boardResult = await query(insertBoardSql, boardValues);
      const latestUNQ_ID = boardResult.insertId; // 삽입된 UNQ_ID 가져오기

      // `HOME_ATTACH`에 파일 정보 삽입
      const insertFileSql = `
        INSERT INTO HOME_ATTACH 
        (GROUP_CD, REFER_NO, FILE_NAME, ORIGIN_FILE_NM, FILE_PATH, USE_YN) 
        VALUES (?, ?, ?, ?, ?, 'Y')
      `;
      const fileValues = [
        CL_CD,
        latestUNQ_ID,
        newFileName,
        fileName,
        `/uploads/${newFileName}`,
      ];

      await query(insertFileSql, fileValues);
    } else {
      return NextResponse.json(
        { error: "지원되지 않는 CL_CD" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "데이터가 성공적으로 등록되었습니다.",
      filePath: `/uploads/${newFileName}`, // 상대 경로 반환
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "파일 업로드 실패" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { table, BBSCTT_NO, bbscttSj, file, fileName } = await req.json();

    if (!BBSCTT_NO || !bbscttSj) {
      return NextResponse.json(
        { error: "필수 항목이 누락되었습니다." },
        { status: 400 }
      );
    }

    // 게시글 수정 (파일이 포함되지 않았으면 bbscttSj만 수정)
    const updateBoardSql = `UPDATE ${table} SET BBSCTT_SJ = ? WHERE BBSCTT_NO = ?`;
    await query(updateBoardSql, [bbscttSj, BBSCTT_NO]);

    return NextResponse.json({
      message: "데이터가 성공적으로 수정되었습니다.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "파일 수정 실패" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const BBSCTT_NO = searchParams.get("BBSCTT_NO");
    const table = searchParams.get("table");

    if (!BBSCTT_NO || !table) {
      return NextResponse.json(
        { error: "필수 항목이 누락되었습니다." },
        { status: 400 }
      );
    }

    // 파일 정보 조회
    const selectFileSql = `SELECT FILE_PATH FROM HOME_ATTACH WHERE REFER_NO = ?`;
    const fileResult = await query(selectFileSql, [BBSCTT_NO]);

    if (fileResult.length > 0) {
      const filePath = path.join(
        process.cwd(),
        "public",
        fileResult[0].FILE_PATH
      );
      await fs.unlink(filePath).catch(() => {}); // 파일 삭제 (에러 무시)
    }

    // `HOME_ATTACH`에서 삭제
    const deleteFileSql = `UPDATE HOME_ATTACH SET USE_YN = ? WHERE REFER_NO = ?`;
    await query(deleteFileSql, ["N", BBSCTT_NO]);

    // `HOME_BOARD`에서 삭제
    const deleteBoardSql = `DELETE FROM ${table} WHERE BBSCTT_NO = ?`;
    await query(deleteBoardSql, [BBSCTT_NO]);

    return NextResponse.json({
      message: "데이터가 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "파일 삭제 실패" }, { status: 500 });
  }
}
