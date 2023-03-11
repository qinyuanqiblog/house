const fs = require('fs');
const https = require('https')
const axiosRequest = require('./utils/request');

// 这是一个axios实例
axiosRequest.get('https://media.w3.org/2010/05/sintel/trailer.mp4', {
  responseType: 'stream'
}).then(response => {
  // 返回头里面的content-length字段，会告诉我们这个视频有多大
  //  获取视频总长度 byte为单位
  const totalLength = response.headers['content-length']
  // 当前数据的总长度
  let totalChunkLength = 0
  // 当前读取的流
  const readSteam = response.data

  // 读取流会触发的事件
  readSteam.on('data', (chunk) => {
      totalChunkLength += chunk.length
      console.log('数据传输中，当前进度==>', ((totalChunkLength / totalLength) * 100).toFixed(2) + '%')
  });
  // 读取完成的时间
  readSteam.on('end', (chunk) => {
      console.log('获取远端数据完毕')
  });
  // 读取错误会触发的事件
  readSteam.on('error', (err) => {
      console.log('获取远端数据完毕，发生了错误,错误信息==>', err)
  });

  // 写入本地的文件名
  const fileName = `67.mp4`
  // 调用nodejs写入文件方法
  const writeFile = readSteam.pipe(fs.createWriteStream(fileName))
  // 写入完成事件
  writeFile.on("finish", () => {
        writeFile.close();
        console.log("恭喜大哥，本地数据写入完成");
    });
  // 写入错误触发的事件
  writeFile.on("error", (err) => {
      console.log("不好意思，写入本地文件发生异常，错误信息==>", err);
  });
});
