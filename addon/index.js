import Ember from 'ember';

export default function(app, prefix) {
  var regex = new RegExp('^' + prefix + '\/((?:instance-)?initializers)\/');
  var getKeys = (Object.keys || Ember.keys);
  var moduleNames = getKeys(requirejs._eak_seen);

  var deps = [];
  for (var i = 0; i < moduleNames.length; i++) {
    var moduleName = moduleNames[i];
    var matches = regex.exec(moduleName);

    if (matches && matches.length === 2) {
      deps.push({
        moduleName: moduleName,
        matches: matches
      });
    }
  }

  deps.forEach(function(dep) {
    var moduleName = dep.moduleName;

    var module = require(moduleName, null, null, true);
    if (!module) { throw new Error(moduleName + ' must export an initializer.'); }

    var initializerType = Ember.String.camelize(dep.matches[1].substring(0, dep.matches[1].length - 1));
    var initializer = module['default'];
    if (!initializer.name) {
      var initializerName = moduleName.match(/[^\/]+\/?$/)[0];
      initializer.name = initializerName;
    }

    if (app[initializerType]) {
      app[initializerType](initializer);
    }
  });
}
