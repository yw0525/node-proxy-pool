export enum CRAWLER_TYPE {
  JD = 'jd',
  TB = 'taobao'
}

export const CRAWLER_URL = {
  [CRAWLER_TYPE.JD]: 'https://wqs.jd.com',
  [CRAWLER_TYPE.TB]: 'https://main.m.taobao.com'
}
