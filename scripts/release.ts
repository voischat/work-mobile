import process from 'node:process'
import { config } from 'dotenv'
import { Octokit } from 'octokit'

config()

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

async function release() {
  try {
    await octokit.request('POST /repos/{owner}/{repo}/dispatches', {
      owner: 'voischat',
      repo: 'work-mobile-releases',
      event_type: 'on-demand-release',
      client_payload: {
        unit: false,
        integration: true,
        ref: 'main',
      },
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    console.log('Release triggered successfully')
  }
  catch (error) {
    console.error('Failed to trigger release:', error instanceof Error ? error.message : String(error))
  }
}

release()
