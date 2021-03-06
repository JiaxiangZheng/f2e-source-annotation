/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactIsomorphic
 */

'use strict';

var ReactChildren = require('./children/ReactChildren');
var ReactComponent = require('./modern/class/ReactComponent');
var ReactClass = require('./classic/class/ReactClass');
var ReactDOMFactories = require('./classic/element/ReactDOMFactories');
var ReactElement = require('./classic/element/ReactElement');
var ReactElementValidator = require('./classic/element/ReactElementValidator');
var ReactPropTypes = require('./classic/types/ReactPropTypes');
var ReactVersion = require('../ReactVersion');

var assign = require('../shared/stubs/Object.assign');

// NOTE(xuanfeng): 没看懂，在生产环境下就是返回输入的第一个参数
var onlyChild = require('./children/onlyChild');

var createElement = ReactElement.createElement;
var createFactory = ReactElement.createFactory;
var cloneElement = ReactElement.cloneElement;

// NOTE(xuanfeng): 在开发环境下会对参数类型等进行严格的校验，但考虑到这些验证会对性能有一定影响，线上环境不会作校验 
if (process.env.NODE_ENV !== 'production') {
  createElement = ReactElementValidator.createElement;
  createFactory = ReactElementValidator.createFactory;
  cloneElement = ReactElementValidator.cloneElement;
}

var React = {

  // Modern

  Children: {
    map: ReactChildren.map,
    forEach: ReactChildren.forEach,
    count: ReactChildren.count,
    toArray: ReactChildren.toArray,
    only: onlyChild
  },

  Component: ReactComponent,

  createElement: createElement,
  cloneElement: cloneElement,
  isValidElement: ReactElement.isValidElement,

  // Classic

  PropTypes: ReactPropTypes,
  createClass: ReactClass.createClass,
  createFactory: createFactory,
  createMixin: function (mixin) {
    // Currently a noop. Will be used to validate and trace mixins.
    return mixin;
  },

  // This looks DOM specific but these are actually isomorphic helpers
  // since they are just generating DOM strings.
  DOM: ReactDOMFactories,

  version: ReactVersion,

  // Hook for JSX spread, don't use this for anything else.
  __spread: assign
};

module.exports = React;