// 导出
import request from '@/utils/request'

// 查询导出
export const getPageInfo = (data, headers) => {
  return request({
    url: `http://zjj.sz.gov.cn/ris/bol/szfdc/index.aspx`,
    method: 'post',
    data,
    headers,
  })
}

