const inquirer = require("inquirer");
const main = require("../server");
const db = require("../db/db");
const dept = require("./department");

require("console.table");

questions =  {
  genRole: [
    {
      type: "list",
      name: "genRole",
      message: "Options for role management?",
      choices: [{ name: "View all roles", value: 1},
                { name: "Add role", value: 2},
                { name: "Update role", value: 3},
                { name: "Remove role", value: 4},
                { name: "Return to main menu", value: 5}]
    }
  ],
  selectRole: [
    {
      type: "list",
      name: "roleId",
      message: "Select role:",
      // choices will be dynamically set from existing departments
    },
  ],
  addRole: [
    {
      type: "input",
      name: "roleName",
      message: "Enter Role name:",
    },
    {
      type: "input",
      name: "salary",
      message: "Enter salary associated with role:",
    },
    // choice will be dynamically set from existing employees
    {
      type: "list",
      name: "deptId",
      message: "Select department to which role will be assigned:",
    }
  ],
  updateRole: [
    {
      type: "list",
      name: "attr",
      message: "Select attribute to update:",
      choices: ["Title","Salary","Department"]
    }],
  updateTitle: [
    {
      type: "input",
      name: "title",
      message: "Enter new title:",
    }
  ],
  updateSalary: [
    {
      type: "number",
      name: "salary",
      message: "Enter new salary:",
    }],
  confirmDelRole: [
    {
      type: "confirm",
      name: "delRole",
      message: "Are you sure you want to delete this role and elimiate all the lazy-ass proletariat?",
      default: true
    },
  ],
}

async function getRoleList(choice) {
  let dept;
  const sql =  "SELECT r.id, r.title AS role, r.salary, r.dept_id, d.name AS department FROM role r, department d WHERE r.dept_id = d.id ORDER BY r.salary DESC";

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
      name: cur.role
    }); });
  } else {
    dept.forEach( cur => { results.push({
      id: cur.id,
      title: cur.role,
      salary: cur.salary,
      dept_id: cur.dept_id,
      dept: cur.department,
    }); });
  }
  // console.log("get results",results);
  return results;
}

async function viewRole() {
  let values = [];

  try {
    const roleList = await getRoleList();
    // console.log("here results",roleList);
    roleList.forEach(res => { 
      values.push([res.title,res.salary,res.dept]); 
    });
    // console.log("values",values);
  } catch (err) {
    console.log("error with viewRole",err);
  }
  console.log(" ");
  console.table(['Title','Salary','Department'],values);
  genRole();
};

// function to display a table to the users of exisiting departments
async function selectRole() {
  // db read to return department list
  let formatForInq = true; 
  const results = await getRoleList(formatForInq);

  // interate through returned values and add dept
  let choices = [];
  results.forEach(cur => {
    choices.push(cur);
  });

  questions.selectRole[0].choices = choices;
  // console.log("select role",questions.selectRole);
  return inquirer.prompt(questions.selectRole);
};

async function addRole() {
  let formatForInq = true; 
  const results = await dept.getDeptList(formatForInq);

  // interate through returned values and add dept
  let choices = [];
  results.forEach(cur => {
    choices.push(cur);
  });

  questions.addRole[2].choices = choices;
  const add = await inquirer.prompt(questions.addRole);
  // console.log("add",add);

  let values = [add.roleName,add.salary,add.deptId];
  try {
    const sql = `INSERT INTO role (title, salary, dept_id) VALUES (?,?,?)`;
    await db.query(sql,values);
    console.log(`\nSuccessfully created a new role\n`);
  } catch (err) {
    console.log("error with role insert",err);
  }

  genRole();
};

async function updateRole() {
  const formatForInq = true;
  const role = await selectRole(formatForInq);
  const roleList = await getRoleList();
  // console.log("role",role);
  // console.log("role",roleList);

  roleList.forEach(cur => {
    if (cur.id === role.roleId) {
      upVal = cur;
    }
  });

  const update = await inquirer.prompt(questions.updateRole);
  // console.log("update",update.attr);

  let values = [];
  switch (update.attr) {
    case "Title":
      const t = await inquirer.prompt(questions.updateTitle);
      values.push("title",t.title);
      break;
    case "Salary":
      const s = await inquirer.prompt(questions.updateSalary);
      values.push("salary",s.salary);
      break;
    case "Department":
      /*
      const depts = dept.getDeptList();
      questions.updateDept[0].choices = choices;
      const d = await inquirer.prompt(questions.updateDepartment);
      console.log(depts);
      */
      const d = await dept.selectDept()
      // console.log(d);

      values.push("dept_id",d.deptId);
      break;
    default:
      break;
  }

  values.push(role.roleId);

  // console.log("values",values);
  try {
    const sql = `UPDATE role SET ?? = ?  WHERE id = ?`;
    await db.query(sql,values);
    console.log(`\nSuccessfully created a new role\n`);
  } catch (err) {
    console.log("error with role insert",err);
  }

  genRole();
};

async function removeRole() {
  let formatForInq = true; 
  const role = await selectRole(formatForInq);
  // console.log("in del",role);

  const confirm = await inquirer.prompt(questions.confirmDelRole); 
  const sql = `DELETE FROM role WHERE id = ?`;

  if (confirm) {
    try {
      await db.query(sql,role.roleId);
      console.log(`\nSuccessully removed role\n`);
    } catch (err) {
      console.log("error with remove role",err);
    } 
  }
  genRole();
};

async function genRole() {
  // console.log("in genDept",questions.genDepartment);

  const action = await inquirer.prompt(questions.genRole);
  // console.log("action:",action);

  switch (action.genRole) {
    case (1): 
      // console.log("X select view all departments");
      viewRole();
      break;
    case (2): 
      await addRole();
      // console.log("X select add departments");
      break;
    case (3): 
      // console.log("X select view total util budget");
      updateRole();
      break;
    case (4): 
      // console.log("X select remove department");
      removeRole();
      break;
    default:
      // console.log("X return to main menu");
      main.init();
      break;
  }
}

exports.genRole = genRole;
exports.getRoleList = getRoleList;
exports.selectRole = selectRole;