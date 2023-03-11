const puppeteer = require('puppeteer');
const fs = require('fs');

const axiosRequest = require('./utils/request');
const Log = require('./utils/log');
const download = require('./download');

const log = new Log()

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

  this.arrayUserAgent = ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.3']

  this.init()
 }
 /**
  * 初始化配置
  */
 initConfig() {
  log.info('主程序开始启动，请您耐心等待~')
  log.info(`开始爬取${this.reptileUrl}的电影`)
  log.info(`文件将会被保存到以下地址中：${this.saveDir}`)
  // 判断本地存储文件夹是否存在
  if (!fs.existsSync(this.saveDir)) {
   log.error('目标文件不存在，开始创建新的文件夹~')
   fs.mkdirSync(this.saveDir);
  }
 }
 init() {
  this.initConfig()
  this.initPuppeteer()
 }
 async initPuppeteer() {
  const browser = await puppeteer.launch({
   // 是否开启无头模式
   headless: true
  });
  const page = await browser.newPage();
  this.browser = browser

  // 随机获取一个userAgent
  const itemAgent = this.arrayUserAgent[Math.floor(Math.random() * this.arrayUserAgent.length)];
  // 随便设置个ua,伪装成一个良民
  await page.setUserAgent(itemAgent);

  // 随便填一个可以获取到播放列表的页面
  // await page.goto('http://www.6dm.cc/play/993-1-1.html');
  await page.goto(this.reptileUrl);
  const waiteTime = this.waiteTime * 1000
  log.info(`休息${waiteTime}s, 等待页面加载完毕，才能干活~`)
  await page.waitForTimeout(waiteTime)
   .then(() => log.info(`${waiteTime}s过去了,继续干活~`));
  log.info(`开始获取播放列表`)
  const urlList = await page.$$eval("#playlist1 a", el => el.map((v, i) => {
   const href = v.getAttribute('href')
   const prefix = 'http://www.6dm.cc'
   const url = `${prefix}${href}`
   return {
    url,
    name: i + 1 < 10 ? `0${i + 1}集` : `${i + 1}集`
   }
  }));
  page.close()
  log.success(`成功获取播放列表，总共${urlList.length}集`)
  console.log(urlList)

  log.info(`开始获取下载资源`)
  this.downloadArray = urlList
  this.downloadTask()
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