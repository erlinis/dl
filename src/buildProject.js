/**
 * @typedef {import('./types.js').Repository} Repository
 * @typedef {import('./types.js').Technologies} Technologies
 * @typedef {import('./types.js').Project} Project
 */

import { metadataStrategies } from './metada/metadataStrategyManager.js'

/**
 * @param {string} repositoryName
 * @param {string} repositoryOwner
 * @param {import('./types.js').OfficialVersions} officialVersions
 * @param {import('octokit').Octokit} octokitClient
 * @returns {Promise<Project>}
 */
async function buildProject(repositoryName, repositoryOwner, officialVersions, octokitClient) {
  return await octokitClient
    .request('GET /repos/{owner}/{repo}', {
      owner: repositoryOwner,
      repo: repositoryName,
    })
    .then(async ({ data: repository }) => {
      return {
        name: repository.name,
        url: repository.html_url,
        description: repository.description,
        defaultBranch: repository.default_branch,
        language: repository.language,
        ...(await getMetadata(repository)),
      }
    })
    .catch((err) => {
      console.log('Error retrieve project: ', err)
      return {
        name: repositoryName,
        description: `Error retrieving the repo information make sure 'oreo-dl' is installed in the repository`,
        url: 'error',
        defaultBranch: '',
        language: '',
        framework: {},
        platform: {},
      }
    })

  /**
   *
   * @param {Repository} repository
   * @returns
   */
  async function getMetadata(repository) {
    let metadata = { framework: {}, platform: {} }

    const metadataStrategyClass = metadataStrategies[repository.language.toLowerCase()]

    if (metadataStrategyClass == undefined) return metadata

    return new metadataStrategyClass(officialVersions, octokitClient).getMetadata(repository)
  }
}

export default buildProject
