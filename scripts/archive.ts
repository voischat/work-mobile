import { existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { $, echo } from 'zx'
import { name as pkgName, version } from '../package.json'

async function run(opts: { append?: string } = {}) {
  const { append = '' } = opts

  const outputDir = 'pkg'
  const filename = `${[pkgName, append, version].filter(Boolean).join('_')}.tar.gz`

  const filepath = resolve(outputDir, filename)

  if (existsSync(filepath))
    await $`rm ${filepath}`

  if (!existsSync(outputDir))
    mkdirSync(outputDir)

  await $`tar -czf ${filepath} -C dist .`

  echo`Archive done: ${filepath}`
}

const appendArg = process.argv.includes('--append')
  ? process.argv[process.argv.indexOf('--append') + 1]
  : undefined

await run({ append: appendArg })
