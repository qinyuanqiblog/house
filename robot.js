const puppeteer = require('puppeteer');
const fs = require('fs');

const axiosRequest = require('./utils/request');
const Log = require('./utils/log');
const download = require('./download');

const log = new Log()

var cheerio = require('cheerio');
var qs = require('querystring');

module.exports = class Reptile {
 constructor({
  reptileUrl,
  saveDir,
  waiteTime = 2,
  excelFileName = '爬虫excel报告',
 }) {
  // 爬取的网站
  this.reptileUrl = reptileUrl;
  // 保存的文件夹
  this.saveDir = saveDir;
  // 页面等待时间，需要等页面加载完毕，才能获取元素，网络不好的情况，就调长一点，单位s
  // 目前的设计是所有的等待时间公用一个变量
  this.waiteTime = waiteTime;
  // excel文件名
  this.excelFileName = excelFileName;
  // 所有的源数据合集
  this.totalUrlList = []
  // 下载成功的地址合集
  this.uploadSuccessArray = []
  // 下载失败的地址合集
  this.uploadFailArray = []
  // puppeteer browser实例
  this.browser = null
  this.downloadArray = []

  this.isFirst = false
  this.count = 1
  this.pageTotal = 6

  this.arrayUserAgent = ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.3']

  this.init()
 }
 /**
  * 初始化配置
  */
 initConfig() {
  log.info('主程序开始启动，请您耐心等待~')
  log.info(`开始爬取${this.reptileUrl}的数据`)
 }
 init() {
  this.initConfig()
  this.initPuppeteer()
 }
 async initPuppeteer() {


  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  var requests = [];
  var responses = [];

  await page.setRequestInterception(true);
  const urls = []

page.on('request', async (request) => {
  requests.push(typeof request.postData)
  if (request.url().indexOf("zjj.sz.gov.cn/ris/bol/szfdc/index.aspx") > -1) {
    // send manipulated method, headers or body.
    // requests.push(request)
    return request.continue({
      method: 'POST',
      postData: 'key1=value1&key2=value2',
      headers: {
        ...request.headers(),
      }
    });
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
  await page.waitForTimeout(2000)
  await page.goto('http://zjj.sz.gov.cn/ris/bol/szfdc/index.aspx');
  await page.waitForTimeout(2000)
  await page.goto('http://zjj.sz.gov.cn/ris/bol/szfdc/index.aspx');
  await page.waitForTimeout(2000)
  // console.log('urls', urls);
  console.log('requests', requests);
  // console.log('responses', responses)
  // const browser = await puppeteer.launch({
  //  // 是否开启无头模式
  //  headless: true
  // });
  // const page = await browser.newPage();
  // this.browser = browser

  // 随机获取一个userAgent
  const itemAgent = this.arrayUserAgent[Math.floor(Math.random() * this.arrayUserAgent.length)];
  // 随便设置个ua,伪装成一个良民
  await page.setUserAgent(itemAgent);
  await page.setExtraHTTPHeaders({
    'accept-encoding': 'gzip, deflate, br',
  });

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
    await page.type('#ddlPageCount', '20', {delay: 100});
    log.info(`初始化动作完毕，5s后开始爬取${this.reptileUrl}网站内容了~`)
    await page.waitForTimeout(5000)
  }
  this.isFirst = true

  const tableArray = []
  // 把页面的html抛出来，再用另一个库取到数据
  const aHandle = await page.evaluateHandle(() => document.body);
  const resultHandle = await page.evaluateHandle(body => body.innerHTML, aHandle);
  const bodyElement = await resultHandle.jsonValue()
  var $ = cheerio.load(bodyElement);
  // 获取数据
  // $('.table tr').each((i, element) => {
  //   const currentTr = $(element)
  //   // 第一个tr是标题，不需要
  //   if(i > 0){
  //     currentTr.children().each((i,element) => {
  //       const current = {} 
  //       const currentTd = $(element)
  //       const prefix = 'http://zjj.sz.gov.cn/ris/bol/szfdc/'
  //       const href = currentTd.find('a').attr('href') || ''
  //       switch (i) {
  //         case 0:
  //           current.index = currentTd.text().trim()
  //           break;
  //         case 1:
  //           current.idCard = currentTd.text().trim()
  //           current.idCardUrl = prefix + href.substring(2)
  //           break;
  //         case 2:
  //           current.projectName = currentTd.text().trim()
  //           current.projectNameUrl = prefix + href.substring(2)
  //           break;
  //         case 3:
  //           current.enterprise = currentTd.text().trim()
  //           break;
  //         case 4:
  //           current.location = currentTd.text().trim()
  //           break;
  //         case 5:
  //           current.authorizeDate = currentTd.text().trim()
  //           break;
        
  //         default:
  //           console.log('默认啥都没处理~')
  //           break;
  //       }
  //       tableArray.push(current)
  //     })
  //   }
  // })
  // 存储到数据库
  this.saveDB()
  let bb = ''
 page.on("request", async (Request) => {
      let url = Request.url();
      console.log("request", url);
      bb = url
  });

  console.log(bb, 'bbbbb')

  // setInterval(async() => {
  //   this.count ++

  //   const currentCount = this.count % this.pageTotal
  //   if(!currentCount){
  //     page.click(`#AspNetPager1 > span:nth-child(2)`, {delay: 100})
  //     await page.waitForTimeout(4000)
  //   }else{
  //     page.click(`#AspNetPager1 > a:nth-child(${ currentCount+1})`, {delay: 100})
  //     await page.waitForTimeout(4000)
  //   }
  // }, 2000);

  // const waiteTime = this.waiteTime * 1000
  // log.info(`休息${waiteTime}s, 等待页面加载完毕，才能干活~`)
  // await page.waitForTimeout(waiteTime)
  //  .then(() => log.info(`${waiteTime}s过去了,继续干活~`));
 }
 async saveDB(){
  
 }
 async downloadTask() {
  const waiteTime = this.waiteTime * 1000
   const downloadArray = this.downloadArray
   if (!downloadArray.length){
    // 关闭浏览器实例
    log.info('无数据或者是下载完毕，关闭浏览器实例')
    await this.browser.close();
    return false
   }
   const current = downloadArray.shift();
   const page = await this.browser.newPage();
   // 随机获取一个userAgent
   const itemAgent = this.arrayUserAgent[Math.floor(Math.random() * this.arrayUserAgent.length)];
   // 随便设置个ua,伪装成一个良民
   await page.setUserAgent(itemAgent);
   await page.goto(current.url);
   log.info(`休息${waiteTime}s, 等待页面加载完毕，才能干活~`)
   await page.waitForTimeout(waiteTime)
   // 页面里面的一些重要信息
   const pageInfo = await page.evaluate(async () => {
    // await window.MacPlayer;
    return {
     MacPlayer: window.MacPlayer,
     player_aaaa: window.player_aaaa,
    }
   });
   
   // 获取资源地址
   const MacPlayer = pageInfo.MacPlayer
   const remoteUrl = MacPlayer.Parse + MacPlayer.PlayUrl
   console.log('MacPlayer', MacPlayer)
   console.log('成功获取到解析地址==>', remoteUrl);
   page.close()

   log.info('开始新开一个页面去获取资源地址~')
   const newPage = await this.browser.newPage();
   // 随便设置个ua,伪装成一个良民
   await newPage.setUserAgent(itemAgent);
   await newPage.goto(remoteUrl);
   log.info('等待2s，让浏览器加载完毕之后，再做后续操作');
   await newPage.waitForTimeout(waiteTime)
   // 获取目标资源的地址
   const src = await newPage.evaluate('document.querySelector("#lelevideo").getAttribute("src")')
   log.success('成功获取到视频源地址==>', src)
   newPage.close()
   const suffix = pageInfo.player_aaaa && pageInfo.player_aaaa.from || 'mp4'
   download({
    url: src,
    fileName: `${this.saveDir}${current.name}.${suffix}`
   }).then(()=>{
    this.downloadTask()
   })
  }
 
}