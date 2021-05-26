'use strict'
import buildProject from '../src/buildProject.js'
import { officialVersions } from '../src/officialVersions.js'
import groupBy from 'lodash-es/groupBy.js'

/**
 * @typedef {import('../src/types.js').Project} Project
 */

export default async function (fastify, opts) {
  const { octokitClient, config } = fastify

  fastify.get('/', async function (request, reply) {
    const repositories = config.REPOSITORIES.split(',')

    const projectsPromises = repositories.map((repositoyName) => {
      return buildProject(
        repositoyName,
        config.GITHUB_APP_INSTALLATION_OWNER,
        officialVersions,
        octokitClient
      )
    })

    const projects = await Promise.all(projectsPromises)

    const groupedProjects = groupProjects(projects)
    const projectsGroupedByFramework = groupBy(
      groupedProjects.framework,
      (project) => project.framework?.name
    )
    const projectsGroupedByPlatform = groupBy(
      groupedProjects.platform,
      (project) => project.platform?.name
    )

    return reply.view('/views/index', {
      projectsGroupedByFramework: projectsGroupedByFramework,
      projectsGroupedByPlatform: projectsGroupedByPlatform,
      projectsWithoutMeta: groupedProjects.others,
      officialVersions: officialVersions,
    })
  })
}

/**
 *
 * @param {Array<Project>} projects
 * @returns { {framework: Project[], platform: Project[], others: Project[] } }
 */
function groupProjects(projects) {
  return groupBy(projects, (project) => {
    if (project.framework?.name && project.platform?.name) {
      return 'framework'
    } else if (project.framework?.name == undefined && project.platform?.name) {
      return 'platform'
    } else {
      return 'others'
    }
  })
}
