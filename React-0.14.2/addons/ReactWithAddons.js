/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactWithAddons
 */

/**
 * This module exists purely in the open source project, and is meant as a way
 * to create a separate standalone build of React. This build has "addons", or
 * functionality we've built and think might be useful but doesn't have a good
 * place to live inside React core.
 */

'use strict';

var LinkedStateMixin = require('./link/LinkedStateMixin');
var React = require('../React');
var ReactComponentWithPureRenderMixin = require('./ReactComponentWithPureRenderMixin');
var ReactCSSTransitionGroup = require('./transitions/ReactCSSTransitionGroup');
var ReactFragment = require('./ReactFragment');
var ReactTransitionGroup = require('./transitions/ReactTransitionGroup');
var ReactUpdates = require('../renderers/shared/reconciler/ReactUpdates');

var cloneWithProps = require('../isomorphic/deprecated/cloneWithProps');
var shallowCompare = require('./shallowCompare');
var update = require('./update');
var warning = require('fbjs/lib/warning');

var warnedAboutBatchedUpdates = false;

React.addons = {
  CSSTransitionGroup: ReactCSSTransitionGroup,
  LinkedStateMixin: LinkedStateMixin,
  PureRenderMixin: ReactComponentWithPureRenderMixin,
  TransitionGroup: ReactTransitionGroup,

  batchedUpdates: function () {
    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_ENV !== 'production' ? warning(warnedAboutBatchedUpdates, 'React.addons.batchedUpdates is deprecated. Use ' + 'ReactDOM.unstable_batchedUpdates instead.') : undefined;
      warnedAboutBatchedUpdates = true;
    }
    return ReactUpdates.batchedUpdates.apply(this, arguments);
  },
  cloneWithProps: cloneWithProps,
  createFragment: ReactFragment.create,
  shallowCompare: shallowCompare,
  update: update
};

if (process.env.NODE_ENV !== 'production') {
  React.addons.Perf = require('../test/ReactDefaultPerf');
  React.addons.TestUtils = require('../test/ReactTestUtils');
}

module.exports = React;