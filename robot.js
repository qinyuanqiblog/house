const puppeteer = require('puppeteer');
const fs = require('fs');

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

  function stringify(obj){
    var array = []
    Object.keys(obj).forEach(k=>{
      array.push(`${k}=${encodeURIComponent(obj[k])}`)
    })
    return array.join('&')
  }
  const data =  {
    scriptManager2: 'updatepanel2|AspNetPager1',
  __EVENTTARGET: 'AspNetPager1',
  __EVENTARGUMENT: '10',
  ddlPageCount: '15',
  __LASTFOCUS: '',
  __VIEWSTATE: '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',
  '__VIEWSTATEGENERATOR': '2A35A6B2',
  '__VIEWSTATEENCRYPTED': '',
  '__EVENTVALIDATION': 'fJ9qQ/6PtYBFOfcIqEenBKkin0S/s3JDmXsF1BTrqQMVC/QBW3dxzj0s8UjTkMY9DvrG7mOy4RPwkucXFbq/efSNnsTeuaTy95jqmpxkhmXUPPTfCsRO+QHLApCZ+xYDalw0LGKBnQggVOw2GuXZbdH7Tgg2qhCG6jSG+TlDp15pA4eN7p8ONslDQTYjUA/N+9eRzg5quuAclQzbSNgGEwqFywCmLGcQwITCPmV0ELr1c8msadmjhRZkqeyaQT7m5uP0Ew==',
  'tep_name': '',
  'organ_name': '',
  'site_address': '',
  }
  
  axiosRequest.request({
    url: 'http://zjj.sz.gov.cn/ris/bol/szfdc/index.aspx',
    method: 'POST',
    data: stringify(data),
    headers:{
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  }, 
).then(response => {
    const tableArray = []
    var $ = cheerio.load(response.data);
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

    console.log(tableArray)
    console.log(tableArray.length)
  })
  .catch(err=>{
    console.log('狗带了')
  })

  return false

  const browser = await puppeteer.launch({
    headless: false,
    // args: ['--disable-infobars', '--no-sandbox', '--disable-setuid-sandbox'],
    // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage();
  var requests = [];
  var responses = [];

  await page.setRequestInterception(true);
  const urls = []

page.on('request', async (request) => {
  requests.push(typeof request.postData)
  if (request.url().indexOf("zjj.sz.gov.cn/ris/bol/szfdc/index.aspx") > -1) {
    await page.setRequestInterception(true);
    // send manipulated method, headers or body.
    // requests.push(request)
    return request.continue({
      method: 'POST',
      postData:  request.postData(),
      headers: {
        ...request.headers(),
        bb:999999,
      }
    });
    await page.setRequestInterception(false);
  }
  request.continue(); // send request without manipulation.
});

  // page.on('request', request => {
  //   var url = request.url();
  //   if (url.startsWith("cloudflareinsights.com/cdn-cgi/rum")) {
  //     console.log('的稍等')
  //   }
  //     requests.push(request);
  // });

  page.on('response', response => {
    if (response.url().indexOf("zjj.sz.gov.cn/ris/bol/szfdc/index.aspx") > -1) {
      // send manipulated method, headers or body.
      responses.push(response)
    }
  });
  await page.waitForTimeout(4000)
  await page.goto('http://zjj.sz.gov.cn/ris/bol/szfdc/index.aspx');
  // console.log('urls', urls);
  console.log('requests', requests);

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