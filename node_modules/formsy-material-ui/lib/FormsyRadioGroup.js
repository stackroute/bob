'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _formsyReact = require('formsy-react');

var _formsyReact2 = _interopRequireDefault(_formsyReact);

var _RadioButton = require('material-ui/RadioButton');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var FormsyRadioGroup = _react2.default.createClass({
  displayName: 'FormsyRadioGroup',


  propTypes: {
    children: _react2.default.PropTypes.node,
    defaultSelected: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.number, _react2.default.PropTypes.bool]),
    name: _react2.default.PropTypes.string.isRequired,
    onChange: _react2.default.PropTypes.func,
    validationError: _react2.default.PropTypes.string,
    validationErrors: _react2.default.PropTypes.object,
    validations: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.object]),
    value: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.number, _react2.default.PropTypes.bool])
  },

  mixins: [_formsyReact2.default.Mixin],

  componentDidMount: function componentDidMount() {
    this.setValue(this.muiComponent.getSelectedValue());
  },
  handleValueChange: function handleValueChange(event, value) {
    this.setValue(value);
    if (this.props.onChange) this.props.onChange(event, value);
  },


  setMuiComponentAndMaybeFocus: _utils.setMuiComponentAndMaybeFocus,

  render: function render() {
    var _props = this.props,
        validations = _props.validations,
        validationError = _props.validationError,
        validationErrors = _props.validationErrors,
        defaultSelected = _props.defaultSelected,
        value = _props.value,
        rest = _objectWithoutProperties(_props, ['validations', 'validationError', 'validationErrors', 'defaultSelected', 'value']);

    // remove unknown props from children


    var children = _react2.default.Children.map(this.props.children, function (radio) {
      var _radio$props = radio.props,
          validations = _radio$props.validations,
          validationError = _radio$props.validationError,
          validationErrors = _radio$props.validationErrors,
          rest = _objectWithoutProperties(_radio$props, ['validations', 'validationError', 'validationErrors']);

      return _react2.default.createElement(_RadioButton.RadioButton, rest);
    });

    // For backward compatibility or for
    // users used to MaterialUI, use the "defaultSelected"
    // attribute for the "value" if the value was not
    // explicitly set.
    if (typeof value === 'undefined') {
      value = defaultSelected;
    }

    return _react2.default.createElement(
      _RadioButton.RadioButtonGroup,
      _extends({
        disabled: this.isFormDisabled()
      }, rest, {
        ref: this.setMuiComponentAndMaybeFocus,
        onChange: this.handleValueChange,
        valueSelected: this.getValue(),
        defaultSelected: value
      }),
      children
    );
  }
});

exports.default = FormsyRadioGroup;