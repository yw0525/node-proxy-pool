const fs = require('fs')
const path = require('path')

const setZero = (value: number) => (value < 10 ? `0${value}` : value)

const getTimeStr = (ins: Date) => {
  const date = ins || new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}${setZero(month)}${setZero(day)}`
}

const getRandom = (start: number, end: number) =>
  Math.floor(Math.random() * (end - start + 1) + start)

const isArray = (target: any) => Object.prototype.toString.call(target) === '[object Array]'
const isObject = (target: any) => typeof target === 'object' && target !== null
const deepClone = (origin: any, target: any) => {
  var tar = target || {}

  for (var k in origin) {
    if (origin.hasOwnProperty(k)) {
      if (isObject(origin[k])) {
        tar[k] = isArray(origin[k]) ? [] : {}
        deepClone(origin[k], tar[k])
      } else {
        tar[k] = origin[k]
      }
    }
  }

  return tar
}
const delaySync = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })

const createDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, 0o777)
  }
  return dir
}

const createFile = (file: string, data: any, reset = false) => {
  if (!fs.existsSync(file) || reset) {
    fs.writeFileSync(file, JSON.stringify(data), 'utf-8')
  }
  return file
}

const normalizePath = (file_path: string) => file_path.split(path.sep).join('/')

const cleanData = (data: string) => {
  return data.replace(/\\/gim, '')
}

const urlParse = (url: string, fields?: string[]) => {
  const { origin, pathname, searchParams } = new URL(decodeURIComponent(url))

  const set = new Set(fields)

  const params = {}
  for (const key of searchParams.keys()) {
    if (set.has(key)) {
      params[key] = cleanData(searchParams.get(key) as string)
      continue
    }

    params[key] = searchParams.get(key)
  }

  return {
    origin,
    pathname,
    params
  }
}

export {
  setZero,
  getTimeStr,
  getRandom,
  deepClone,
  delaySync,
  createDir,
  createFile,
  normalizePath,
  cleanData,
  urlParse
}
