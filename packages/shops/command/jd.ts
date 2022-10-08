import fs from 'node:fs'
import path from 'node:path'
import puppeteer, { Page } from 'puppeteer'

import { createFile } from '../../shared/tools'

module.exports = async (params: CommandParams) => {
  const {
    brands,
    paths: { pre_params_shops_perfix, pre_params_shops_record, data_goods_prefix },
    tools: { getRecord, print }
  } = params

  const { grabShops, grabGoods } = require(`../service/jd`)

  // grab shops
  const shops_crawler = async (page: Page) => {
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

      basePrint(`${total--} ${brand} ${processData.length}`)

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

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true
  })

  const page = await browser.newPage()

  await page.goto('https://wqs.jd.com')

  // await shops_crawler(page)
  await goods_crawler(page)

  await browser.close()
}
