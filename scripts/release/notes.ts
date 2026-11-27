import type { ChangelogOptions } from 'changelogithub'
import { existsSync, readFileSync } from 'node:fs'
import process from 'node:process'
import { generate, sendRelease, uploadAssets } from 'changelogithub'

interface PackageManifest {
  name: string
  version: string
}

const tag = process.env.GITHUB_REF_NAME ?? ''
const manifest: PackageManifest = JSON.parse(readFileSync('package.json', 'utf8'))
const options: ChangelogOptions = {
  repo: process.env.GITHUB_REPOSITORY ?? 'voischat/work-mobile',
  token: process.env.GITHUB_TOKEN,
  to: tag,
  tag: 'v%s',
  prerelease: manifest.version.includes('-'),
}

const { config, output } = await generate(options)
const release = await sendRelease(config, output)
const assets = ['', 'dev', 'intl']
  .map(append => `pkg/${[manifest.name, append, manifest.version].filter(Boolean).join('_')}.tar.gz`)

for (const asset of assets) {
  if (!existsSync(asset))
    throw new Error(`Missing ${asset}; build the pkg archives first.`)
}

await uploadAssets(config, assets, release)
