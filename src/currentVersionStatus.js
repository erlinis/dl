import { officialVersions } from '../src/officialVersions.js'

/**
 * @typedef {import('./types.js').Technologies} Technologies
 */

/**
 *
 * @private
 * @param {string} currentVersion
 * @param {Technologies}  technology
 * @returns
 */
export function currentVersionStatus(currentVersion, technology) {
  const officialVersion = officialVersions[technology]

  if (currentVersion == officialVersion.latest) return 'latest'
  if (officialVersion.stables.includes(currentVersion)) return 'stable'

  return 'outdated'
}
