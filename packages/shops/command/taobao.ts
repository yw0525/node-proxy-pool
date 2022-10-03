import fs from 'node:fs'
import path from 'node:path'
import puppeteer, { Page, Browser } from 'puppeteer'

import { createFile } from '../../shared/tools'

const createBrowser = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true
  })

  return browser
}

module.exports = async (params: CommandParams) => {
  const {
    brands,
    paths: { pre_params_shops_perfix, pre_params_shops_record, data_goods_prefix },
    tools: { getRecord, print }
  } = params

  const { grabShops, grabGoods } = require(`../service/taobao`)

  // grab shops
  const shops_crawler = async (browser: Browser) => {
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

        const page = await browser.newPage()

        await page.goto(`https://main.m.taobao.com/search/index.html?pageType=4&q=${brand}`)

        // const { total, data } = await page.evaluate(grabShops, { brand })
        await page.evaluate(grabShops, { brand })

        page.close()

        // basePrint(`${brand} ${total} ${data.length}`)

        record.add(brand)

        // createFile(shopFile, data)
        // createFile(pre_params_shops_record, [...record], true)
      } catch (error) {
        console.log(error)
      }
    }

    basePrint('finished')
  }

  const browser = await createBrowser()

  await shops_crawler(browser)

  await browser.close()
}
