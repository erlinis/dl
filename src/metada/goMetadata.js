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

    const dockerfileContent = await this.getDockerfile(repository)
    metadata = {
      framework: {},
      platform: await this.getPlatformMetadata(dockerfileContent),
    }

    return metadata
  }

  /**
   * @private
   * @param {*} dockerfileContent
   * @returns
   */
  async getPlatformMetadata(dockerfileContent) {
    const goVersion = this.getGoVersion(dockerfileContent)

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
  getDockerfile(repository) {
    return this.octokitClient.rest.repos
      .getContent({
        owner: repository.owner.login,
        repo: repository.name,
        path: 'Dockerfile',
      })
      .then(({ data: dockerfile }) => {
        const dockerfileContent = Buffer.from(dockerfile.content, dockerfile.encoding).toString(
          'utf-8'
        )

        return dockerfileContent
      })
      .catch((error) => {
        console.log('[getDockerfile] Error: ', error)
        return {}
      })
  }

  /**
   * @private
   * @param {*} dockerfileContent
   */
  getGoVersion(dockerfileContent) {
    let version
    let index = 0
    let line
    let lines = dockerfileContent.split('\n')

    while ((line = lines[index++]) !== undefined) {
      const versionLine = line.match(/(FROM golang:)(\d+\.*){1,4}/g)
      if (versionLine != null) {
        version = versionLine[0].split(':')[1]
        break
      }
    }

    return version
  }
}
