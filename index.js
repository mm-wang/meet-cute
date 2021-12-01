#!/usr/bin/env node

const dotenv = require("dotenv");
const chalk = require("chalk");

/**
 * ENVIRONMENT VARIABLES 
 */
dotenv.config({
    path: ".env-dev"
});
console.log(chalk.yellow("Environment variables loaded"));

/**
 * MODULES
 */
const MeetCute = require("./modules/MeetCute");

const meetCute = new MeetCute();
meetCute.init();
