import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from 'octokit'

import fs from 'fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const pem = await fs.readFile(resolve(__dirname, './oreo-dl-pk.pem'), {
  encoding: 'utf-8',
})

/**
 *
 * @param {string} appId
 * @param {string} installationId
 * @returns {Octokit}
 */
function createOctokitClient(appId, installationId) {
  const client = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: appId,
      privateKey: pem,
      installationId: installationId,
    },
  })

  return client
}

export default createOctokitClient
