function debounce (idle, func) {
  var last;
  return function() {
    var ctx = this, args = arguments
    if (last) {
      clearTimeout(last)
    }
    last = setTimeout(() => {
      func.apply(ctx, args)
    }, idle)
  }
}

module.exports = debounce