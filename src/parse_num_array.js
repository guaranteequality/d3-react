function parseNumArray(str) {
  str = str.replace(/^\s+|\s+$/g, '');
  str = str.replace(/^\[|\]$/g, '');

  var getSeparator = function (str) {
    if (str.match(/[,|.].*;/)) {
      return /\s*;\s*/;
    }

    var spaceSep = /\s+/;
    if (str.match(/.\.*,/) || str.match(/,.*\./) ) {
      if (str.match(/\s/)) {
        if (str.match(/\s+,|,\s+/)) {
          return /\s+,|,\s+/;
        }

        var commaSep = /\s*,\s*/;
        var spaceLen = str.split(spaceSep).length;
        var commaLen = str.split(commaSep).length;

        if (spaceLen > commaLen) {
          return spaceSep;
        }

        return commaSep;
      }
      return /,/;
    }

    return spaceSep;
  }

  var separator = getSeparator(str);

  // return str
  //   .split(separator)
  //   .filter(function(val) {
  //     return val.length > 0;
  //   })
  //   .map(function(val) {
  //     var val = val.replace(/^\s+|\s+$/g, '');

  //     if (val.match(/,/)) {
  //       val = val.replace(/,/, '.');
  //     }

  //     return Number(val);
  //   });
  var numArray = str
    .split(separator)
    .filter(function(val) {
      return val.length > 0;
    })
    .map(function(val) {
      var val = val.replace(/^\s+|\s+$/g, '');

      if (val.match(/,/)) {
        val = val.replace(/,/, '.');
      }

      return Number(val);
    });

  return numArray;
}

module.exports.parseNumArray = parseNumArray;
