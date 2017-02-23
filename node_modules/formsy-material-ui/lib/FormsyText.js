'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _keycode = require('keycode');

var _keycode2 = _interopRequireDefault(_keycode);

var _formsyReact = require('formsy-react');

var _formsyReact2 = _interopRequireDefault(_formsyReact);

var _TextField = require('material-ui/TextField');

var _TextField2 = _interopRequireDefault(_TextField);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var FormsyText = _react2.default.createClass({
  displayName: 'FormsyText',


  propTypes: {
    defaultValue: _react2.default.PropTypes.any,
    name: _react2.default.PropTypes.string.isRequired,
    onBlur: _react2.default.PropTypes.func,
    onChange: _react2.default.PropTypes.func,
    onKeyDown: _react2.default.PropTypes.func,
    requiredError: _react2.default.PropTypes.string,
    underlineFocusStyle: _react2.default.PropTypes.object,
    underlineStyle: _react2.default.PropTypes.object,
    updateImmediately: _react2.default.PropTypes.bool,
    validationColor: _react2.default.PropTypes.string,
    validationError: _react2.default.PropTypes.string,
    validationErrors: _react2.default.PropTypes.object,
    validations: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.object]),
    value: _react2.default.PropTypes.any
  },

  mixins: [_formsyReact2.default.Mixin],

  defaultProps: {
    underlineFocusStyle: {},
    underlineStyle: {}
  },

  getInitialState: function getInitialState() {
    var value = this.controlledValue();
    return { value: value };
  },
  componentWillMount: function componentWillMount() {
    this.setValue(this.controlledValue());
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var isValueChanging = nextProps.value !== this.props.value;
    if (isValueChanging || nextProps.defaultValue !== this.props.defaultValue) {
      var value = this.controlledValue(nextProps);
      var isValid = this.isValidValue(value);

      if (isValueChanging || this.props.defaultValue === this.getValue()) {
        this.setState({ value: value, isValid: isValid });
        this.setValue(value);
      }
    }
  },
  componentWillUpdate: function componentWillUpdate(nextProps, nextState) {
    if (nextState._isPristine && // eslint-disable-line no-underscore-dangle
    nextState._isPristine !== this.state._isPristine) {
      // eslint-disable-line no-underscore-dangle
      // Calling state here is valid, as it cannot cause infinite recursion.
      var value = this.controlledValue(nextProps);
      var isValid = this.isValidValue(value);
      this.setValue(value);
      this.setState({ value: value, isValid: isValid });
    }
  },
  controlledValue: function controlledValue() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

    return props.value || props.defaultValue || '';
  },
  validationColor: function validationColor() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

    return props.validationColor || '#4CAF50';
  },
  handleBlur: function handleBlur(event) {
    this.setValue(event.currentTarget.value);
    delete this.changeValue;
    if (this.props.onBlur) this.props.onBlur(event);
  },
  handleChange: function handleChange(event) {
    // Update the value (and so display any error) after a timeout.
    if (this.props.updateImmediately) {
      if (!this.changeValue) {
        this.changeValue = (0, _utils.debounce)(this.setValue, 400);
      }
      this.changeValue(event.currentTarget.value);
    } else {
      // If there was an error (on loss of focus) update on each keypress to resolve same.
      if (this.getErrorMessage() != null) {
        this.setValue(event.currentTarget.value);
      } else {
        // Only update on valid values, so as to not generate an error until focus is lost.
        if (this.isValidValue(event.target.value)) {
          this.setValue(event.currentTarget.value);
          // If it becomes invalid, and there isn't an error message, invalidate without error.
        }
      }
    }

    // Controlled component
    this.setState({ value: event.currentTarget.value, isValid: this.isValidValue(event.currentTarget.value) });
    if (this.props.onChange) this.props.onChange(event, event.currentTarget.value);
  },
  handleKeyDown: function handleKeyDown(event) {
    if ((0, _keycode2.default)(event) === 'enter') this.setValue(event.currentTarget.value);
    if (this.props.onKeyDown) this.props.onKeyDown(event, event.currentTarget.value);
  },


  setMuiComponentAndMaybeFocus: _utils.setMuiComponentAndMaybeFocus,

  render: function render() {
    var _props = this.props,
        defaultValue = _props.defaultValue,
        requiredError = _props.requiredError,
        underlineFocusStyle = _props.underlineFocusStyle,
        underlineStyle = _props.underlineStyle,
        updateImmediately = _props.updateImmediately,
        validations = _props.validations,
        validationError = _props.validationError,
        validationErrors = _props.validationErrors,
        value = _props.value,
        rest = _objectWithoutProperties(_props, ['defaultValue', 'requiredError', 'underlineFocusStyle', 'underlineStyle', 'updateImmediately', 'validations', 'validationError', 'validationErrors', 'value']);

    var isRequired = this.isRequired,
        isPristine = this.isPristine,
        isValid = this.isValid,
        isFormSubmitted = this.isFormSubmitted;

    var isRequiredError = isRequired() && !isPristine() && !isValid() && isFormSubmitted() && requiredError;
    var errorText = this.getErrorMessage() || isRequiredError;

    return _react2.default.createElement(_TextField2.default, _extends({
      disabled: this.isFormDisabled()
    }, rest, {
      errorText: errorText,
      onBlur: this.handleBlur,
      onChange: this.handleChange,
      onKeyDown: this.handleKeyDown,
      ref: this.setMuiComponentAndMaybeFocus,
      value: this.state.value,
      underlineStyle: this.state.isValid ? { color: this.validationColor() } : underlineStyle,
      underlineFocusStyle: this.state.isValid ? { color: this.validationColor() } : underlineFocusStyle
    }));
  }
});

exports.default = FormsyText;