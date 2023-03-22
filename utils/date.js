/**
 * 日期格式转换
 * @param  {string|number} date           字符串或者数字，别的不要传哦
 * @param  {boolean}       isHaveDefault  是否需要设置默认值，
 * @return {Date}                         处理成一个date对象，方便formatDateBy方法调用
 */
const dateFormatHandle = (date, isHaveDefault = false) => {
  if (!date && !isHaveDefault) {
    return ''
  }
  if (!date) {
    return new Date()
  }
  if (typeof date === 'string') {
    // 兼容 2020-10-03 10:33:23 在苹果中无法解析的情况
    var arr = date.split(/[- / :]/)
    if (arr.length === 3) {
      return new Date(arr[0], arr[1] - 1, arr[2])
    } else if (arr.length === 6) {
      return new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5])
    } else {
      console.error('没有处理的方式~')
      return false
    }
  }
  if (typeof date === 'number') {
    return new Date(date)
  }
  return date
}
/**
 * 将日期格式化成指定格式的字符串
 * @param {string|number} date 要格式化的日期，不传时默认当前时间，也可以是一个时间戳
 * @param {string}        fmt  目标字符串格式，支持的字符有：y,M,d,q,w,H,h,m,S，默认：yyyy-MM-dd HH:mm:ss
 * @return {string}            返回格式化后的日期字符串
 */
const formatDateBy = (date, fmt = 'yyyy-MM-dd HH:mm:ss') => {
 date = dateFormatHandle(date, true)
 var obj = {
   y: date.getFullYear(), // 年份，注意必须用getFullYear
   M: date.getMonth() + 1, // 月份，注意是从0-11
   d: date.getDate(), // 日期
   q: Math.floor((date.getMonth() + 3) / 3), // 季度
   w: date.getDay(), // 星期，注意是0-6
   H: date.getHours(), // 24小时制
   h: date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, // 12小时制
   m: date.getMinutes(), // 分钟
   s: date.getSeconds(), // 秒
   S: date.getMilliseconds() // 毫秒
 }
 var week = ['天', '一', '二', '三', '四', '五', '六']
 for (var i in obj) {
   fmt = fmt.replace(new RegExp(i + '+', 'g'), function(m) {
     var val = obj[i] + ''
     if (i === 'w') return (m.length > 2 ? '星期' : '周') + week[val]
     for (var j = 0, len = val.length; j < m.length - len; j++) val = '0' + val
     return m.length === 1 ? val : val.substring(val.length - m.length)
   })
 }
 return fmt
}

/**
 * 获取指定时间内的日期
 * 网上抄的，具体那个网址忘了
 * @param {number}  day 要格式化的日期，不传时默认当前时间，也可以是一个时间戳
 * @returns 返回格式化后的日期字符串
 */
function getDay(day) {
 // Date()返回当日的日期和时间。
 var days = new Date()
 // getTime()返回 1970 年 1 月 1 日至今的毫秒数。
 var gettimes = days.getTime() + 1000 * 60 * 60 * 24 * day
 // setTime()以毫秒设置 Date 对象。
 days.setTime(gettimes)
 var year = days.getFullYear()
 var month = days.getMonth() + 1
 if (month < 10) {
   month = '0' + month
 }
 var today = days.getDate()
 if (today < 10) {
   today = '0' + today
 }
 return year + '-' + month + '-' + today
}

/**
 * 获取当月有多少天
 * @param   {string} date   日期
 * @example  console.log(getDuration('2020-05-25'))//31
 * @copyFrom https://blog.csdn.net/weixin_44592912/article/details/106341843
 * @returns {number} day    当月总天数
 */
function getCurrentMonthDays(date = '') {
 const dt = (date && new Date(date)) || new Date()
 var month = dt.getMonth()
 dt.setMonth(dt.getMonth() + 1)
 dt.setDate(0)
 return dt.getDate()
}

 /**
  * 算出前一天
  * @copyFrom  https://www.30secondsofcode.org/js/s/yesterday
  */
function  yesterday(date) {
  // const d = (typeof date === 'string' && new Date(date)) || date
  const d = new Date(date)
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

// 距离当前日期多少天后的日期
// copyFrom: https://www.30secondsofcode.org/js/s/add-days-to-date
const addDaysToDate = (date, n) => {
 const d = date
 d.setDate(d.getDate() + n)
 return d.toISOString().split('T')[0]
}

module.exports = {
  dateFormatHandle,
  formatDateBy,
  getDay,
  getCurrentMonthDays,
  yesterday,
  addDaysToDate,
}