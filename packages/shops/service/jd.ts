type Params = {
  [key in string]: any
}

type ProcessParams = {
  brand: string
}

type Answer = {
  page_count?: number
  total?: number
  data?: ShopItem[]
}

type VendarItem = {
  vender_id: string
}

type VendarData = {
  summary: {
    page: {
      page_count: number
    }
    shop_count: number
  }
  shops: VendarItem[]
}

type SecoundCatge = {
  cateId: string
  cateName: string
}

type ShopItem = {
  banner: string
  latestBanner: string
  shopEnterHotCateId1: string
  shopEnterHotCateId2: string
  shopEnterHotCateId3: string
  shopEnterHotCateName1: string
  shopEnterHotCateName2: string
  shopEnterHotCateName3: string
  shopId: string
  shopUrl: string
  shopInfo: {
    venderId: string
    brief: string
    isJxzy: string
    isZy: string
    shopName: string
    goodsNum: string
    shopFansNum: string
  }
  shopSecondCate: SecoundCatge[]
  userEvaluateScore: string
}

export const getShops = async (params: ProcessParams) => {
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

  const getShops = async (ans: Answer, page: number) => {
    const { page_count } = ans

    if (page_count && page_count < page) return

    if (page_count) {
      const delay = getRandom(3, 8) * 100

      console.log(`delay ${delay}ms`)

      await delaySync(delay)

      console.log(`${brand}-${page_count}-${page}`)
    } else {
      console.log(`${brand}-start-${page}`)
    }

    const searchUrl = `https://wqsou.jd.com/shopsearch/mshopsearch`
    const vendarData: VendarData = await jsonpRequest(searchUrl, {
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

    if (ans.data) {
      ans.data.push(...data)
    }

    await getShops(ans, page + 1)

    return ans
  }

  return await getShops({}, 1)
}

export const getData = () => {}
