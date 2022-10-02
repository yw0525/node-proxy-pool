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
