import fs from 'node:fs'
import { stringify } from 'csv'
import { parse } from 'csv/sync'

type WriteCsvFileFuntion = (file: string, data: any[], fields: string[], print: string[]) => void

const writeCsvFile: WriteCsvFileFuntion = (file, data, fields, print = ['barcode']) => {
  const exist = fs.existsSync(file)

  print = print.map(field => data[field as any])

  if (!Array.isArray(data)) data = [data]

  stringify(data, {
    header: !exist,
    columns: fields
  }).pipe(
    fs
      .createWriteStream(file, { flags: 'a' })
      .on('finish', () => {
        console.log('save', print.join(' '))
      })
      .on('error', () => {
        console.log('failed', print.join(' '))
      })
  )
}

const readCsvFile = (data: any) => {
  const records = parse(data, {
    columns: true,
    skip_empty_lines: true
  })
  return records
}

export { writeCsvFile, readCsvFile }
