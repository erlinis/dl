'use strict'
import buildProject from '../src/buildProject.js'

export default async function (fastify, opts) {
  const { octokitClient } = fastify

  fastify.get('/', async function (request, reply) {
    const repositories = [
      'kookaburra-lambda',
      'salesforce-components',
      'gecko-api',
      'trips.lionprint',
      'suite',
      'suitedashboardapi',
    ]

    const projects = repositories.map((repoName) => {
      return buildProject(repoName, octokitClient)
    })

    return await Promise.all(projects)
  })
}
