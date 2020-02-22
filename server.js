const inquirer = require("inquirer");

const questMenu = require("./lib/menu");
const department = require("./lib/department");
const roles = require("./lib/roles");
const employee= require("./lib/employee");

const db = require("./db/db");

const test = true;

async function init() {
  if (test) console.log("started init:");
  // will need to wrap this in a loop for n-employees
  try {
    questMenu().then( function(ansOptions){

      // if (test) { console.log("answers:",ansOptions); }

      switch (ansOptions.mainMenu) {
        case 'Manage departments':
          department.genDept();
          break;
        case 'Manage roles':
          roles.genRole();
          break;
        case 'Manage employees':
          employee.genEmpl();
          break;
        default:
          console.log("Thank you for using Employee Management Tool.");
          db.close();
          break;
      }
    });
  } catch (error) {
    console.log(`There was a problem ${error}`);
  }
}

init();

exports.init = init;