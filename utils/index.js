/**
 * 获取指定范围内的随机数
 * @param {number} start 开始的数
 * @param {number} end   结束的数
 */
 function getRandomNumber(start, end) {
  return Math.floor(Math.random() * (end - start) + start);
 }
/**
 * 秒转化成 时分秒
 * @param {number} result 总秒数
 * @return {string}       转化好后的时分秒
 */
function secondToDate(result) {
  var h = Math.floor(result / 3600);
  var m = Math.floor((result / 60 % 60));
  var s = Math.floor((result % 60));
  return result = h + "小时" + m + "分钟" + s + "秒";
}
 
 /**
  * 把一个数组变成多个数组
  * @param {array}  array            源数据
  * @param {number} subGroupLength   一组数据有多个
  * @copyFrom https://segmentfault.com/q/1010000004921251
  */
 function groupBy(array, subGroupLength) {
  var index = 0
  var newArray = []
  while (index < array.length) {
    newArray.push(array.slice(index, (index += subGroupLength)))
  }
  return newArray
 }
 
 function differenceBy (a, b, fn)  {
   const s = new Set(b.map(fn));
   return a.map(fn).filter(el => !s.has(el));
 };
 
 const uniqueElementsBy = (arr, fn) =>
   arr.reduce((acc, v) => {
     if (!acc.some(x => fn(v, x))) acc.push(v);
     return acc;
   }, []);
 
 
   const difference = (a, b) => {
     const s = new Set(b);
     return a.filter(x => !s.has(x));
   };
   const pullBy = (arr, ...args) => {
     const length = args.length;
     let fn = length > 1 ? args[length - 1] : undefined;
     fn = typeof fn == 'function' ? (args.pop(), fn) : undefined;
     let argState = (Array.isArray(args[0]) ? args[0] : args).map(val => fn(val));
     let pulled = arr.filter((v, i) => !argState.includes(fn(v)));
     arr.length = 0;
     pulled.forEach(v => arr.push(v));
   };
 
 module.exports ={ 
  getRandomNumber,
  groupBy,
  differenceBy,
  uniqueElementsBy,
  difference,
  pullBy,
  secondToDate,
 }