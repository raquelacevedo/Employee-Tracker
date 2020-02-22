const inquirer = require("inquirer");

const menu = [
  {
    type: "list",
    name: "mainMenu",
    message: "What would you like to do?",
    choices: ["Manage departments", 
              "Manage roles", 
              "Manage employees", 
              "Quit program" ]
  }
];

module.exports = () => {
  // console.log("in questMenu",menu);
  return inquirer.prompt(menu);
};