'use strict'
import buildProject from '../src/buildProject.js'
import { officialVersions } from '../src/officialVersions.js'

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

    console.log(projects)

    function filterProjectByFramework(projects, framework) {
      return projects.filter((project) => project.framework?.name == framework)
    }

    function filterProjectByPlatform(projects, platform) {
      return projects.filter(
        (project) => project.platform?.name == platform && isObjectEmpty(project.framework)
      )
    }

    function filterWithoutFrameworkAndPlatform(projects) {
      return projects.filter(
        (project) => isObjectEmpty(project.platform) && isObjectEmpty(project.framework)
      )
    }

    return reply.view('/views/index', {
      railsProjects: filterProjectByFramework(projects, 'rails'),
      sinatraProjects: filterProjectByFramework(projects, 'sinatra'),
      rubyProjects: filterProjectByPlatform(projects, 'ruby'),
      othersProjects: filterWithoutFrameworkAndPlatform(projects),
      officialVersions: officialVersions,
    })
  })
}

/**
 *
 * @param {*} obj
 * @returns {boolean}
 */
function isObjectEmpty(obj) {
  if (!isPlainObject(obj)) return true
  return Object.keys(obj).length === 0
}
/**
 *
 * @param {*} x
 * @returns {boolean}
 */
function isPlainObject(x) {
  return Object.prototype.toString.call(x) === '[object Object]'
}
