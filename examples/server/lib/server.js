var Glue = require('glue')

exports.init = function init (manifest, options, next) {

  /**
   * Glue generates HapiJS servers based upon a configuration object.
   * See ./config/manifest
   */
  Glue.compose(manifest, options, function (error, server) {
    if (error) {
      return next(error, server)
    }

    return server.start(function (error) {
      next(error, server)
    })
  })
}
