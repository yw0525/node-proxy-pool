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
    const isFirstPage = page === 1

    console.log(`${brand}-${isFirstPage ? `start` : ` ${page}`}`)

    const searchUrl = `https://h5api.m.taobao.com/h5/mtop.relationrecommend.wirelessrecommend.recommend/2.0/`
    const shopData = await jsonpRequest(searchUrl, {
      jsv: '2.6.1',
      appKey: '12574478',
      sign: '97a852f48f78efdfee7c8ffc697bdb2b',
      api: 'mtop.relationrecommend.WirelessRecommend.recommend',
      v: '2.0',
      H5Request: 'true',
      preventFallback: 'true',
      type: 'jsonp',
      dataType: 'jsonp',
      callback: 'mtopjsonp2',
      // data: new URLSearchParams({
      //   appId: '30486',
      //   params: new URLSearchParams({
      //     chituGroupAlias: 'zhouzhou_liantiao_final',
      //     _viewlogs: 'true',
      //     viewlogs: 'true',
      //     debug_: 'true',
      //     solutionDebug: 'true',
      //     _debug: 'true',
      //     dcEnable: 'true',
      //     _switchers: 'true',
      //     _blendInfos: 'true',
      //     routerDebug: 'true',
      //     _DEBUG: 'true',
      //     debug: 'true',
      //     debug_rerankNewOpenCard: 'false',
      //     DEBUG: 'true',
      //     DEBUG_: 'true',
      //     viewlogs_: 'true',
      //     pvFeature:
      //       '654083998634;644832834668;668084343069;662334090942;665339768743;664390297378;664047381602',
      //     tab: 'shop',
      //     grayHair: 'false',
      //     sversion: '13.7',
      //     from: 'input',
      //     isBeta: 'false',
      //     brand: 'HUAWEI',
      //     info: 'wifi',
      //     client_for_bts: 'client_android_view_preload:1000001',
      //     ttid: '600000@taobao_android_10.8.0',
      //     rainbow: '',
      //     areaCode: 'CN',
      //     vm: 'nw',
      //     elderHome: 'false',
      //     style: 'list',
      //     page: 2,
      //     device: 'HMA-AL00',
      //     editionCode: 'CN',
      //     cityCode: '110100',
      //     countryNum: '156',
      //     newSearch: 'false',
      //     chituBiz: 'TaobaoPhoneSearch',
      //     utd_id: 'XYDZLfLy3ZQDAKmnYOhvIwW4'
      //   } as Params)
      data: `{"appId":"30486","params":"{"chituGroupAlias":"zhouzhou_liantiao_final","_viewlogs":"true","viewlogs":"true","debug_":"true","solutionDebug":"true","_debug":"true","dcEnable":"true","_switchers":"true","_blendInfos":"true","routerDebug":"true","_DEBUG":"true","debug":"true","debug_rerankNewOpenCard":"false","DEBUG":"true","DEBUG_":"true","viewlogs_":"true","pvFeature":"654083998634;644832834668;668084343069;662334090942;665339768743;664390297378;664047381602","tab":"shop","grayHair":"false","sversion":"13.7","from":"input","isBeta":"false","brand":"HUAWEI","info":"wifi","client_for_bts":"client_android_view_preload:1000001","ttid":"600000@taobao_android_10.8.0","rainbow":"","areaCode":"CN","vm":"nw","elderHome":"false","style":"list","page":2,"device":"HMA-AL00","editionCode":"CN","cityCode":"110100","countryNum":"156","newSearch":"false","chituBiz":"TaobaoPhoneSearch","utd_id":"XYDZLfLy3ZQDAKmnYOhvIwW4","n`
      // } as Params).toString()
    })

    if (isFirstPage) {
      ans.page_count = page
    }

    console.log(shopData, '222222222222222222222222222222')

    const delay = getRandom(3, 8) * 100

    console.log(`delay ${delay}ms`)

    await delaySync(delay)

    // await _grabShops(ans, page + 1)

    return ans
  }

  return await _grabShops({}, 1)
}
