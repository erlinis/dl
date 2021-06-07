import { currentVersionStatus } from '../currentVersionStatus.js'
/**
 * @typedef {import("../types.js").MetadataStrategy} MetadataStrategy
 * @typedef {import('octokit').Octokit} OctokitClient
 * @typedef {import("../types.js").Repository} Repository
 * @typedef {import('../types.js').Technologies} Technologies
 */

/**
 * @implements {MetadataStrategy}
 */
export class GoMetadata {
  /**
   *
   * @param {OctokitClient} octokitClient
   */
  constructor(octokitClient) {
    this.octokitClient = octokitClient
  }

  /**
   *
   * @param {Repository} repository
   */
  async getMetadata(repository) {
    let metadata = { framework: {}, platform: {} }

    const goDotModContent = await this.getGoDotMod(repository)
    metadata = {
      framework: {},
      platform: await this.getPlatformMetadata(goDotModContent),
    }

    return metadata
  }

  /**
   * @private
   * @param {*} goDotModContent
   * @returns
   */
  async getPlatformMetadata(goDotModContent) {
    const goVersion = this.getGoVersion(goDotModContent)

    return {
      name: 'go',
      version: goVersion,
      status: currentVersionStatus(goVersion, 'go'),
    }
  }

  /**
   * @private
   * @param {Repository} repository
   * @returns
   */
  getGoDotMod(repository) {
    return this.octokitClient.rest.repos
      .getContent({
        owner: repository.owner.login,
        repo: repository.name,
        path: 'go.mod',
      })
      .then(({ data: goDotMod }) => {
        const goDotModContent = Buffer.from(goDotMod.content, goDotMod.encoding).toString('utf-8')

        return goDotModContent
      })
      .catch((error) => {
        console.log('[goDotMod] Error: ', error)
        return {}
      })
  }

  /**
   * @private
   * @param {*} goDotModContent
   */
  getGoVersion(goDotModContent) {
    let version
    let index = 0
    let line
    let lines = goDotModContent.split('\n')

    while ((line = lines[index++]) !== undefined) {
      const versionLine = line.match(/(go)\s(\d+\.*){1,4}/g)
      if (versionLine != null) {
        version = versionLine[0].split(' ')[1]
        break
      }
    }

    return version
  }
}
