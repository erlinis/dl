import gemfileInterpreter from '../gemfileInterpreter.js'

/**
 * @typedef {import("../types.js").MetadataStrategy} MetadataStrategy
 * @typedef {import('../types.js').OfficialVersions} OfficialVersions
 * @typedef {import('octokit').Octokit} OctokitClient
 * @typedef {import("../types.js").Repository} Repository
 * @typedef {import('../types.js').Technologies} Technologies
 * @typedef {import('../types.js').Frameworks[]} Frameworks
 */

/**@type {Frameworks} */
const RUBY_FRAMEWORKS = ['rails', 'sinatra']

/**
 * @implements {MetadataStrategy}
 */
export class RubyMetadata {
  /**
   *
   * @param {OfficialVersions} officialVersions
   * @param {OctokitClient} octokitClient
   */
  constructor(officialVersions, octokitClient) {
    this.officialVersions = officialVersions
    this.octokitClient = octokitClient
  }

  /**
   *
   * @param {Repository} repository
   */
  async getMetadata(repository) {
    let metadata = { framework: {}, platform: {} }

    const gemfileDotLock = await this.getGemfileDotLock(repository)
    metadata = {
      framework: this.getFrameworkMetadata(gemfileDotLock),
      platform: await this.getPlatformMetadata(repository, gemfileDotLock),
    }

    return metadata
  }

  /**
   * @private
   * @param {*} gemfileDotLock
   * @returns
   */
  getFrameworkMetadata(gemfileDotLock) {
    let framework = {}

    if (gemfileDotLock.specs == undefined) return framework

    for (let i = 0; i < RUBY_FRAMEWORKS.length; ++i) {
      const frameworkName = RUBY_FRAMEWORKS[i]
      const frameworkMeta = gemfileDotLock.specs[frameworkName]

      if (frameworkMeta == undefined) continue

      framework = {
        name: frameworkName,
        version: frameworkMeta.version,
        status: this.currentVersionStatus(frameworkMeta.version, frameworkName),
      }
    }

    return framework
  }

  /**
   * @private
   * @param {Repository} repository
   * @param {*} gemfileDotLock
   * @returns
   */
  async getPlatformMetadata(repository, gemfileDotLock) {
    const rubyVersion =
      gemfileDotLock.rubyVersion != undefined
        ? gemfileDotLock.rubyVersion.split('p')[0]
        : await this.getRubyFromRubyVersionFile(repository)

    return {
      name: 'ruby',
      version: rubyVersion,
      status: this.currentVersionStatus(rubyVersion, 'ruby'),
    }
  }

  /**
   * @private
   * @param {Repository} repository
   * @returns
   */
  getGemfileDotLock(repository) {
    return this.octokitClient
      .request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: repository.owner.login,
        repo: repository.name,
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

  /**
   * @private
   * @param {Repository} repository
   * @returns
   */
  getRubyFromRubyVersionFile(repository) {
    return this.octokitClient
      .request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: repository.owner.login,
        repo: repository.name,
        path: '.ruby-version',
      })
      .then(({ data: file }) => {
        if (!Array.isArray(file)) {
          //@ts-expect-error
          const rubyVersion = Buffer.from(file.content, file.encoding)
            .toString('utf-8')
            .replace(/ruby-/, '')
            .replace(/\n/, '')

          return rubyVersion
        }
      })
      .catch((error) => {
        console.log('[getRubyFromRubyVersionFile] Error: ', error)
        return ''
      })
  }

  /**
   *
   * @private
   * @param {string} currentVersion
   * @param {Technologies}  technology
   * @returns
   */
  currentVersionStatus(currentVersion, technology) {
    const officialVersion = this.officialVersions[technology]

    if (currentVersion == officialVersion.latest) return 'latest'
    if (officialVersion.stables.includes(currentVersion)) return 'stable'

    return 'outdated'
  }
}
