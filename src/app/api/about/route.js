import { query } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const CL_CD = searchParams.get("CL_CD");
  const table = searchParams.get("table");

  // 허용된 테이블 목록
  const allowedTables = [
    "COMMON_CODE",
    "HOME_ATTACH",
    "HOME_BOARD",
    "HOME_COOPERATION",
    "HOME_HISTORY",
    "HOME_USER",
  ];

  if (!table || !allowedTables.includes(table)) {
    return new Response(
      JSON.stringify({ error: "Invalid or missing table name" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  try {
    // 테이블의 primary key 컬럼을 찾기 위한 쿼리
    const getPrimaryKeyQuery = `SELECT COLUMN_NAME
                                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                                WHERE TABLE_NAME = ? AND CONSTRAINT_NAME = 'PRIMARY'`;

    // 해당 테이블의 primary key 컬럼명 가져오기
    const [primaryKeyResult] = await query(getPrimaryKeyQuery, [table]);
    const primaryKeyColumn = primaryKeyResult
      ? primaryKeyResult.COLUMN_NAME
      : null;

    // primary key 컬럼명이 있으면 정렬 쿼리 추가
    const baseSQL = `SELECT * FROM ${table}`;
    const whereSQL = CL_CD ? `${baseSQL} WHERE CL_CD = ?` : baseSQL;
    const sql = primaryKeyColumn
      ? `${whereSQL} ORDER BY ${primaryKeyColumn} DESC`
      : whereSQL;

    const params = CL_CD ? [CL_CD] : [];

    const results = await query(sql, params);
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Database query failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request) {
  try {
    const {
      table,
      CL_CD,
      bbscttSj,
      newsPblcateDt,
      newsUrl,
      patentNo,
      year,
      // sortNo,
      cntnts,
    } = await request.json();

    if (!CL_CD || !table) {
      return new Response(
        JSON.stringify({ error: "필수 항목이 누락되었습니다" }),
        { status: 400 }
      );
    }

    let sql = "";
    let values = [];

    if (CL_CD === "P001") {
      // 수상
      sql = `INSERT INTO ${table} (CL_CD, BBSCTT_SJ, REGIST_DT) VALUES (?, ?, NOW())`;
      values = [CL_CD, bbscttSj];
    } else if (CL_CD === "P002") {
      // 특허
      sql = `INSERT INTO ${table} (CL_CD, BBSCTT_SJ, REGIST_DT, PATENT_NO) VALUES (?, ?, NOW(), ?)`;
      values = [CL_CD, bbscttSj, patentNo];
    } else if (CL_CD === "P003" || CL_CD === "P004") {
      // 저작권, 기술임치
      sql = `INSERT INTO ${table} (CL_CD, BBSCTT_SJ, , REGIST_DT, YEAR) VALUES (?, ?, NOW(), ?)`;
      values = [CL_CD, bbscttSj, year];
      // } else if (CL_CD === "P005") {
      //   // 인증서
      //   sql = `INSERT INTO ${table} (CL_CD, BBSCTT_SJ, REGIST_DT, SORT_NO) VALUES (?, ?, NOW(), ?)`;
      //   values = [CL_CD, bbscttSj, sortNo];
    } else if (CL_CD === "P006") {
      // 언론보도 (뉴스)
      sql = `INSERT INTO ${table} (CL_CD, BBSCTT_SJ, REGIST_DT, NEWS_PBLCATE_DT, NEWS_URL) VALUES (?, ?, NOW(), ?, ?)`;
      values = [CL_CD, bbscttSj, newsPblcateDt, newsUrl];
    } else if (CL_CD === "H001") {
      // 회사 연혁
      sql = `INSERT INTO ${table} (CL_CD, YEAR, CNTNTS) VALUES (?, ?, ?)`;
      values = [CL_CD, year, cntnts];
    } else if (CL_CD === "H002") {
      // 사업 연혁
      sql = `INSERT INTO ${table} (CL_CD, YEAR, CNTNTS) VALUES (?, ?, ?)`;
      values = [CL_CD, year, cntnts];
    } else {
      return Response.json({ error: "지원되지 않는 CL_CD" }, { status: 400 });
    }

    const result = await query(sql, values);
    return Response.json({
      message: "데이터가 성공적으로 등록되었습니다.",
      insertId: Number(result.insertId),
    });
  } catch (error) {
    // console.log(error);
    return Response.json({ error: "데이터 삽입 실패" }, { status: 500 });
  }
}
export async function PUT(request) {
  try {
    const {
      table,
      BBSCTT_NO,
      HIST_NO,
      CL_CD,
      bbscttSj,
      newsPblcateDt,
      newsUrl,
      patentNo,
      year,
      // sortNo,
      cntnts,
    } = await request.json();

    if (!CL_CD || !table) {
      return new Response(
        JSON.stringify({ error: "필수 항목이 누락되었습니다" }),
        { status: 400 }
      );
    }

    let sql = "";
    let values = [];

    if (CL_CD === "P001") {
      // 수상
      sql = `UPDATE ${table} SET BBSCTT_SJ = ? WHERE BBSCTT_NO = ?`;
      values = [bbscttSj, BBSCTT_NO];
    } else if (CL_CD === "P002") {
      // 특허
      sql = `UPDATE ${table} SET BBSCTT_SJ = ?, PATENT_NO = ? WHERE BBSCTT_NO = ?`;
      values = [bbscttSj, patentNo, BBSCTT_NO];
    } else if (CL_CD === "P003" || CL_CD === "P004") {
      // 저작권, 기술임치
      sql = `UPDATE ${table} SET BBSCTT_SJ = ?, YEAR = ? WHERE BBSCTT_NO = ?`;
      values = [bbscttSj, year, BBSCTT_NO];
      // } else if (CL_CD === "P005") {
      //   // 인증서
      //   sql = `UPDATE ${table} SET BBSCTT_SJ = ?, SORT_NO = ? WHERE BBSCTT_NO = ?`;
      //   values = [bbscttSj, sortNo, BBSCTT_NO];
    } else if (CL_CD === "P006") {
      // 언론보도 (뉴스)
      sql = `UPDATE ${table} SET BBSCTT_SJ = ?, NEWS_PBLCATE_DT = ?, NEWS_URL = ? WHERE BBSCTT_NO = ?`;
      values = [bbscttSj, newsPblcateDt, newsUrl, BBSCTT_NO];
    } else if (CL_CD === "H001" || CL_CD === "H002") {
      // 회사 연혁, 사업 연혁
      sql = `UPDATE ${table} SET CNTNTS = ?, YEAR= ? WHERE HIST_NO = ?`;
      values = [cntnts, year, HIST_NO];
    } else {
      return new Response(JSON.stringify({ error: "지원되지 않는 CL_CD" }), {
        status: 400,
      });
    }

    await query(sql, values);
    return new Response(
      JSON.stringify({ message: "데이터가 성공적으로 수정되었습니다." }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "데이터 수정 실패" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table");
    const BBSCTT_NO = searchParams.get("BBSCTT_NO");
    const HIST_NO = searchParams.get("HIST_NO");

    // 필수 항목 체크
    if (!table || (!BBSCTT_NO && !HIST_NO)) {
      return new Response(
        JSON.stringify({ error: "필수 항목이 누락되었습니다" }),
        { status: 400 }
      );
    }

    let sql = "";
    let values = [];

    if (table === "HOME_BOARD" && BBSCTT_NO) {
      // home_board 테이블에서 BBSCTT_NO로 삭제
      sql = `DELETE FROM ${table} WHERE BBSCTT_NO = ?`;
      values = [BBSCTT_NO];
    } else if (table === "HOME_HISTORY" && HIST_NO) {
      // home_history 테이블에서 HIST_NO로 삭제
      sql = `DELETE FROM ${table} WHERE HIST_NO = ?`;
      values = [HIST_NO];
    } else {
      return new Response(
        JSON.stringify({ error: "지원되지 않는 테이블 또는 항목입니다" }),
        { status: 400 }
      );
    }

    await query(sql, values);

    return new Response(
      JSON.stringify({ message: "데이터가 성공적으로 삭제되었습니다." }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "데이터 삭제 실패", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
