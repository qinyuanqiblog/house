const axios = require('axios')

// 创建axios实例
const service = axios.create({
 baseURL: '', // api 的 base_url
 // 永不凋谢，真男人 就是这么持久 😄😄
 timeout: 90000000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
 config => {

   return config
 },
 error => {
   // Do something with request error
   console.log(error) // for debug
   Promise.reject(error)
 }
)

// 响应拦截器
service.interceptors.response.use(
 response => {
   
     return response
 },
 error => {
     return Promise.reject(error)
 }
)


module.exports = service