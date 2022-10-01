type Params = {
  [key in string]: any
}

type Answer = {
  max_page?: number
  total?: number
  data?: any[]
}

module.exports = async (params: Params) => {
  const getRandom = (start: number, end: number) =>
    Math.floor(Math.random() * (end - start + 1) + start)

  const delaySync = (ms: number) =>
    new Promise<void>(resolve => {
      setTimeout(() => resolve(), ms)
    })

  const jsonpRequest = async (url: string, params: any): Promise<any> => {
    const { callback } = params

    const scriptUrl = `${url}?${new URLSearchParams(params).toString()}`

    return new Promise(resolve => {
      const oScript = document.createElement('script')

      oScript.src = scriptUrl

      document.body.appendChild(oScript)
      document.body.removeChild(oScript)

      window[callback as string] = (data: any) => {
        resolve(data)
      }
    })
  }

  const { brand } = params

  const getShops = async (ans: Answer, page: number) => {
    const { max_page } = ans

    if (max_page && max_page < page) return

    if (max_page) {
      const delay = getRandom(3, 8) * 100

      console.log(`delay ${delay}ms`)

      await delaySync(delay)

      console.log(`${brand}-${max_page}-${page}`)
    } else {
      console.log(`${brand}-start-${page}`)
    }

    const searchUrl = `https://wqsou.jd.com/shopsearch/mshopsearch`
    const vendarData: any = await jsonpRequest(searchUrl, {
      key: brand,
      callback: 'jdSearchShopResultCbA',
      sort_type: 'sort_mobile_shop_desc',
      pagesize: '20',
      page,
      appCode: 'msc588d6d5'
    })

    if (page === 1) {
      const { summary } = vendarData
      const {
        page: { page_count },
        shop_count
      } = summary

      ans.max_page = page_count
      ans.total = shop_count
      ans.data = []
    }

    const shopsUrl = `https://wq.jd.com/mshop/BatchGetShopInfoByVenderId`
    const codeStr = vendarData.shops.map((item: any) => item.vender_id)

    const { data } = await jsonpRequest(shopsUrl, {
      callback: 'shopInfoCbA',
      appCode: 'msc588d6d5',
      venderIds: codeStr
    })

    if (ans.data) {
      ans.data.push(...(data as any[]))
    }

    await getShops(ans, page + 1)

    return ans
  }

  return await getShops({}, 1)
}
