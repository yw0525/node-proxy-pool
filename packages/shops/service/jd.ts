export const grabShops = async (params: ProcessParams) => {
  const getRandom = (start: number, end: number) =>
    Math.floor(Math.random() * (end - start + 1) + start)

  const delaySync = (ms: number) =>
    new Promise<void>(resolve => {
      setTimeout(() => resolve(), ms)
    })

  const jsonpRequest = async (url: string, params: Params): Promise<any> => {
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

  const _grabShops = async (ans: ShopAnswer, page: number) => {
    const { page_count } = ans

    if (page_count && page_count < page) return

    const isFirstPage = page === 1

    console.log(`${brand}-${isFirstPage ? `start` : `${page_count} ${page}`}`)

    const searchUrl = `https://wqsou.jd.com/shopsearch/mshopsearch`
    const vendarData: VendarData = await jsonpRequest(searchUrl, {
      key: brand,
      callback: 'jdSearchShopResultCbA',
      sort_type: 'sort_mobile_shop_desc',
      pagesize: '20',
      page,
      appCode: 'msc588d6d5'
    })

    if (isFirstPage) {
      const { summary } = vendarData
      const {
        page: { page_count },
        shop_count
      } = summary

      ans.page_count = page_count
      ans.total = shop_count
      ans.data = []
    }

    const shopsUrl = `https://wq.jd.com/mshop/BatchGetShopInfoByVenderId`
    const codeStr = vendarData.shops.map((item: VendarItem) => item.vender_id)

    const { data } = await jsonpRequest(shopsUrl, {
      callback: 'shopInfoCbA',
      appCode: 'msc588d6d5',
      venderIds: codeStr
    })

    ans.data?.push(...data)

    const delay = getRandom(3, 8) * 100

    console.log(`delay ${delay}ms`)

    await delaySync(delay)

    await _grabShops(ans, page + 1)

    return ans
  }

  return await _grabShops({}, 1)
}

export const grabGoods = async (params: ProcessParams) => {
  const getRandom = (start: number, end: number) =>
    Math.floor(Math.random() * (end - start + 1) + start)

  const delaySync = (ms: number) =>
    new Promise<void>(resolve => {
      setTimeout(() => resolve(), ms)
    })

  const jsonpRequest = async (url: string, params: Params): Promise<any> => {
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

  const { shopId, shopName } = params

  const _grabGoods = async (ans: GoodsAnswer, page: number) => {
    const { page_count } = ans

    if (page_count && page_count < page) return

    const isFirstPage = page === 1

    console.log(`${shopId}-${shopName} ${isFirstPage ? `start` : `${page_count} ${page}`}`)

    const goodsUrl = `https://wqsou.jd.com/search/searchjson`
    const goodsData: GoodsData = await jsonpRequest(goodsUrl, {
      datatype: '1',
      page,
      pagesize: '200',
      merge_sku: 'no',
      qp_disable: 'yes',
      key: `ids,,${shopId}`,
      _fd: 'jx',
      _: '1664688571065',
      g_login_type: '0',
      callback: 'jsonpCBKK',
      g_ty: 'ls',
      sceneval: '2',
      appCode: 'msc588d6d5'
    })

    const { Head, Paragraph } = goodsData.data.searchm

    if (isFirstPage) {
      const { Page, ResultCount } = Head.Summary
      const { PageCount } = Page

      ans.page_count = PageCount
      ans.total = ResultCount
      ans.data = []
    }

    ans.data?.push(...Paragraph)

    const delay = getRandom(3, 8) * 100

    console.log(`delay ${delay}ms`)

    await delaySync(delay)

    await _grabGoods(ans, page + 1)

    return ans
  }

  return await _grabGoods({}, 1)
}
