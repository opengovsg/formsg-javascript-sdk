const webhooks = require('./src/webhooks.js')

/**
 * Entrypoint into the FormSG SDK
 * @param {Object} options
 * @param {string} [options.mode] If set to 'staging' this will initialise
 * the SDK for the FormSG staging environment
 */
module.exports = function ({
  mode='production'
} = {}) {
    return {
      webhooks: webhooks({ mode })
    }
}
