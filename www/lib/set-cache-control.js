export default (maxAge) => {
  return (context) => {
    if (!process.browser) {
      const res = context.res
      res.setHeader('cache-control', 'max-age=' + maxAge)
    }
    return Promise.resolve({})
  }
}
