const Log = require('./utils/log');
const log = new Log()


const Reptile = require('./robot')


// 调用方式1： wallhaven.cc 网站调用入口
new Reptile({
  reptileUrl: 'http://zjj.sz.gov.cn/ris/bol/szfdc/index.aspx',
})
