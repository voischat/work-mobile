import { readFileSync } from 'node:fs'
import process from 'node:process'

interface PackageManifest {
  name: string
  version: string
}

const tag = process.env.GITHUB_REF_NAME ?? ''

if (!tag.startsWith('v')) {
  console.log(`${tag} is not a release tag`)
  process.exit(0)
}

const version = tag.slice(1)
const manifest: PackageManifest = JSON.parse(readFileSync('package.json', 'utf8'))

if (manifest.version !== version)
  throw new Error(`${manifest.name} is ${manifest.version}, but the tag says ${version}`)
