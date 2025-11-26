const app = getApp()
const BASE_URL = app.globalData.baseUrl;
function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        resolve(res.data);
      },
      fail: (err) => {
        uni.showToast({ title: '网络请求失败', icon: 'none' });
        reject(err);
      }
    });
  });
}

/**
 * 获取旅行社列表
 */
export function getTravelAgencies() {
  return request({ url: '/api/data', method: 'POST', data: {} });
}

/**
 * 获取账单列表（按旅行社名称和时间）
 */
export function getLedgerList(params) {
  return request({
    url: '/api/ledger',
    method: 'POST',
    data: params
  });
}
/**
 * 获取账单明细（按旅行社名称和时间）
 */
export function getLedgerDetails(params) {
  return request({
    url: '/api/ledgerdetails',
    method: 'POST',
    data: params
  });
}
/**
 * 获取导游财务明细（按旅行社名称和时间）
 */
export function getStatistics(params) {
  return request({
    url: '/api/financial/statistics',
    method: 'POST',
    data: params
  });
}
/**
 * 获取首页数据
 */
export function getIndex(params) {
  return request({
    url: '/api/total',
    method: 'POST',
    data: params
  });
}
/**
 * 获取首页列表数据
 */
export function getIndexList(params) {
  return request({
    url: '/api/tasklist',
    method: 'POST',
    data: params
  });
}
