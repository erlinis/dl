import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from 'octokit'

/**
 *
 * @param {object} config
 * @param {string} config.appId
 * @param {string} config.installationId
 * @param {string} config.privateKey
 * @returns {Octokit}
 */
function createOctokitClient({ appId, installationId, privateKey }) {
  const client = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: parseInt(appId),
      installationId: parseInt(installationId),
      privateKey: Buffer.from(privateKey, 'base64').toString('utf-8'),
    },
  })

  return client
}

export default createOctokitClient
