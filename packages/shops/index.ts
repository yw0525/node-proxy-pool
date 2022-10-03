import fs from 'node:fs'
import path from 'node:path'
import minimist from 'minimist'

import { readCsvFile } from '../shared/csv'
import { START_TIME } from './config/config'
import { createDir, createFile, getTimeStr } from '../shared/tools'

const Task = (() => {
  const { name } = minimist(process.argv.slice(2))

  const upperCaseName = (name as string).toUpperCase()

  const prefix = path.resolve(process.cwd(), 'packages/shops')

  const pre_params_prefix = path.resolve(prefix, 'pre-params')
  const pre_params_shops_perfix = path.resolve(pre_params_prefix, `${upperCaseName}_shops`)
  const pre_params_shops_record = path.resolve(pre_params_prefix, `${upperCaseName}_record.json`)

  const data_prefix = path.resolve(prefix, 'data')
  const data_goods_prefix = path.resolve(data_prefix, `${upperCaseName}_${getTimeStr(START_TIME)}`)

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
    createFile(pre_params_shops_record, [])
  }

  const print = (prefix: string) => (str: string | number) => console.log(`${prefix}${str}`)

  const init = async () => {
    beforeCreate()

    const brands = getBrandsData()

    console.log('crawler start')

    await require(`./command/${name}`)({
      brands: brands.slice(10, 30),
      paths: {
        prefix,
        pre_params_prefix,
        pre_params_shops_perfix,
        pre_params_shops_record,
        data_prefix,
        data_goods_prefix
      },
      tools: {
        getRecord,
        print
      }
    })

    console.log('crawler end')
  }

  return {
    init
  }
})()

Task.init()
