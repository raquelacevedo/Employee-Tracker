const mysql = require("mysql");
const util = require("util");
//account number:
// 385421924
//1/10/2016

var PSWD = "testtest";
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: PSWD,
  database: "emplmang"
});

function makeDb() {
  // console.log("here");
  return {
    query(sql, args) {
      return util.promisify( connection.query)
        .call ( connection, sql, args);
    },
    close() {
      console.log("closing");
      return util.promisify( connection.end ).call(connection);
    }
  };
};

module.exports =  makeDb();

/*
async function simpleSelect(tab) {
  console.log("view all departments",tab);
  const query = `SELECT name AS department from ${tab};`;
  console.log(query);
  // connection.query('SELECT name AS department FROM ?', function(err,results) {
  const stuff = await connection.query(query, function(err,results) {
    if (err) throw err;
    console.log("result",results);
    return results; 
  });
  return stuff;
};
async function init() {
 const res = await simpleSelect("department");
 console.log("res",res);
}
init();
*/