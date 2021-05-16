import { ApexMetadata } from './apexMetadata.js'
import { RubyMetadata } from './rubyMetadata.js'

/**
 * @type {{
 *  ruby: typeof RubyMetadata;
 *  apex: typeof ApexMetadata
 * }}
 */
export const metadataStrategies = {
  ruby: RubyMetadata,
  apex: ApexMetadata,
}
