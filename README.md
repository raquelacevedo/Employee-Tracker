# Employee Tracker

#### By Raquel Acevedo

## Description
Employee Tracker is a command-line application that allows the user to:

* Add departments, roles, employees
* View departments, roles, employees
* Update employee roles
* Update employee managers
* View employees by manager
* Delete departments, roles, and employees
* View the total utilized budget of a department 

## Setup/Installation Requirements

* Clone this repository.
* Open repository in your terminal.
* Use the create_employee.sql file to create the database in MySql and seed_data.sql from the db folder to populate the data.
* NPM Install in order to use the following packages: MySQL, Inquirer , util and console.table
* Command line: node server.js to get the app up and running. 

## Known Bugs

There seems to be an issue with inquirer having memory leaks so a line of code was added to alleviate the leaks.

## Technologies Used

* MySql
* Node
* JS


### License

Copyright(c) 2020 Raquel Acevedo

This software is licensed under MIT license.