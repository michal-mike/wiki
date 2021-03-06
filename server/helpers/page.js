const qs = require('querystring')
const _ = require('lodash')
const crypto = require('crypto')

module.exports = {
  /**
   * Parse raw url path and make it safe
   */
  parsePath (rawPath) {
    let pathObj = {
      locale: 'en',
      path: 'home',
      private: false,
      privateNS: ''
    }

    // Clean Path
    rawPath = _.trim(qs.unescape(rawPath))
    if (_.startsWith(rawPath, '/')) { rawPath = rawPath.substring(1) }
    if (rawPath === '') { rawPath = 'home' }

    // Extract Info
    let pathParts = _.filter(_.split(rawPath, '/'), p => !_.isEmpty(p))
    if (pathParts[0].length === 1) {
      pathParts.shift()
    }
    if (pathParts[0].length === 2) {
      pathObj.locale = pathParts[0]
      pathParts.shift()
    }
    pathObj.path = _.join(pathParts, '/')
    return pathObj
  },
  /**
   * Generate unique hash from page
   */
  generateHash(opts) {
    return crypto.createHash('sha1').update(`${opts.locale}|${opts.path}|${opts.privateNS}`).digest('hex')
  },
  /**
   * Inject Page Metadata
   */
  injectPageMetadata(page) {
    let meta = [
      ['title', page.title],
      ['description', page.description],
      ['published', page.isPublished.toString()],
      ['date', page.updatedAt],
      ['tags', '']
    ]
    switch (page.contentType) {
      case 'markdown':
        return '---\n' + meta.map(mt => `${mt[0]}: ${mt[1]}`).join('\n') + '\n---\n\n' + page.content
      case 'html':
        return '<!--\n' + meta.map(mt => `${mt[0]}: ${mt[1]}`).join('\n') + '\n-->\n\n' + page.content
      default:
        return page.content
    }
  }
}
