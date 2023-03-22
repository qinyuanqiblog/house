const Log = require('./utils/log');
const log = new Log()


const Reptile = require('./robot')


var mysql      = require('mysql2');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root'
});

connection.query('use house_info')

const array = [
  [ 
    1679389969116,
    '13',
    '深房许字（2023）南山003号',
    'http://zjj.sz.gov.cn/ris/bol/szfdc/certdetail.aspx?id=126737',
    '方直珑樾山花园',
    'http://zjj.sz.gov.cn/ris/bol/szfdc/ojectdetail.aspx?id=126737',
    '深圳市龙廷房地产开发有限公司',
    '南山',
    '2023-03-02'
  ],
  [
    1679389969118,
    '13',
    '深房许字（2023）南山003号',
    'http://zjj.sz.gov.cn/ris/bol/szfdc/certdetail.aspx?id=126737',
    '方直珑樾山花园',
    'http://zjj.sz.gov.cn/ris/bol/szfdc/ojectdetail.aspx?id=126737',
    '深圳市龙廷房地产开发有限公司',
    '南山',
    '2023-03-02'
  ],
]
connection.query(`INSERT INTO presell ( mainKey, serial, idCard, idCardUrl, productName, productUrl, enterprise, location, authorizeDate )
VALUES ?`,[array], function (error, results, fields) {
  if (error) {
   log.error('批量插入失敗，错误信息==>', error)
   throw error;
  }
  // connected!
  log.info('批量插入成功', results)
});

// var post  = {
//   mainKey: 119, 
//   serial: 22,
//   idCard: 'Hello MySQL',
// }

// var query = connection.query('INSERT INTO presell SET ?', post, function (error, results, fields) {
//   if (error) throw error;
//   console.log('插入成功')
// });
// console.log(query.sql); // INSERT INTO posts SET `id` = 1, `title` = 'Hello MySQL'

return false

// 调用方式1： wallhaven.cc 网站调用入口
new Reptile({
  reptileUrl: 'http://zjj.sz.gov.cn/ris/bol/szfdc/index.aspx',
})
