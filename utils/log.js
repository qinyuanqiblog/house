var chalk = require('chalk');

// 日志
const log = class Log {
 constructor(msg) {
     this.consoleLog = console.log
 }
 info(msg) {
     this.consoleLog(chalk.blue(msg))
 }
 success(msg) {
     this.consoleLog(chalk.green(msg))
 }
 error(msg) {
     this.consoleLog(chalk.red(msg))
 }
}

module.exports = log