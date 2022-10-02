import fs from 'node:fs'
import path from 'node:path'
import minimist from 'minimist'
import puppeteer, { Page } from 'puppeteer'

import { readCsvFile } from '../shared/csv'
import { CRAWLER_TYPE, CRAWLER_URL, START_TIME } from './config/config'
import { createDir, createFile, getTimeStr } from '../shared/tools'

const Task = (() => {
  const { name } = minimist(process.argv.slice(2))

  const prefix = path.resolve(process.cwd(), 'packages/shops')

  const pre_params_prefix = path.resolve(prefix, 'pre-params')
  const pre_params_shops_perfix = path.resolve(pre_params_prefix, `${name}_shops`)
  const pre_params_shops_record = path.resolve(pre_params_prefix, `${name}_record.json`)

  const data_prefix = path.resolve(prefix, 'data')
  const data_goods_prefix = path.resolve(data_prefix, `${name}_${getTimeStr(START_TIME)}`)

  const { grabShops, grabGoods } = require(`./service/${name}`)

  const getBrandsData = (): string[] => {
    const brandsStr = fs.readFileSync(path.resolve(pre_params_prefix, 'brands.csv'), 'utf8')
    const brands: Brands = readCsvFile(brandsStr)

    if (Array.isArray(brands)) return brands.map(item => item.brand_name)

    return []
  }

  const getRecord = (file: string): string[] => {
    let record: string[] = []

    if (fs.existsSync(file)) {
      record = JSON.parse(fs.readFileSync(file, 'utf8'))
    }

    return record
  }

  const beforeCreate = () => {
    createDir(data_prefix)
    createDir(data_goods_prefix)
    createDir(pre_params_shops_perfix)
  }

  const print = (prefix: string) => (str: string | number) => console.log(`${prefix}${str}`)

  // grab shops
  const shops_crawler = async (page: Page) => {
    const brands = getBrandsData()

    createFile(pre_params_shops_record, [])

    const record = new Set(getRecord(pre_params_shops_record))

    let total = brands.length - record.size

    const basePrint = print(`crawler: `)

    basePrint('-------------------------------')
    basePrint(`total ${total}`)

    for (const brand of brands) {
      if (record.has(brand)) continue

      basePrint('-------------------------------')

      basePrint(`${brand} ${total--}`)

      try {
        const shopFile = path.resolve(pre_params_shops_perfix, `${brand}.json`)

        const { total, data } = await page.evaluate(grabShops, { brand })

        basePrint(`${brand} ${total} ${data.length}`)

        record.add(brand)

        createFile(shopFile, data)
        createFile(pre_params_shops_record, [...record], true)
      } catch (error) {
        console.log(error)
      }
    }

    basePrint('finished')
  }

  // grab goods
  const goods_crawler = async (page: Page) => {
    const brands = getBrandsData()

    let total = brands.length

    const basePrint = print(`crawler: `)

    basePrint('-------------------------------')

    basePrint(`total ${total}`)

    let count = 0
    let relatedCount = 0

    for (const brand of brands) {
      basePrint('-------------------------------')

      const shopFile = path.resolve(pre_params_shops_perfix, `${brand}.json`)
      const shopData: ShopItem[] = JSON.parse(fs.readFileSync(shopFile, 'utf-8'))

      const processData = shopData.filter(item => item.shopInfo.shopName.includes(brand))

      count += shopData.length
      relatedCount += processData.length

      basePrint(`${total} ${brand} ${processData.length}`)

      for (const shop of processData) {
        const {
          shopId,
          shopInfo: { shopName }
        } = shop

        const data_goods_record = path.resolve(`${data_goods_prefix}_record.json`)

        createFile(data_goods_record, [])

        const record = new Set(getRecord(data_goods_record))

        if (record.has(shopId)) continue

        const goodsFile = path.resolve(data_goods_prefix, `${brand}_${shopId}.json`)

        try {
          const { total, data } = await page.evaluate(grabGoods, { shopId, shopName })

          basePrint(`${shopId} ${shopName} ${total} ${data.length}`)

          record.add(shopId)

          // //img11.360buyimg.com/cms/
          createFile(goodsFile, data)
          createFile(data_goods_record, [...record], true)
        } catch (error) {
          console.log(error)
        }
      }
    }

    basePrint('-------------------------------')

    basePrint(`finished ${count} ${relatedCount}`)
  }

  const init = async () => {
    beforeCreate()

    const browser = await puppeteer.launch({
      headless: false,
      devtools: true
    })

    const page = await browser.newPage()

    const url = CRAWLER_URL[name as CRAWLER_TYPE]

    await page.goto(url)

    // await shops_crawler(page)
    await goods_crawler(page)

    await browser.close()
  }

  return {
    init
  }
})()

Task.init()
