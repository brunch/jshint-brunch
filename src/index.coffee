jshint = require('jshint').JSHINT
jshintcli = require('jshint/src/cli')
fs = require('fs')
path = require('path')
logger = require('loggy')
chalk = require('chalk')
pluralize = require('pluralize')

pad = (str, length) ->
  while str.length < length
    str = ' ' + str
  str

removeComments = (str) ->
  str = str or ""
  str = str.replace /\/\*(?:(?!\*\/)[\s\S])*\*\//g, ""
  str = str.replace /\/\/[^\n\r]*/g, "" # Everything after '//'

module.exports = class JSHintLinter
  brunchPlugin: yes
  type: 'javascript'
  extension: 'js'

  constructor: (@config) ->
    if 'jshint' of @config
      console.warn "Warning: config.jshint is deprecated, please move it to config.plugins.jshint"

    cfg = @config?.plugins?.jshint ? @config?.jshint ? {}
    @options = if cfg.options? then cfg.options
    @globals = cfg.globals
    @pattern = cfg.pattern ? ///(#{@config.paths?.watched?.join("|") or "app"}).*\.js$///
    @warnOnly = cfg.warnOnly

    unless @options
      filename = path.join process.cwd(), ".jshintrc"
      # read settings from .jshintrc file if exists
      try
        stats = fs.statSync(filename)

        if stats.isFile()
          buff = fs.readFileSync filename
          @options = JSON.parse removeComments buff.toString()
          {@globals} = @options
          delete @options.globals
      catch e
        e = e.toString().replace "Error: ENOENT, ", ""
        console.warn ".jshintrc parsing error: #{e}. jshint will run with default options."

  lint: (data, path, callback) ->
    success = jshint data, @options, @globals

    if success
      callback()
      return
    else
      errors = jshint.errors
      errorMsg = for error in errors
        do (error) =>
          """
          #{pad error.line.toString(), 7} | #{chalk.gray error.evidence}
          #{pad "^", 10 + error.character} #{chalk.bold error.reason}
          """

    errorMsg.unshift "JSHint detected #{errors.length} #{pluralize 'problem', errors.length}."
    errorMsg.push '\n'


    msg = errorMsg.join '\n\n'
    msg = "warn: #{msg}" if @warnOnly

    callback msg
