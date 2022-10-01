import fs from 'node:fs'
import path from 'node:path'
import minimist from 'minimist'
import puppeteer from 'puppeteer'

import { readCsvFile } from '../shared/csv'
import { CRAWLER_TYPE, CRAWLER_URL } from './config/config'
import { createDir, createFile } from '../shared/tools'

const { name } = minimist(process.argv.slice(2))

const Task = (() => {
  const prefix = path.resolve(process.cwd(), 'packages/shops')

  const data_prefix = path.resolve(prefix, 'data')

  const pre_params_prefix = path.resolve(prefix, 'pre-params')
  const stores_perfix = path.resolve(pre_params_prefix, `${name}_stores`)

  const getBrandsData = () => {
    const brandsStr = fs.readFileSync(path.resolve(pre_params_prefix, 'brands.csv'), 'utf8')
    const brands = readCsvFile(brandsStr)

    if (Array.isArray(brands)) return brands.map(item => item.brand_name)

    return []
  }

  const getRecord = (file: string) => {
    let record: number[] = []

    if (fs.existsSync(file)) {
      record = JSON.parse(fs.readFileSync(file, 'utf8')) as number[]
    }

    return record
  }

  const beforeCreate = () => {
    createDir(data_prefix)
    createDir(stores_perfix)
  }

  const init = async () => {
    beforeCreate()

    const browser = await puppeteer.launch({
      headless: false,
      devtools: true
    })

    const page = await browser.newPage()

    const brands = getBrandsData()
    const url = CRAWLER_URL[name as CRAWLER_TYPE]

    await page.goto(url)

    const recordFile = path.resolve(pre_params_prefix, `${name}_record.json`)
    const record = getRecord(recordFile)

    for (const brand of brands.slice(0, 1)) {
      const brandFile = path.resolve(stores_perfix, `${brand}.json`)

      if (fs.existsSync(brandFile)) continue
      console.log('-------------------------------')

      console.log(`crawler: ${brand}`)

      try {
        const { total, data } = await page.evaluate(require(`./service/${name}`), { brand })

        console.log(`crawler: ${brand} ${total} ${data.length}`)

        record.push(brand)

        createFile(recordFile, [...new Set(record)])
        createFile(brandFile, data)
      } catch (error) {
        console.log(error)
      }
    }

    await browser.close()
  }

  return {
    init
  }
})()

Task.init()
