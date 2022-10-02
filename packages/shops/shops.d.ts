type Params = {
  [key in string]: any
}

type ProcessParams = {
  brand: string
  shopId: string
  shopName: string
}

// -----------------------------------
type ShopAnswer = {
  page_count?: number
  total?: number
  data?: ShopItem[]
}

type BrandItem = {
  brand_name: string
}
type Brands = BrandItem[]

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

// -----------------------------------
type GoodsAnswer = {
  page_count?: number
  total?: number
  data?: GoodItem[]
}

type HeadInfo = {
  Summary: {
    Page: {
      PageCount: number
      PageIndex: number
      PageSize: number
    }
    ResultCount: number
  }
}

type GoodItem = {
  Content: {
    author: string
    imageurl: string
    warename: string
    CustomAttrList: string
  }
  dredisprice: string
  shop_id: string
  vender_id: string
  wareid: string
}

type SearchChm = {
  Head: HeadInfo
  Paragraph: GoodItem[]
}

type GoodsData = {
  retcode: string
  errmsg: string
  data: {
    searchm: SearchChm
  }
}
