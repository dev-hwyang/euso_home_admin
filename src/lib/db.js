import mariadb from "mariadb";
const pool = mariadb.createPool({
  // host: process.env.host,
  // user: process.env.user,  // MariaDB 유저명
  // password: process.env.password,  // MariaDB 비밀번호
  // database: process.env.database,
  host: "192.168.2.37",
  user: "admin", // MariaDB 유저명
  password: "1234", // MariaDB 비밀번호
  database: "euso_home",
});

export async function query(sql, params) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(sql, params);
    return rows;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

export default pool;

// ALTER TABLE `HOME_USER` ADD CONSTRAINT `PK_HOME_USER` PRIMARY KEY (
// 	`USER_NO`
// );

// ALTER TABLE `HOME_BOARD` ADD CONSTRAINT `PK_HOME_BOARD` PRIMARY KEY (
// 	`BBSCTT_NO`
// );

// ALTER TABLE euso_home.COMMON_CODE MODIFY COLUMN CD_NO int(10) auto_increment NOT NULL COMMENT 'AUTO_INCREMENT';

// ALTER TABLE euso_home.HOME_ATTACH MODIFY COLUMN FILE_NO int(10) auto_increment NOT NULL COMMENT 'AUTO_INCREMENT';

// ALTER TABLE euso_home.HOME_BOARD MODIFY COLUMN BBSCTT_NO int(10) auto_increment NOT NULL COMMENT 'AUTO_INCREMENT';

// ALTER TABLE euso_home.HOME_COOPERATION MODIFY COLUMN CCPY_NO int(10) auto_increment NOT NULL COMMENT 'AUTO_INCREMENT';

// ALTER TABLE euso_home.HOME_HISTORY MODIFY COLUMN HIST_NO int(10) auto_increment NOT NULL COMMENT 'AUTO_INCREMENT';

// ALTER TABLE euso_home.HOME_USER MODIFY COLUMN USER_NO int(10) auto_increment NOT NULL COMMENT 'AUTO_INCREMENT';
