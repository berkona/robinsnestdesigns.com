const fs = require('fs')
const YAML = require('yaml')

const MAIN_FILE_TEMPLATE = ({ generatedCodeLines }) => `
const express = require('express')
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
app.prepare().then(() => {
  const server = express()

  ${generatedCodeLines.join('\n  ')}

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, err => {
    if (err) throw err
    console.log('> Ready on http://localhost:' + port)
  })
})

`

const main = () => {
  // TODO:
  let configFileName = "serverless.yml"
  if (process.argv.length === 3) {
    configFileName = process.argv[2]
  }
  console.error('Using serverless config file at "' + configFileName + '"')
  const serverlessFileContents = fs.readFileSync(configFileName, 'utf-8')
  const serverlessCfg = YAML.parse(serverlessFileContents)
  const generatedCodeLines = []
  for (const functionKeyName in serverlessCfg.functions) {
    generatedCodeLines.push('// begin auto-generated from ' + functionKeyName)
    const functionDef = serverlessCfg.functions[functionKeyName]

    // import handler into script
    const functionVarName = functionKeyName.replace(/\W/gmi, '_')
    if (!functionDef.handler || !functionVarName) {
      throw new Error('Malformed serverless function definition @ ' + functionKeyName)
    }
    const [ moduleName, fnName ] = functionDef.handler.split('.')
    if (!moduleName || !fnName) throw new Error('Malformed serverless function definition @ ' + functionKeyName)
    const requireTemplateStr = `const ${functionVarName} = require('./${moduleName}')['${fnName}']`
    generatedCodeLines.push(requireTemplateStr)

    for (const eventDef of functionDef.events) {
      const { http, schedule } = eventDef
      if (http) {
        // handle http event def
        let { path, method } = http
        method = method.toLowerCase()
        if (method == 'any') {
          method = 'all'
        }
        const httpEventHandler = `server.${method}('/${path}', ${functionVarName})`
        generatedCodeLines.push(httpEventHandler)
      } else if (schedule) {
        // handle rate schedule mapping
        const { name, rate, enabled } = schedule
        if (!enabled) continue
        if (!name) throw new Error('Malformed event definition @ ' + functionKeyName)
        if (!rate) throw new Error('Only rate scheduling is supported right now @ ' + functionKeyName)

        const rateVarName = name.replace(/\W/gmi, '_')
        const rateRE = /rate\(\s*(?:(?<days>\d+)\sdays?)?\s*(?:(?<hours>\d+)\shours?)?\s*(?:(?<minutes>\d+)\sminutes?)?\s*(?:(?<seconds>\d+)\sseconds?)?\s*\)/i
        const match = rate.match(rateRE)
        if (!match) throw new Error('Unsupported rate scheduling expression: ' + rate)

        const days = match.groups.days || 0
        const hours = match.groups.hours || 0
        const minutes = match.groups.minutes || 0
        const seconds = match.groups.seconds || 0

        const ONE_SECOND = 1000
        const ONE_MINUTE = ONE_SECOND * 60
        const ONE_HOUR = ONE_MINUTE * 60
        const ONE_DAY = ONE_HOUR * 24

        const intervalTime = days  * ONE_DAY + hours * ONE_HOUR + minutes * ONE_MINUTE + seconds * ONE_SECOND

        const scheduleHandler = `const ${rateVarName} = setInterval(${functionVarName}, ${intervalTime})`
        generatedCodeLines.push(scheduleHandler)

        const cleanup = `process.on('exit', () => clearInterval(${rateVarName}))`
        generatedCodeLines.push(cleanup)
      } else {
        throw new Error('Malformed serverless function definition @ ' + functionKeyName + ', unrecognized event definition: ' + JSON.stringify(eventDef))
      }
    }
    generatedCodeLines.push('// end auto-generated code from ' + functionKeyName)
    generatedCodeLines.push('')
  }

  // parse custom.serverless-nextjs
  if (serverlessCfg.custom && serverlessCfg.custom['serverless-nextjs'] && serverlessCfg.custom['serverless-nextjs'].routes) {
    const routes = serverlessCfg.custom['serverless-nextjs'].routes
    generatedCodeLines.push('// begin auto-generated next-js routes')
    for (const routeCfg of routes) {
      let { src, path } = routeCfg
      if (src == 'index') src = ''
      src = '/' + src
      path = path.replace(/\{/g, ':').replace(/\}/g, '')
      if (!path.startsWith('/')) path = '/' + path
      generatedCodeLines.push(`server.get('${path}', (req, res) => {`)
      generatedCodeLines.push(`  return app.render(req, res, '${src}', req.params)`)
      generatedCodeLines.push('})')
      generatedCodeLines.push('')
    }
    generatedCodeLines.push('// end auto-generated next-js routes')
  }

  console.log(MAIN_FILE_TEMPLATE({ generatedCodeLines, }))
}

module.exports = { main, }

if (require.main === module) {
    Promise.resolve(main()).then(() => {
      setTimeout(() => process.exit(), 100)
    })
    .catch((err) => console.error('uncaught error', err))
}
