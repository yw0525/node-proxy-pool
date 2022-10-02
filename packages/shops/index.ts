import fs from 'node:fs'
import path from 'node:path'
import minimist from 'minimist'
import puppeteer, { Page } from 'puppeteer'

import { readCsvFile } from '../shared/csv'
import { CRAWLER_TYPE, CRAWLER_URL } from './config/config'
import { createDir, createFile } from '../shared/tools'

const Task = (() => {
  const { name } = minimist(process.argv.slice(2))

  const prefix = path.resolve(process.cwd(), 'packages/shops')

  const data_prefix = path.resolve(prefix, 'data')

  const pre_params_prefix = path.resolve(prefix, 'pre-params')
  const stores_perfix = path.resolve(pre_params_prefix, `${name}_stores`)

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
    createDir(stores_perfix)
  }

  const print = (prefix: string) => (str: string | number) => console.log(`${prefix}${str}`)

  const shops_crawler = async (page: Page) => {
    const brands = getBrandsData()

    const recordFile = path.resolve(pre_params_prefix, `${name}_record.json`)
    const record = new Set(getRecord(recordFile))

    let total = brands.length - record.size

    const basePrint = print(`crawler: `)

    basePrint('-------------------------------')
    basePrint(`total ${total}`)

    for (const brand of brands) {
      if (record.has(brand)) continue

      basePrint('-------------------------------')

      basePrint(`${brand} ${total--}`)

      try {
        const shopFile = path.resolve(stores_perfix, `${brand}.json`)

        const { total, data } = await page.evaluate(grabShops, { brand })

        basePrint(`${brand} ${total} ${data.length}`)

        record.add(brand)

        createFile(shopFile, data)
        createFile(recordFile, [...record], true)
      } catch (error) {
        console.log(error)
      }
    }

    basePrint('finished')
  }

  const goods_crawler = async (page: Page) => {
    const brands = getBrandsData()

    let total = brands.length

    const basePrint = print(`crawler: `)

    basePrint('-------------------------------')

    basePrint(`total ${total}`)

    let count = 0
    let relatedCount = 0

    for (const brand of brands.slice(0, 2)) {
      basePrint('-------------------------------')

      const shopFile = path.resolve(stores_perfix, `${brand}.json`)
      const shopData: ShopItem[] = JSON.parse(fs.readFileSync(shopFile, 'utf-8'))

      const processData = shopData.filter(item => item.shopInfo.shopName.includes(brand))

      count += shopData.length
      relatedCount += processData.length

      basePrint(`${brand} ${total--}`)

      for (const shop of processData) {
        const {
          shopId,
          shopInfo: { shopName }
        } = shop

        basePrint(`${brand} ${shopId} ${shopName}`)

        try {
          const data = await page.evaluate(grabGoods, { shopId })
        } catch (error) {}
      }
    }

    basePrint('-------------------------------')

    basePrint(`${count} ${relatedCount}`)
    basePrint('finished')
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

    await shops_crawler(page)
    await goods_crawler(page)

    await browser.close()
  }

  return {
    init
  }
})()

Task.init()
