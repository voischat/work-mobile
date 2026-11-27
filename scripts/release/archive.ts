import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

interface PackageManifest {
  name: string
  version: string
}

const builds = [
  { script: 'build', append: '', appId: 'PROD_APP_ID', appKey: 'PROD_APP_KEY' },
  { script: 'build:staging', append: 'dev', appId: 'STAGING_APP_ID', appKey: 'STAGING_APP_KEY' },
  { script: 'build:intl', append: 'intl', appId: 'INTL_APP_ID', appKey: 'INTL_APP_KEY' },
]

const tag = process.env.GITHUB_REF_NAME ?? ''

if (!tag.startsWith('v')) {
  console.log(`${tag} is not a release tag`)
  process.exit(0)
}

const version = tag.slice(1)
const manifest: PackageManifest = JSON.parse(readFileSync('package.json', 'utf8'))

if (manifest.version !== version)
  throw new Error(`${manifest.name} is ${manifest.version}, but the tag says ${version}`)

mkdirSync('pkg', { recursive: true })

for (const build of builds) {
  const env = {
    ...process.env,
    VITE_APP_ID: process.env[build.appId] ?? '',
    VITE_APP_KEY: process.env[build.appKey] ?? '',
  }

  execFileSync('pnpm', ['run', build.script], { stdio: 'inherit', env })

  const archive = resolve('pkg', `${[manifest.name, build.append, version].filter(Boolean).join('_')}.tar.gz`)
  rmSync(archive, { force: true })
  execFileSync('tar', ['-czf', archive, '-C', 'dist', '.'], { stdio: 'inherit' })
  console.log(archive)
}
