const mysql = require('mysql');
const dbConfig = require('./db-config');

function listTable(tab) {
  return new Promise( async function (resolve,reject) {
    let conn;

    try{
      conn = await mysql.createConnection(dbConfig);
      console.log("connected to db");

      conn.connect();
      let result = await conn.query(
          `select name from department`
        );
      console.log("query executed with results",result);

      resolve(result);
    } catch (err) {
      console.log('error1', err);
      reject(err);
    } finally {
      // if pool work close
      if (conn) {
        try {
          await conn.end();
          console.log("conneciton closed");
        } catch (err) {
          console.log('error closing connection', err);
        }
      }
    }
  });
}

module.exports.listTable = listTable;