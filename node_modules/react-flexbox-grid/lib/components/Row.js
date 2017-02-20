'use strict';

exports.__esModule = true;
exports.default = Row;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _createProps = require('../createProps');

var _createProps2 = _interopRequireDefault(_createProps);

var _flexboxgrid = require('flexboxgrid');

var _flexboxgrid2 = _interopRequireDefault(_flexboxgrid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ModificatorType = _react.PropTypes.oneOf(['xs', 'sm', 'md', 'lg']);
var modificatorKeys = ['start', 'center', 'end', 'top', 'middle', 'bottom', 'around', 'between', 'first', 'last'];

var propTypes = {
  reverse: _react.PropTypes.bool,
  start: ModificatorType,
  center: ModificatorType,
  end: ModificatorType,
  top: ModificatorType,
  middle: ModificatorType,
  bottom: ModificatorType,
  around: ModificatorType,
  between: ModificatorType,
  first: ModificatorType,
  last: ModificatorType,
  className: _react.PropTypes.string,
  tagName: _react.PropTypes.string,
  children: _react.PropTypes.node
};

function getClassNames(props) {
  var modificators = [_flexboxgrid2.default.row];

  for (var i = 0; i < modificatorKeys.length; ++i) {
    var key = modificatorKeys[i];
    var value = props[key];
    if (value) {
      modificators.push(_flexboxgrid2.default[key + '-' + value]);
    }
  }

  if (props.reverse) {
    modificators.push(_flexboxgrid2.default.reverse);
  }

  return (0, _classnames2.default)(props.className, modificators);
}

function Row(props) {
  return _react2.default.createElement(props.tagName || 'div', (0, _createProps2.default)(propTypes, props, getClassNames(props)));
}

Row.propTypes = propTypes;