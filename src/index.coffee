jshint = require('jshint').JSHINT

formatError = (error) ->
  evidence = (if error.evidence then "\n\n#{error.evidence}\n" else '\n')
  "#{error.reason} #{error.id or ''} at line #{error.line}, column #{error.character}"

clone = (obj) ->
  return obj if not obj? or typeof obj isnt 'object'
  copied = new obj.constructor()
  copied[key] = clone val for key, val of obj
  copied

module.exports = class JSHintLinter
  brunchPlugin: yes
  type: 'javascript'
  extension: 'js'

  constructor: (@config) ->
    cfg = clone @config?.plugins?.jshint ? @config?.jshint ? {}
    
    if @config?.jshint
      console.warn "Warning: config.jshint is deprecated, move it to config.plugins.jshint"

    @options = cfg.options
    @globals = cfg.globals
    @pattern = cfg.pattern ? ///^#{@config.paths.app}.*\.js$///

  lint: (data, path, callback) ->
    success = jshint data, @options, @globals
    if success
      callback()
    else
      error = jshint.errors
        .filter((error) -> error?)
        .map(formatError)
        .join('\n')
      callback error
