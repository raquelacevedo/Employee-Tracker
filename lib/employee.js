const inquirer = require("inquirer");
const main = require("../server");
const dept = require("./department")
const role = require("./roles")
const db = require("../db/db");

require("console.table");

const questions = {
  genEmpl: [
    {
      type: "list",
      name: "emplChoice",
      message: "Options for employee management?",
      choices: ["View all employees", 
                "Add employee", 
                "Eliminate employee",
                "Return to main menu" ]
    }
  ],
  selectMang: [
    {
      type: "list",
      name: "mang",
      message: "Select employees manager",
      // choice will be dynamically set from existing employees
    }
  ],
  selectEmpl: [
    {
      type: "list",
      name: "empl",
      message: "Select employee",
      // choice will be dynamically set from existing employees
    }
  ],
  confirmDel: [
    {
      type: "confirm",
      name: "confDel",
      message: "Are you sure you want to eliminate this employee?",
      default: false
    },
  ],
  addEmplName: [
    {
      type: "input",
      name: "firstName",
      message: "Enter the first name of your new employee:",
    },
    {
      type: "input",
      name: "lastName",
      message: "Enter the last name of your new employee:",
    }
  ],
  selectDept: [
    {
      type: "list",
      name: "dept",
      message: "Select department:",
      // choices will be provided from the database
    },
  ],
  selectRole: [
    {
      type: "select",
      name: "role",
      message: "Select role:",
      // choices will be provided from the database
    },
  ],
  makeMangExisting: [
    {
      type: "confirm",
      name: "dept",
      message: `There is an existing manager do you want to fire the existing manager:`,
      // choices will be provided from the database
    },
  ],
  makeMangNonExisting: [
    {
      type: "confirm",
      name: "dept",
      message: "Select department:",
      // choices will be provided from the database
    },
  ]
};

async function viewEmployees() {
  let values = [];

  // console.log(" in view empl");
  // console.log("db",db.query);

  const results = await getEmplList();
  // console.log(results);
  results.forEach(res => { 
    values.push([res.name,res.id,res.role,res.salary,res.manager]); 
  });

  console.log(" ");
  console.table(['Employee Name','Employee ID','Role','Salary','Managers Name'],values);
  genEmpl();
};


async function addEmployee() {
  // console.log("add departments");
  // get user input for first last name
  const neName = await inquirer.prompt(questions.addEmplName);
  let values = [neName.firstName,neName.lastName];

  let formatForInq = true;

  const selectedRole = await role.selectRole(formatForInq);
  values.push(selectedRole.roleId);

  const emplResults = await getEmplListByDept(formatForInq);

  let emplChoices =[];
   emplResults.forEach(cur => {
    emplChoices.push(cur);
  })

  questions.selectMang[0].choices = emplChoices;
  const neMang = await inquirer.prompt(questions.selectMang);
  // console.log("\n\nemployee",neMang);
  values.push(neMang.mang);

  // build sql for insert
  const sql = `INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES (?,?,?,?)`;

  try {
    await db.query(sql,values);
    console.log(`\nSuccessfully created new Employee\n`);
  } catch (err) {
    console.log("error with insert",err);
  }

  genEmpl();
};

async function selectEmpl() {
  // db read to return manager list
  let formatForInq = true; 
  const results = await getEmplList(formatForInq);

  // interate through returned values and add dept
  let choices = [];
  results.forEach(cur => {
    choices.push(cur);
  });

  questions.selectEmpl[0].choices = results;
  return inquirer.prompt(questions.selectEmpl);
};

async function removeEmployee() {
  const formatForInq = true;
  const empl = await selectEmpl(formatForInq);
  // console.log(empl);

  const confirm = await inquirer.prompt(questions.confirmDel);
  const sql = "DELETE FROM employee WHERE id = ?"; 

  if (confirm) {
    try {
      await db.query(sql,empl.empl);
      console.log(`\nSuccessully removed employee\n`);
    } catch (err) {
      console.log("error with remove department:?",err);
    } 
  }
  genEmpl();
};

async function genEmpl() {
  // console.log("in genDept",dept,dept.getDept,dept.getDeptList);

  const emplAction = await inquirer.prompt(questions.genEmpl);
  // console.log("deptAction:",deptAction.deptChoice);

  switch (emplAction.emplChoice) {
    case 'View all employees': 
      // console.log("X select view all departments");
      viewEmployees();
      break;
    case 'Add employee': 
      await addEmployee();
      // console.log("X select add departments");
      break;
    // case 'Assign employee':
      // assign new employee
      // const assign = await assignEmpl();
      // console.log("X select asign empl",assign);
      // break;
    case 'Eliminate employee': 
      // console.log("X select remove department");
      removeEmployee();
      break;
    default:
      // console.log("X return to main menu");
      main.init();
      break;
  }
}

async function getEmplListByDept(dept) {

  // console.log("dept",dept);
  const sql = `SELECT id, 
                      CONCAT(last_name,\", \",first_name) AS empl 
                 FROM employee 
                WHERE role_id IN ( SELECT id FROM role WHERE dept_id = ? )
             ORDER BY last_name`;
  try {
    empl = await db.query(sql,[dept]);
  } catch (err) {
    console.log("error",err);
  }

  const results = []; 
  empl.forEach( cur => { results.push({
    value: cur.id,
    name: cur.empl,
  }); });
  return results;
}

// add option for where clause
async function getEmplList(inq) {
  let empl;
  const sql = `SELECT e.id, 
                      e.first_name, 
                      e.last_name, 
                      CONCAT(e.last_name,\", \",e.first_name) AS empl,
                      r.title AS role,
                      r.salary AS salary,
                      CONCAT(z.last_name,\", \",z.first_name) AS mang
                 FROM employee e 
                 JOIN role r 
                   ON e.role_id = r.id
                 JOIN employee z 
                   ON e.manager_id = z.id
             ORDER BY r.salary DESC`;

  try {
    empl = await db.query(sql);
  } catch (err) {
    console.log("error",err);
  }

  const results = []; 
  if (inq) {
    empl.forEach( cur => { results.push({
      value: cur.id,
      name: cur.empl,
    }); });
  } else {
    empl.forEach( cur => { results.push({
      id: cur.id,
      name: cur.empl,
      first_name: cur.first_name,
      last_name: cur.last_name,
      role: cur.role,
      salary: cur.salary,
      manager: cur.mang
    }); });
  }
  return results;
}

exports.genEmpl = genEmpl;
exports.getEmplList = getEmplList;