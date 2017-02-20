'use strict';

exports.__esModule = true;
exports.default = createProps;
function createProps(propTypes, props, className) {
  var newProps = {};

  Object.keys(props).filter(function (key) {
    return key === 'children' || !propTypes[key];
  }).forEach(function (key) {
    return newProps[key] = props[key];
  });

  return Object.assign({}, newProps, { className: className });
}