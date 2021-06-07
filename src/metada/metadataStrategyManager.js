import { GoMetadata } from './goMetadata.js'
import { RubyMetadata } from './rubyMetadata.js'

/**
 * @type {{
 *  ruby: typeof RubyMetadata;
 *  go: typeof GoMetadata;
 * }}
 */
export const metadataStrategies = {
  ruby: RubyMetadata,
  go: GoMetadata,
}
