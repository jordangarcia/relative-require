Relative Require
===

Refactor absolute require paths to relative paths

**./components/login/LoginForm.js**

```js
var Auth = require('modules/auth');

// ...
```

**Run The Script**

```js
var path = require('path');
var base = path.join(__dirname, './app')
toRelative({
  base: base,
  exclude: [
    'nuclear-js',
    'lodash',
    'es6-promise',
    'immutable',
    'jquery',
    'sprintf',
  ],
  // dont actually write
  dry: true,
});
```

Becomes

```js
var Auth = require('../../modules/auth');

// ...
```

## Options

- **`base`** (required) module resolve root
- **`exclude`** (optional) array of modules to not rewrite
- **`dry`** (optional) dont write files
