const puppeteer = require('puppeteer');
const fs = require('fs');

const axiosRequest = require('./utils/request');
const Mysql = require('./mysql');
const Log = require('./utils/log');
const dateTool = require('./utils/date');


const log = new Log()
const mysql = new Mysql()

var cheerio = require('cheerio');
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

  this.isFirst = true
  this.count = 0
  this.totalPage = 1
  this.currentLoopPage = 6
  this.ajaxData = {
    // 事件类型
    __EVENTTARGET: 'AspNetPager1',
    // 第几页
    __EVENTARGUMENT: '1',
    // 页数，支持10 ，15，20
    ddlPageCount: '20',
  }

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

  if(this.isFirst) {
    axiosRequest.request({
        url: 'http://zjj.sz.gov.cn/ris/bol/szfdc/index.aspx',
        method: 'GET',
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }, 
    ).then(response => {
      const $ = cheerio.load(response.data);
      //  获取总页数
      const total =  $('#SelectPageSizeDiv span').text().split('共')[1].split('条')[0]
      if(!total){
        log.error('总页数获取异常')
        return false
      }
      this.total = total
      this.totalLoop = Math.ceil(total/20)
      log.success(`成功获取获取总页数，总共${total}页,总页数：${this.totalLoop}`)
      log.info(`初始化动作完毕，5s后开始爬取${this.reptileUrl}网站内容了~`)
      const paramsObject = {}
      // 获取页面里面服务器需要的四个input 元素的值
      const inputArray = $('input[type="hidden"]').each((i,element)=>{
        const name = $(element).attr('name')
        const value = $(element).attr('value')
        paramsObject[name] = value
      }, {})
      this.ajaxData = Object.assign(this.ajaxData, paramsObject)
    })
  }
  this.isFirst = false

  this.normalLoop = setInterval(() => {
    log.info('开始爬取流程')
    if(this.totalPage > this.totalLoop){
      clearInterval(this.normalLoop)
      log.success('爬取完毕了~')
      return false
    }
    axiosRequest.request({
      url: 'http://zjj.sz.gov.cn/ris/bol/szfdc/index.aspx',
      method: 'POST',
      data: stringify(this.ajaxData),
      headers:{
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    }, 
  ).then(response => {
      const tableArray = []
      const paramsObject = {}
      const $ = cheerio.load(response.data);
      // 获取页面里面服务器需要的四个input 元素的值
      const inputArray = $('input[type="hidden"]').each((i,element)=>{
        const name = $(element).attr('name')
        const value = $(element).attr('value')
        paramsObject[name] = value
      }, {})
      log.info(`总数：${this.total},总页数：${this.totalLoop},正在爬第${this.totalPage}页的数据,总共爬取了${this.count}条数据`)
      this.totalPage ++
      paramsObject.__EVENTARGUMENT = this.totalPage
      this.ajaxData = Object.assign(this.ajaxData, paramsObject)
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
      this.saveDB(tableArray)
    })
    .catch(err=>{
      log.error('狗带了')
      clearInterval(this.normalLoop)
    })
  }, 5000);

 }

 async saveDB(source){
  mysql.openConnection()
  mysql.batchInsert(source)
 }
}