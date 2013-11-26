describe('Plugin', function() {
  var plugin;

  beforeEach(function() {
    plugin = new Plugin({
      paths: {app: 'app'},
      plugins: {
        jshint: {
          options: {eqnull: true, undef: true},
          globals: {stuff: true}
        }
      }
    });
  });

  it('should be an object', function() {
    expect(plugin).to.be.ok;
  });

  it('should has #lint method', function() {
    expect(plugin.lint).to.be.an.instanceof(Function);
  });

  it('should lint correctly', function(done) {
    var content = 'var a = 228;'

    plugin.lint(content, 'file.js', function(error) {
      expect(error).to.not.be.ok;
      done();
    });
  });

  it('should give correct errors', function(done) {
    var content = 'var a = 228;;'

    plugin.lint(content, 'file.js', function(error) {
      expect(error).to.equal('Unnecessary semicolon. (error) at line 1, column 13');
      done();
    });
  });

  it('should read configs global options list', function(done) {
    var content = 'function a() {return stuff == null;}'

    plugin.lint(content, 'file.js', function(error) {
      expect(error).to.equal(undefined)
      done();
    });
  });

  it('should not return errors if warn_only is enabled', function(done){
    plugin.warnOnly = true
    var content = 'var a = 228;;'

    plugin.lint(content, 'file.js', function(warn){
      expect(warn).to.match(/^warn/);
      expect(warn).to.be.ok;
      done();
    });
  });

  it('should read options and globals from .jshintrc', function(done){
    // remove the preloaded jshint options
    delete plugin.config.plugins.jshint.options
    delete plugin.config.plugins.jshint.globals
  

    var jshintrc = {
      globals: {
        stuff: true
      },
      undef: true
    }

    fs = new fakefs;
    fs.file('.jshintrc', JSON.stringify(jshintrc));
    fs.patch()   

    plugin.constructor(plugin.config);
    expect(plugin.globals).to.eql(jshintrc.globals);
    delete(jshintrc.globals);
    expect(plugin.options).to.eql(jshintrc);
    done();
  });
});
