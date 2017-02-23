'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _formsyReact = require('formsy-react');

var _formsyReact2 = _interopRequireDefault(_formsyReact);

var _DatePicker = require('material-ui/DatePicker');

var _DatePicker2 = _interopRequireDefault(_DatePicker);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var FormsyDate = _react2.default.createClass({
  displayName: 'FormsyDate',


  propTypes: {
    defaultDate: _react2.default.PropTypes.object,
    name: _react2.default.PropTypes.string.isRequired,
    onChange: _react2.default.PropTypes.func,
    requiredError: _react2.default.PropTypes.string,
    validationError: _react2.default.PropTypes.string,
    validationErrors: _react2.default.PropTypes.object,
    validations: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.object]),
    value: _react2.default.PropTypes.object
  },

  mixins: [_formsyReact2.default.Mixin],

  componentDidMount: function componentDidMount() {
    var defaultDate = this.props.defaultDate;

    var value = this.getValue();

    if (typeof value === 'undefined' && typeof defaultDate !== 'undefined') {
      this.setValue(defaultDate);
    }
  },
  handleChange: function handleChange(event, value) {
    this.setValue(value);
    if (this.props.onChange) this.props.onChange(event, value);
  },


  setMuiComponentAndMaybeFocus: _utils.setMuiComponentAndMaybeFocus,

  render: function render() {
    var _props = this.props,
        defaultDate = _props.defaultDate,
        validations = _props.validations,
        validationErrors = _props.validationErrors,
        validationError = _props.validationError,
        requiredError = _props.requiredError,
        rest = _objectWithoutProperties(_props, ['defaultDate', 'validations', 'validationErrors', 'validationError', 'requiredError']);

    var isRequired = this.isRequired,
        isPristine = this.isPristine,
        isValid = this.isValid,
        isFormSubmitted = this.isFormSubmitted;

    var isRequiredError = isRequired() && !isPristine() && !isValid() && isFormSubmitted() && requiredError;
    var errorText = this.getErrorMessage() || isRequiredError;
    return _react2.default.createElement(_DatePicker2.default, _extends({
      disabled: this.isFormDisabled()
    }, rest, {
      errorText: errorText,
      onChange: this.handleChange,
      ref: this.setMuiComponentAndMaybeFocus,
      value: this.getValue()
    }));
  }
});

exports.default = FormsyDate;