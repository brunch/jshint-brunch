var expect = require('chai').expect;
var Plugin = require('.');
var fakefs = require('fake-fs');
var fs = require('fs');

describe('Plugin', function() {
  var plugin, pluginCfg;
  var correctData = 'var a = 228;';
  var fileMock = {data: correctData + ';', path: 'app/file.js'};

  beforeEach(function() {
    pluginCfg = {
      paths: {app: 'app'},
      plugins: {
        jshint: {
          options: {eqnull: true, undef: true},
          globals: {stuff: true}
        }
      }
    };
    plugin = new Plugin(pluginCfg);
  });

  it('should be an object', function() {
    expect(plugin).to.be.ok;
  });

  it('should has #lint method', function() {
    expect(plugin.lint).to.be.an.instanceof(Function);
  });

  it('should lint correctly', function(done) {
    plugin.lint({data: correctData, path: 'app/file.js'}).then(() => done(), error => expect(error).to.not.be.ok);
  });

  it('should give correct errors', function(done) {
    plugin.lint(fileMock).then(null, error => {
      expect(error).to.contain('Unnecessary semicolon');
      done();
    });
  });

  it('should ignore errors in paths other than "^app/..." by default', function(done) {
    expect(plugin.config.plugins.jshint.pattern).to.not.exist;
    plugin.lint({data: 'var a = 228;;', path: 'vendor/file.js'}).then(() => done(), error => expect(error).to.not.be.ok);
  });


  it('should consider other paths when the config contains a respective pattern', function(done) {
    pluginCfg.plugins.jshint.pattern = /^(vendor|app)\/.*\.js$/;
    plugin = new Plugin(pluginCfg);

    var content = 'var a = 228;;';

    plugin.lint({data: content, path: 'vendor/file.js'}).then(null, error => {
      expect(error).to.exist;
      expect(error).to.contain('Unnecessary semicolon');
      done();
    });
  });

  it('should read configs global options list', function(done) {
    var mocked = Object.assign({}, fileMock, {data: 'function a() {return stuff == null;}'})

    plugin.lint(mocked).then(() => done(), error => expect(error).to.not.be.ok);
  });

  it('should not return errors if warn_only is enabled', function(done){
    plugin.warnOnly = true;
    plugin.lint(fileMock).then(() => done(), warn => {
      expect(warn).to.match(/^warn/);
      expect(warn).to.be.ok;
      done();
    });
  });

  it('should read options and globals from .jshintrc', function(done){
    // remove the preloaded jshint options
    delete plugin.config.plugins.jshint.options;
    delete plugin.config.plugins.jshint.globals;


    var jshintrc = {
      globals: {
        stuff: true
      },
      undef: true
    };

    fs = new fakefs;
    fs.file('.jshintrc', JSON.stringify(jshintrc));
    fs.patch();

    plugin = new Plugin(plugin.config);
    expect(plugin.globals).to.eql(jshintrc.globals);
    delete(jshintrc.globals);
    expect(plugin.options).to.eql(jshintrc);
    done();
  });
});
