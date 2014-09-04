
// Export the PNLTRI object for **Node.js**, with
// backwards-compatibility for the old `require()` API. If we're in
// the browser, add `_` as a global object via a string identifier,
// for Closure Compiler "advanced" mode.

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = PNLTRI;
  }
  exports.PNLTRI = PNLTRI;
} else {
  this['PNLTRI'] = PNLTRI;
}
