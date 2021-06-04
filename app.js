'use strict'

import AutoLoad from 'fastify-autoload'
import FastifyStatic from 'fastify-static'
import Env from 'fastify-env'
import S from 'fluent-json-schema'
import PointOfView from 'point-of-view'
import Handlebars from 'handlebars'

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
      .prop('GITHUB_APP_INSTALLATION_OWNER', S.string().required())
      .prop('GITHUB_APP_PRIVATE_KEY', S.string().required())
      .prop('REPOSITORIES', S.string().required())
      .prop('REPOSITORIES_OWNER', S.string().required())
      .valueOf(),
  })

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: Object.assign({}, opts),
  })

  // This loads all plugins defined in sroutes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: Object.assign({}, opts),
  })

  // Set Static files path
  fastify.register(FastifyStatic, {
    root: join(__dirname, '/public'),
    prefix: '/public/', // optional: default '/'
  })

  // Define views
  fastify.register(PointOfView, {
    engine: {
      handlebars: Handlebars,
    },
    includeViewExtension: true,
    options: {
      partials: {
        projects: '/views/partials/projects.hbs',
        projectsInfo: '/views/partials/projectsInfo.hbs',
        projectInfoTitles: '/views/partials/projectInfoTitles.hbs',
      },
    },
  })

  Handlebars.registerHelper('ifNotEquals', function (arg1, arg2, options) {
    return arg1 != arg2 ? options.fn(this) : options.inverse(this)
  })

  Handlebars.registerHelper('capitalize', function (word, options) {
    return word.charAt(0).toUpperCase() + word.slice(1)
  })
}
