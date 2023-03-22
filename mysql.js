const Log = require('./utils/log');
const log = new Log()

module.exports = class MySql {
 constructor (){
  this.connection = null
  this.mysql = null
  this.init()
 }
  
 init(){
  const mysql = require('mysql2')
  this.mysql = mysql
 }

 openConnection (){
  if(this.connection){
   this.connection.connect();
   this.connection.query('use house_info')
    return false
  }
  const connection = this.mysql.createConnection({
   host     : 'localhost',	//连接的数据库地址。（默认:localhost）
   user     : 'root',		//mysql的连接用户名
   password : 'root',		// 对应用户的密码
   port: '3306',
 });
 this.connection = connection
 this.connection.connect();
 connection.query('use house_info')
 log.success('连接数据库成功 house_info')
 }

 batchInsert(array = []) {
  // 插入多条数据
  // https://stackoverflow.com/questions/8899802/how-do-i-do-a-bulk-insert-in-mysql-using-node-js
  this.connection.query(`INSERT INTO presell ( mainKey, serial, idCard, idCardUrl, productName, productUrl, enterprise, location, authorizeDate, reptileDate )
  VALUES ?`,[array], function (error, results, fields) {
    if (error) {
     console.log('array', array)
     log.error('批量插入失敗，错误信息==>', error, results, fields)
     throw error;
    }
    // connected!
    log.info('批量插入成功', results)
  });
 }

 closeConnection(){
  this.connection.close();
 }
}