## jshint-brunch
Adds JSHint support to
[brunch](http://brunch.io).

## Usage
Install the plugin via npm with `npm install --save jshint-brunch`.

Or, do manual install:

* Add `"jshint-brunch": "x.y.z"` to `package.json` of your brunch app.
  Pick a plugin version that corresponds to your minor (y) brunch version.
* If you want to use git version of plugin, add
`"jshint-brunch": "git+ssh://git@github.com:brunch/jshint-brunch.git"`.

By default, only files in your `config.paths.app` are linted.

You can customize jshint config by changing brunch config:

```coffeescript
config =
  plugins:
    jshint:
      pattern: /^app\/.*\.js$/
      options:
        bitwise: true
        curly: true
      globals:
        jQuery: true
```

Every sub-option (`pattern`, `options`, `globals`) is optional.
