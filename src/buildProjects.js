import { metadataStrategies } from './metada/metadataStrategyManager.js'

/**
 * @typedef {import('./types.js').Repository} Repository
 * @typedef {import('./types.js').Metadata} Metadata
 * @typedef {import('./types.js').Project} Project
 * @typedef {import('octokit').Octokit} octokitClient
 */

/**
 * @param {string} repositoryName
 * @param {string} repositoryOwner
 * @param {octokitClient} octokitClient
 * @returns {Promise<Project[]>}
 */
async function buildProjects(repositoryName, repositoryOwner, octokitClient) {
  return await octokitClient.rest.repos
    .get({
      owner: repositoryOwner,
      repo: repositoryName,
    })
    .then(async ({ data: repository }) => {
      let projects = []

      const languagesMetadata = await getLanguagesMetadata(repository)

      for (const [index, metadata] of languagesMetadata.entries()) {
        const lastItem = index + 1 == languagesMetadata.length

        if (metadaResolved(metadata) || (projects.length == 0 && lastItem)) {
          projects.push({
            name: repository.name,
            url: repository.html_url,
            description: repository.description,
            defaultBranch: repository.default_branch,
            language: repository.language,
            ...metadata,
          })
        }
      }

      return projects
    })
    .catch((err) => {
      console.log('Error retrieving project: ', err)
      return [
        {
          name: repositoryName,
          description: `Error retrieving the repo information make sure 'oreo-dl' is installed in the repository`,
          url: 'error',
          defaultBranch: '',
          language: '',
          framework: {},
          platform: {},
        },
      ]
    })

  /**
   *
   * @param {Repository} repository
   * @returns {Promise<Metadata[]>}
   */
  async function getLanguagesMetadata(repository) {
    const languages = await getRepositoryLanguages(repository)

    const languagesMetadataPromises = Object.keys(languages).map((languageName) =>
      getMetadata(repository, languageName)
    )

    return Promise.all(languagesMetadataPromises)
  }

  /**
   *
   * @param {Repository} repository
   * @returns {Promise<{}>}
   */
  async function getRepositoryLanguages(repository) {
    return await octokitClient.rest.repos
      .listLanguages({
        owner: repository.owner.login,
        repo: repository.name,
      })
      .then(async ({ data: languages }) => {
        return languages
      })
      .catch((err) => {
        console.log('[getRepositoryLanguages] Error: ', err)
        return [repository.language]
      })
  }

  /**
   *
   * @param {Repository} repository
   * @param {string} language
   * @returns {Promise<Metadata>}
   */
  async function getMetadata(repository, language) {
    let metadata = { framework: {}, platform: {} }

    const metadataStrategyClass = metadataStrategies[language.toLowerCase()]

    if (metadataStrategyClass == undefined) return metadata

    return new metadataStrategyClass(octokitClient).getMetadata(repository)
  }

  /**
   *
   * @param {Metadata} metadata
   * @returns {true|false}
   */
  function metadaResolved(metadata) {
    //@ts-expect-error
    return metadata.platform?.name != undefined || metadata.framework?.name != undefined
  }
}

export default buildProjects
