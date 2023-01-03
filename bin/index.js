#!/usr/bin/env node

require = require('esm')(module /*, options*/);
require(__dirname + '/../dist/index')(process.argv.slice(2));
