jshint = require('jshint').JSHINT
jshintcli = require('jshint/src/cli')
fs = require('fs')
path = require('path')

formatError = (error) ->
  evidence = (if error.evidence then "\n\n#{error.evidence}\n" else '\n')
  "#{error.reason} #{error.id or ''} at line #{error.line}, column #{error.character}"

 removeComments = (str) ->
   str = str or ""
   str = str.replace /\/\*(?:(?!\*\/)[\s\S])*\*\//g, ""
   str = str.replace /\/\/[^\n\r]*/g, "" # Everything after '//'

module.exports = class JSHintLinter
  brunchPlugin: yes
  type: 'javascript'
  extension: 'js'

  constructor: (@config) ->
    cfg = @config?.plugins?.jshint ? @config?.jshint ? {}

    @options = if cfg.options? then cfg.options
    @globals = cfg.globals
    @pattern = cfg.pattern ? ///^#{@config.paths.app}.*\.js$///
    @warn_only = cfg.warn_only
    @error = false

    if @config?.jshint
      console.warn "Warning: config.jshint is deprecated, move it to config.plugins.jshint"
      process.exit 1

  lint: (data, path, callback) ->
    success = jshint data, @options, @globals

    if success
      callback()
      return
    else
      error = jshint.errors
      .filter((error) -> error?)
      .map(formatError)
      .join('\n')


    if @warn_only? and error?
      error = "warn: #{error}"
    
    callback error
                                        
