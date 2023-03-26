# puppeteer + cheerio + mysql 模拟用户去爬取一个aspx网站

## 最终效果

![效果图](https://api2.mubu.com/v3/document_image/f6962e12-283b-47e8-831d-b29ea553c618-2331693.jpg)


## 使用方法

- 下载项目
- 更新依赖
- 导入sql文件
- 更改数据库地址和帐号密码： mysql文件
- 执行命令  node index

```shell
git clone https://github.com/qinyuanqiblog/house.git
```

```shell
npm install
```

``db
我的设计里面是有一个数据库: house_info, 请自己先创建一个数据库
```

```js
 // mysql.js  修改成自己本地的
 const connection = this.mysql.createConnection({
  host     : 'localhost',	//连接的数据库地址。（默认:localhost）
  user     : 'root',		//mysql的连接用户名
  password : 'root',		// 对应用户的密码
  port: '3306',
 });
```


```shell
node index
```

## 更新记录

* 2023-03-22：🎉🎉 初始化项目，模拟用户去爬取一手房信息

## 思路

[puppeteer + cheerio + mysql 模拟用户去爬取一个aspx网站-思否](https://segmentfault.com/a/1190000043572279)

[puppeteer + cheerio + mysql 模拟用户去爬取一个aspx网站-幕布](https://www.mubucm.com/doc/79m-i0n46rt)