DROP DATABASE IF EXISTS emplMang;
-- Create the database and specify it for use.
CREATE DATABASE emplMang;
USE emplMang;

-- Create the department table

CREATE TABLE department (
  id int AUTO_INCREMENT,
  name varchar(30) NOT NULL,
  PRIMARY KEY(id)
);
-- Create the role table
CREATE TABLE role (
  id int AUTO_INCREMENT,
  title varchar(30) NOT NULL,
  salary decimal(9.2) NOT NULL,
  dept_id int NOT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY (dept_id) 
  REFERENCES department(id)
  ON DELETE CASCADE
);
-- Create the employee table
CREATE TABLE employee (
  id int AUTO_INCREMENT,
  first_name varchar(30) NOT NULL,
  last_name varchar(30) NOT NULL,
  role_id int NOT NULL,
  manager_id int,
  PRIMARY KEY(id),
  CONSTRAINT fk_role_id
  FOREIGN KEY (role_id) 
  REFERENCES role(id)
  ON DELETE CASCADE
);