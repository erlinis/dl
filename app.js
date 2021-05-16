'use strict'

import AutoLoad from 'fastify-autoload'
import Env from 'fastify-env'
import S from 'fluent-json-schema'

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default async function (fastify, opts) {
  // Place here your custom code!

  // Register env variables using `fastify-env` plugin
  fastify.register(Env, {
    schema: S.object()
      .prop('GITHUB_APP_ID', S.string().required())
      .prop('GITHUB_APP_INSTALLATION_ID', S.string().required())
      .prop('GITHUB_APP_PRIVATE_KEY', S.string().required())
      .valueOf(),
  })

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: Object.assign({}, opts),
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: Object.assign({}, opts),
  })
}
