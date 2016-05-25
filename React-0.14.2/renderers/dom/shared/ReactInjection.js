/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactInjection
 */

'use strict';

var DOMProperty = require('./DOMProperty');
var EventPluginHub = require('../../shared/event/EventPluginHub');
var ReactComponentEnvironment = require('../../shared/reconciler/ReactComponentEnvironment');
var ReactClass = require('../../../isomorphic/classic/class/ReactClass');
var ReactEmptyComponent = require('../../shared/reconciler/ReactEmptyComponent');
var ReactBrowserEventEmitter = require('../client/ReactBrowserEventEmitter');
var ReactNativeComponent = require('../../shared/reconciler/ReactNativeComponent');
var ReactPerf = require('../../../test/ReactPerf');
var ReactRootIndex = require('../../shared/reconciler/ReactRootIndex');
var ReactUpdates = require('../../shared/reconciler/ReactUpdates');

var ReactInjection = {
  Component: ReactComponentEnvironment.injection,
  Class: ReactClass.injection,
  DOMProperty: DOMProperty.injection,
  EmptyComponent: ReactEmptyComponent.injection,
  EventPluginHub: EventPluginHub.injection,
  EventEmitter: ReactBrowserEventEmitter.injection,
  NativeComponent: ReactNativeComponent.injection,
  Perf: ReactPerf.injection,
  RootIndex: ReactRootIndex.injection,
  Updates: ReactUpdates.injection
};

module.exports = ReactInjection;