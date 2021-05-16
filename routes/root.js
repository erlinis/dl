'use strict'
import buildProject from '../src/buildProject.js'
import { officialVersions } from '../src/officialVersions.js'

export default async function (fastify, opts) {
  const { octokitClient } = fastify

  fastify.get('/', async function (request, reply) {
    const repositories = [
      'asena',
      'collie',
      'coral',
      'firefly',
      'gecko-api',
      'itinerary_loader',
      'goaliath',
      'pigeon',
      'suitecalls',
      'suitedashboardapi',
      'suitesfproxy',
      'salesforce-components',
      'lead.qualification.tool',
      'trips.lionprint',
      'kookaburra-lambda',
      'trips.routing',
      'salesforce-components',
      'suite',
      'suiteproxy',
      'wallaby',
    ]

    const projects = repositories.map((repoName) => {
      return buildProject(repoName, officialVersions, octokitClient)
    })

    return await Promise.all(projects)
  })
}
