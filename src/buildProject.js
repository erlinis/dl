/**
 * @typedef {import('./types.js').Repository} Repository
 * @typedef {import('./types.js').Technologies} Technologies
 */

import { metadataStrategies } from './metada/metadataStrategyManager.js'

/**
 * @param {string} projectName
 * @param {import('./types.js').OfficialVersions} officialVersions
 * @param {import('octokit').Octokit} octokitClient
 * @returns project
 */
async function buildProject(projectName, officialVersions, octokitClient) {
  const owner = 'tourlane'

  return await octokitClient
    .request('GET /repos/{owner}/{repo}', {
      owner: owner,
      repo: projectName,
    })
    .then(async ({ data: repository }) => {
      return {
        name: repository.name,
        url: repository.html_url,
        description: repository.description,
        default_branch: repository.default_branch,
        language: repository.language,
        ...(await getMetadata(repository)),
      }
    })
    .catch((err) => {
      console.log('Error retrieve project: ', err)
      return {
        name: projectName,
        description: `Error retrieving the repo information make sure 'oreo-dl' is installed in the repository`,
        url: '',
        default_branch: '',
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

    const metadataStrategyClass =
      metadataStrategies[repository.language.toLowerCase()]

    if (metadataStrategyClass == undefined) return metadata

    return new metadataStrategyClass(
      officialVersions,
      octokitClient
    ).getMetadata(repository)
  }
}

export default buildProject
