//this allow ESM for node it is entry point
require = require("esm")(module);
module.exports = require("./server");
