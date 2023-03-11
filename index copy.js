const puppeteer = require('puppeteer');
const fs = require('fs');

const axiosRequest = require('./utils/request');
const Log = require('./utils/log');

const log = new Log()

class Reptile {
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
    this.waiteTime = waiteTime;
    // excel文件名
    this.excelFileName = excelFileName;
    // 所有的源数据合集
    this.totalUrlList = []
    // 下载成功的地址合集
    this.uploadSuccessArray = []
    // 下载失败的地址合集
    this.uploadFailArray = []

    this.arrayUserAgent = ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.3']
  }

  init() {

  }
  async initPuppeteer() {
    const browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();
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
      return {
        url: v.getAttribute('src'),
        name: i + 1 < 10 ? `0${i}集` : `${i}集`
      }
    }));
    log.info(`成功获取播放列表，总共${urlList.length}集`)

    urlList.map(v => {
      const promise = new Promise(async (resolve, reject) => {
        try {
          const page = await browser.newPage();
          // 随机获取一个userAgent
          const itemAgent = this.arrayUserAgent[Math.floor(Math.random() * this.arrayUserAgent.length)];
          // 随便设置个ua,伪装成一个良民
          await page.setUserAgent(itemAgent);
          await page.goto(v.url);
          log.info(`休息${waiteTime}s, 等待页面加载完毕，才能干活~`)
          await page.waitForTimeout(waiteTime)
          // 获取资源地址
          const MacPlayer = await page.evaluate(async () => {
            // await window.MacPlayer;
            return window.MacPlayer
          });
          const remoteUrl = MacPlayer.Parse + MacPlayer.PlayUrl
          log.info('成功获取到解析地址==>', remoteUrl);
          page.close()

          log.info('开始新开一个页面去获取资源地址~')
          const newPage = await browser.newPage();
          // 随便设置个ua,伪装成一个良民
          await newPage.setUserAgent(itemAgent);
          await newPage.goto(remoteUrl);
          log.info('等待2s，让浏览器加载完毕之后，再做后续操作');
          await newPage.waitForTimeout(waiteTime)
          // 获取目标资源的地址
          const src = await newPage.evaluate('document.querySelector("#lelevideo").getAttribute("src")')
          log.info('成功获取到视频源地址==>', src)
          newPage.close()
          resolve(src)
        } catch (error) {
          reject(err)
        }
      })
      return promise
    })


    Promise.all(urlList).then(res => {
      log.success(`获取资源成功`, res)
    }).catch(err => {
      log.error(`获取资源失败，错误信息=>`, err)
    })

    // 关闭浏览器实例
    await browser.close();

  }
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true
  });

  const page = await browser.newPage();
  // 随便设置个ua,伪装成一个良民
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.3');
  await page.goto('http://www.6dm.cc/play/993-1-1.html');
  // 等待两秒
  // await page.waitForTimeout(2000)
  // .then(() => console.log('Waited a second!'));
  const MacPlayer = await page.evaluate(async () => {
    // await window.MacPlayer;
    return window.MacPlayer
  });
  const remoteUrl = MacPlayer.Parse + MacPlayer.PlayUrl
  console.log('成功获取到解析地址==>', remoteUrl)
  const newPage = await browser.newPage();
  // 随便设置个ua,伪装成一个良民
  await newPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.3');
  await newPage.goto(remoteUrl);
  console.log('等待2s，让浏览器加载完毕之后，再做后续操作')
  await newPage.waitForTimeout(3000)
  const src = await newPage.evaluate('document.querySelector("#lelevideo").getAttribute("src")')
  console.log('成功获取到视频源地址==>', src)




  //  axiosRequest.get(src, {
  axiosRequest.get('https://media.w3.org/2010/05/sintel/trailer.mp4', {
    responseType: 'stream'
  }).then(res => {

    // var bate = new Buffer.from('');

    // res.on('data', (chunk) => {
    //       bate = Buffer.concat([bate,chunk]);
    //       console.log(bate.length)
    //       fs.appendFileSync("1.mp4",chunk, (error)  => {
    //           if (error) return console.log("追加文件失败" + error.message);
    //           console.log("追加成功");
    //       });
    //   });
    //   res.on('end', () => {
    //     try {
    //       fs.writeFileSync('11.mp4', bate);  // 可删除
    //     } catch (e) {
    //       console.error(e.message);
    //     }
    //   });

    const file = res.data.pipe(fs.createWriteStream(`65.mp4`))
    file.on("finish", () => {
      file.close();
      console.log("Download Completed");
    });
    file.on("data", (chunk) => {
      console.log(`Received ${chunk.length} bytes of data.`);
    });
    file.on("error", (err) => {
      console.log("Download fail", err);
    });


    // 下载视频 已经验证过是可以的
    // const file = fs.createWriteStream("99.mp4");
    // https.get(src, function(response) {
    //    response.pipe(file);

    //    // after download completed close filestream
    //    file.on("finish", () => {
    //        file.close();
    //        console.log("Download Completed");
    //    });
    //    file.on("pipe", () => {
    //        console.log("Download start");
    //    });
    //    file.on("error", (err) => {
    //        console.log("Download fail", err);
    //    });

  });


  // 关闭浏览器实例
  await browser.close();
})();