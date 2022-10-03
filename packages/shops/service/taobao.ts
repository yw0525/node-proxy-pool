export const grabShops = async (params: ProcessParams) => {
  const getRandom = (start: number, end: number) =>
    Math.floor(Math.random() * (end - start + 1) + start)

  const delaySync = (ms: number) =>
    new Promise<void>(resolve => {
      setTimeout(() => resolve(), ms)
    })

  const { brand } = params

  console.log(brand)

  const delay = getRandom(3, 8) * 1000

  console.log(`delay ${delay}ms`)

  await delaySync(delay)
}
