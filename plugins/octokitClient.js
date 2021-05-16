import fp from 'fastify-plugin'
import createOctokitClient from '../src/createOctokitClient.js'

async function OctokitClient(fastify, opts) {
  const { config } = fastify

  const octokitClient = createOctokitClient({
    appId: config.GITHUB_APP_ID,
    privateKey: config.GITHUB_APP_PRIVATE_KEY,
    installationId: config.GITHUB_APP_INSTALLATION_ID,
  })

  fastify.decorate('octokitClient', octokitClient)
}

export default fp(OctokitClient, {
  name: 'OctokitClient',
})
