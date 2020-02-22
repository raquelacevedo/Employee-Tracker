const inquirer = require("inquirer");
const main = require("../server");
const db = require("../db/db");

require("console.table");

const questions = {
  genDept: [
    {
      type: "list",
      name: "deptChoice",
      message: "Options for department management?",
      choices: ["View all departments", 
                "Add department", 
                "View total utilized budget of department", 
                "Remove department",
                "Return to main menu" ]
    }
  ],
  selectDept: [
    {
      type: "list",
      name: "deptId",
      message: "Select department:",
      // choices will be dynamically set from existing departments
    },
  ],
  selectEmpl: [
    {
      type: "list",
      name: "emplId",
      message: "Select department manager:",
      // choice will be dynamically set from existing employees
    }
  ],
  confirmDelDept: [
    {
      type: "confirm",
      name: "delDept",
      message: "Are you sure you want to delete this department and elimiate\nassociate roles and fire all the lazy-ass employees?",
      default: true
    },
  ],
  addDept: [
    {
      type: "input",
      name: "newDept",
      message: "Enter name of department you would like to add:",
    },
  ],
};

// function to display a table to the users of exisiting departments
async function viewDepartments() {
  // const db = makeDb();
  let values = [];

  try {
    const results = await getDeptList();

    results.forEach(res => { 
      values.push([res.department]); 
    });
  } catch (err) {
    console.log("error with viewUtiliedBudget",err);
  }
  console.log(" ");
  console.table(['Department'],values);
  genDept();
};


// function to display a table to the users of exisiting department utilized budgets
async function viewUtilizedBudget() {
  let values = [];
  try {
    const sql = "select d.name, sum(r.salary) as UB from employee e join role r on e.role_id = r.id join department d on d.id = r.dept_id group by d.name"
    const results = await db.query(sql);

    results.forEach(res => { 
      values.push([res.name,res.UB]); 
    });

  } catch (err) {
    console.log("error with viewUtiliedBudget",err);
  }
  console.log(" ");
  console.table(['Department','Utilized Budget'],values);
  genDept();
};


async function addDepartment() {
  const nd = await inquirer.prompt(questions.addDept);

  try {
    const sql = `INSERT INTO department (name) VALUES (?)`;
    await db.query(sql,nd.newDept);
    console.log(`\nSuccessfully created a new department\n`);
  } catch (err) {
    console.log("error with insert",err);
  }

  genDept();
};

async function selectDept() {
  // db read to return department list
  let formatForInq = true; 
  const results = await getDeptList(formatForInq);

  // interate through returned values and add dept
  let choices = [];
  results.forEach(cur => {
    choices.push(cur);
  });

  questions.selectDept[0].choices = choices;
  // console.log("selectDept to returj",questions.selectDept[0].choices);
  // console.log("selectDept to returj",questions.selectDept);
  return inquirer.prompt(questions.selectDept);
};

/*
async function assignEmpl() {
  //db call to update manager for department
  const db = makeDb();
  let status = "failure";
  const empl = await selectEmpl();
  const dept = await selectDept();
  // const assign = {dept,empl};
  console.log("assign",assign);
  // const sql = "UPDATE employee SET 
  try {
    empl = await db.query(sql);
  } catch (err) {
    console.log("error",err);
  }
  const results = []; 
  empl.forEach( cur => { results.push(cur.empl); });
  return results;
}
*/

async function removeDepartment() {
  const dept = await selectDept();
  const confirm = await inquirer.prompt(questions.confirmDelDept);

  if (confirm) {
    const sql = `DELETE FROM department WHERE id = ?`;

    try {
      await db.query(sql,dept.deptId);
      console.log(`\nSuccessully removed department\n`);
    } catch (err) {
      console.log("error with remove department:?",err);
    } 
  }
  genDept();
};

async function genDept() {
  // console.log("in genDept",questions.genDepartment);

  const deptAction = await inquirer.prompt(questions.genDept);
  // console.log("deptAction:",deptAction.deptChoice);

  switch (deptAction.deptChoice) {
    case 'View all departments':
      // console.log("X select view all departments");
      viewDepartments();
      break;
    case 'Add department': 
      await addDepartment();
      // console.log("X select add departments");
      break;
    // case 'Assign employee':
      // assign new employee
      // const assign = await assignEmpl();
      // console.log("X select asign empl",assign);
      // break;
    case 'View total utilized budget of department': 
      // console.log("X select view total util budget");
      viewUtilizedBudget();
      break;
    case 'Remove department': 
      // console.log("X select remove department");
      removeDepartment();
      break;
    default:
      // console.log("X return to main menu");
      main.init();
      break;
  }
}

// async function getEmplList() {
//   let empl;

//   const sql = "SELECT CONCAT(last_name,\",\",first_name) AS empl FROM employee";

//   try {
//     empl = await db.query(sql);
//   } catch (err) {
//     console.log("error",err);
//   }
//   const results = []; 
//   empl.forEach( cur => { results.push(cur.empl); });
//   db.close();
//   return results;
// }

// TODO add function to return objects preformated for inquirer
async function getDeptList(choice) {
  let dept;
  const sql =  "SELECT id, name AS department FROM department";

  try {
    dept = await db.query(sql);
    // db.close();
  } catch (err) {
    console.log("error",err);
  }
  
  const results = []; 
  if (choice) {
    dept.forEach( cur => { results.push({
      value: cur.id,
      name: cur.department
    }); });
  } else {
    dept.forEach( cur => { results.push({
      id: cur.id,
      department: cur.department
    }); });
  }

  return results;
}

exports.genDept = genDept;
exports.getDeptList = getDeptList;
exports.selectDept = selectDept;