const mysql = require('mysql');
const dbConfig = require('./db-config');
const department = require('./testDept');

async function init () {
  try {
    // await mysql.createPool(dbConfig);

    let dept = await department.listTable("department");
    console.log("my results",dept);
  } catch (err) {
    console.log("Error in test init",err);
  }
}

init();