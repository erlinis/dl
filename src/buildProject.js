import gemfileInterpreter from '../src/gemfileInterpreter.js'
/**
 *
 * @param {Octokit} octokitClient
 * @returns project
 */
async function buildProject(projectName, octokitClient) {
  const owner = 'tourlane'

  const { data: repository } = await octokitClient.request(
    'GET /repos/{owner}/{repo}',
    {
      owner: owner,
      repo: projectName,
    }
  )

  function getRubyFromRubyVersionFile(projectName) {
    return octokitClient
      .request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: owner,
        repo: projectName,
        path: '.ruby-version',
      })
      .then(({ data: rubyVersionFile }) => {
        const rubyVersion = Buffer.from(
          rubyVersionFile.content,
          rubyVersionFile.encoding
        )
          .toString('utf-8')
          .replace(/ruby-/, '')
          .replace(/\n/, '')

        return rubyVersion
      })
      .catch((error) => {
        console.log('[getRubyFromRubyVersionFile] Error: ', error)
        return ''
      })
  }

  function getGemfileDotLock(projectName) {
    return octokitClient
      .request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: owner,
        repo: projectName,
        path: 'Gemfile.lock',
      })
      .then(({ data: gemfileDotLock }) => {
        const gemfileDotLockContent = Buffer.from(
          gemfileDotLock.content,
          gemfileDotLock.encoding
        )
          .toString('utf-8')
          .replace(/\n/, '')
          .replace(/ruby-/, '')

        return gemfileInterpreter(gemfileDotLockContent, true)
      })
      .catch((error) => {
        console.log('[getGemfileDotLock] Error: ', error)
        return {}
      })
  }

  function getFrameworkMetadata(gemfileDotLock) {
    let framework = {}

    if (gemfileDotLock.specs != undefined) {
      const rails = gemfileDotLock.specs.rails

      if (rails != undefined) {
        framework = { name: 'rails', version: rails.version }
      } else {
        const sinatra = gemfileDotLock.specs.sinatra

        if (sinatra != undefined) {
          framework = { name: 'sinatra', version: sinatra.version }
        }
      }
    }

    return framework
  }

  async function getLanguageMetadata(gemfileDotLock) {
    const rubyVersion =
      gemfileDotLock.rubyVersion != undefined
        ? gemfileDotLock.rubyVersion.split('p')[0]
        : await getRubyFromRubyVersionFile(projectName)

    return { name: 'ruby', version: rubyVersion }
  }

  async function getMetadata(language) {
    let metadata = { framework: {}, platform: {} }

    switch (language) {
      case 'Ruby':
        {
          const gemfileDotLock = await getGemfileDotLock(projectName)
          metadata = {
            framework: getFrameworkMetadata(gemfileDotLock),
            platform: await getLanguageMetadata(gemfileDotLock),
          }
        }
        break
      default:
        break
    }
    return metadata
  }

  const project = {
    name: repository.name,
    url: repository.html_url,
    description: repository.description,
    default_branch: repository.default_branch,
    language: repository.language,
    ...(await getMetadata(repository.language)),
  }

  return project
}

export default buildProject
