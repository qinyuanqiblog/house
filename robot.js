const puppeteer = require('puppeteer');

const axiosRequest = require('./utils/request');
const Mysql = require('./mysql');
const Log = require('./utils/log');
const dateTool = require('./utils/date');
const log = new Log()
const mysql = new Mysql()

var cheerio = require('cheerio');
var qs = require('querystring');

module.exports = class Reptile {
 constructor({
  reptileUrl,
  waiteTime = 2,
 }) {
  // 爬取的网站
  this.reptileUrl = reptileUrl;
  // 页面等待时间，需要等页面加载完毕，才能获取元素，网络不好的情况，就调长一点，单位s
  // 目前的设计是所有的等待时间公用一个变量
  this.waiteTime = waiteTime;
  // puppeteer browser实例
  this.browser = null
  this.page = null
  this.total = 0
  this.totalLoop = 0

  this.isFirst = false
  this.count = 0
  this.totalPage = 1
  this.currentLoopPage = 6

  this.arrayUserAgent = ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.3']

  this.init()
 }

 init() {
  this.initConfig()
  this.initPuppeteer()
 }
  /**
  * 初始化配置
  */
  initConfig() {
    log.info('主程序开始启动，请您耐心等待~')
    log.info(`开始爬取${this.reptileUrl}的数据`)
   }
 async initPuppeteer() {

  const browser = await puppeteer.launch({
   // 是否开启无头模式
   headless: true
  });
  const page = await browser.newPage();
  this.page = page
  this.browser = browser

  // 随机获取一个userAgent
  const itemAgent = this.arrayUserAgent[Math.floor(Math.random() * this.arrayUserAgent.length)];
  // 随便设置个ua,伪装成一个良民
  await page.setUserAgent(itemAgent);
  // await page.setExtraHTTPHeaders({
  //   'accept-encoding': 'gzip, deflate, br',
  // });

  await page.goto(this.reptileUrl);
  // 触发form提交
  // await page.type('input[id=login_field]', 'John');
  // await page.type('input[name=password]', 'Password');
  // await page.evaluate(() => {
  //     document.querySelector('input[type=submit]').click();
  // });
  if(!this.isFirst){
    //  获取总页数
    const total = await page.$eval("#SelectPageSizeDiv span", el => {
      // return el.innerHTML
      return el.innerHTML.split('共')[1].split('条')[0]
    });
    if(!total){
      log.error('总页数获取异常')
      return false
    }
    log.success(`成功获取获取总页数，总共${total}页`)
    this.total = total
    await page.type('#ddlPageCount', '20', {delay: 100});
    this.totalLoop = Math.ceil(total/20)
    log.info(`初始化动作完毕，5s后开始爬取${this.reptileUrl}网站内容了~`)
    await page.waitForTimeout(5000)
  }
  this.isFirst = true

  this.startFirstLoop()
 }


 /**
  * 返回数据处理
  */
 async responseDataHandle(){
  const page = this.page
  const tableArray = []
  // 把页面的html抛出来，再用另一个库取到数据
  const aHandle = await page.evaluateHandle(() => document.body);
  const resultHandle = await page.evaluateHandle(body => body.innerHTML, aHandle);
  const bodyElement = await resultHandle.jsonValue()
  var $ = cheerio.load(bodyElement);
  const trArray = $('.table tr')
  // 获取数据
  trArray.each((i, element) => {
    const currentTr = $(element)
    const current = []
    // 第一个tr是标题，不需要，最后一个tr也会有一个占位符，也不能要
    if(i > 0 && i < trArray.length - 1){
      currentTr.children().each((i,element) => {
        const currentTd = $(element)
        const prefix = 'http://zjj.sz.gov.cn/ris/bol/szfdc/'
        const href = currentTd.find('a').attr('href') || ''
        switch (i) {
          case 0:
            // 主键和序号
            current.push(new Date().getTime() + Math.ceil(Math.random() * 100000000))
            current.push(currentTd.text().trim())
            break;
          case 1:
            // 预售证书和详情url
            current.push(currentTd.text().trim())
            current.push(prefix + href.substring(2))
            break;
          case 2:
            // 项目名称和项目详情url
            current.push(currentTd.text().trim())
            current.push(prefix + href.substring(2))
            break;
          case 3:
            // 开发企业
            current.push(currentTd.text().trim())
            break;
          case 4:
            // 所在地区
            current.push(currentTd.text().trim())
            break;
          case 5:
            // 批准时间，数据库设置了date 类型， 所以要做非空处理
            current.push(currentTd.text().trim() || null)
            // 更新时间
            current.push(dateTool.formatDateBy(new Date()))
            break;
        }
      })
      this.count++
      tableArray.push(current)
    }
  })
  return tableArray
 }

 async saveDB(source){
  mysql.openConnection()
  mysql.batchInsert(source)
 }

 
  startFirstLoop(){
  const page = this.page
  this.firstLoopTime = setInterval(async() => {
    log.info('开始第第一轮爬取流程')
    log.info(`总数：${this.total},正在爬第${this.totalPage}页的数据,总共爬取了${this.count}条数据`)
    this.totalPage ++
    // 第一轮结束，开启第二轮的爬取
    if(this.totalPage === (this.currentLoopPage+1)){
      page.click(`#AspNetPager1 > span:nth-last-of-type(1)`, {delay: 100})
      await page.waitForTimeout(2000)
      clearInterval(this.firstLoopTime)
      this.normalLoopFn()
      const result = await this.responseDataHandle()
      this.saveDB(result)
      return false
    }
    page.click(`#AspNetPager1 > a:nth-of-type(${ this.totalPage})`, {delay: 100})
    const result = await this.responseDataHandle()
    this.saveDB(result)
  }, 2000)
  }
  //  第二次后開始的逻辑，他們的頁面结构不一样
  normalLoopFn(){
    const page = this.page
    this.normalLoop = setInterval(async() => {
      log.info('开始第正常爬取流程')
      log.info(`总数：${this.total},正在爬第${this.totalPage}页的数据,总共爬取了${this.count}条数据`)
      if(this.totalPage === this.totalLoop){
        clearInterval(this.normalLoop)
        log.success('爬取完毕了~')
        return false
      }
      let currentCount = this.totalPage % this.currentLoopPage
      if(!currentCount){
        page.click(`#AspNetPager1 > span:nth-last-of-type(1)`, {delay: 100})
        await page.waitForTimeout(2000)
        const result = await this.responseDataHandle()
        this.saveDB(result)
      }else{
        page.click(`#AspNetPager1 > a:nth-of-type(${ currentCount + 1})`, {delay: 100})
        await page.waitForTimeout(2000)
        const result = await this.responseDataHandle()
        this.saveDB(result)
      }
      this.totalPage ++
    }, 3000);
  }

}