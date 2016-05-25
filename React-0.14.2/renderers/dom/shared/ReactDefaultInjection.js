/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDefaultInjection
 */

'use strict';

var BeforeInputEventPlugin = require('../client/eventPlugins/BeforeInputEventPlugin');
var ChangeEventPlugin = require('../client/eventPlugins/ChangeEventPlugin');
var ClientReactRootIndex = require('../client/ClientReactRootIndex');
var DefaultEventPluginOrder = require('../client/eventPlugins/DefaultEventPluginOrder');
var EnterLeaveEventPlugin = require('../client/eventPlugins/EnterLeaveEventPlugin');
var ExecutionEnvironment = require('fbjs/lib/ExecutionEnvironment');
var HTMLDOMPropertyConfig = require('./HTMLDOMPropertyConfig');
var ReactBrowserComponentMixin = require('./ReactBrowserComponentMixin');
var ReactComponentBrowserEnvironment = require('./ReactComponentBrowserEnvironment');
var ReactDefaultBatchingStrategy = require('../../shared/reconciler/ReactDefaultBatchingStrategy');
var ReactDOMComponent = require('./ReactDOMComponent');
var ReactDOMTextComponent = require('./ReactDOMTextComponent');
var ReactEventListener = require('../client/ReactEventListener');
var ReactInjection = require('./ReactInjection');
var ReactInstanceHandles = require('../../shared/reconciler/ReactInstanceHandles');
var ReactMount = require('../client/ReactMount');
var ReactReconcileTransaction = require('../client/ReactReconcileTransaction');
var SelectEventPlugin = require('../client/eventPlugins/SelectEventPlugin');
var ServerReactRootIndex = require('../server/ServerReactRootIndex');
var SimpleEventPlugin = require('../client/eventPlugins/SimpleEventPlugin');
var SVGDOMPropertyConfig = require('./SVGDOMPropertyConfig');

var alreadyInjected = false;

// NOTE(xuanfeng): 提供一个通用的 injection 接口，向其注入默认配置以生成其对应私有变量的内容。注入一系列默认的处理接口插件，包括：
// - 事件处理系统
function inject() {
  if (alreadyInjected) {
    // TODO: This is currently true because these injections are shared between
    // the client and the server package. They should be built independently
    // and not share any injection state. Then this problem will be solved.
    return;
  }
  alreadyInjected = true;

  // NOTE(xuanfeng): 向 ReactBrowserEventEmitter 注入 ReactEventListener
  ReactInjection.EventEmitter.injectReactEventListener(ReactEventListener);

  /**
   * Inject modules for resolving DOM hierarchy and plugin ordering.
   */
  ReactInjection.EventPluginHub.injectEventPluginOrder(DefaultEventPluginOrder);
  ReactInjection.EventPluginHub.injectInstanceHandle(ReactInstanceHandles);
  ReactInjection.EventPluginHub.injectMount(ReactMount);

  /**
   * Some important event plugins included by default (without having to require
   * them).
   */
  ReactInjection.EventPluginHub.injectEventPluginsByName({
    SimpleEventPlugin: SimpleEventPlugin,
    EnterLeaveEventPlugin: EnterLeaveEventPlugin,
    ChangeEventPlugin: ChangeEventPlugin,
    SelectEventPlugin: SelectEventPlugin,
    BeforeInputEventPlugin: BeforeInputEventPlugin
  });

  ReactInjection.NativeComponent.injectGenericComponentClass(ReactDOMComponent);
  ReactInjection.NativeComponent.injectTextComponentClass(ReactDOMTextComponent);

  // 默认为每一个 ReactComponent 提供了一个 getDOMNode 的方法
  ReactInjection.Class.injectMixin(ReactBrowserComponentMixin);

  // NOTE(xuanfeng): 向 DOMProperty 中注入 HTML & SVG DOM 属性配置，如在 React 中使用 className 替代 class 等
  ReactInjection.DOMProperty.injectDOMPropertyConfig(HTMLDOMPropertyConfig);
  ReactInjection.DOMProperty.injectDOMPropertyConfig(SVGDOMPropertyConfig);

  // NOTE(xuanfeng): 本质上调用 ReactElement.createElement 设置其私有属性 placeholderElement
  ReactInjection.EmptyComponent.injectEmptyComponent('noscript');

  ReactInjection.Updates.injectReconcileTransaction(ReactReconcileTransaction);
  ReactInjection.Updates.injectBatchingStrategy(ReactDefaultBatchingStrategy);

  ReactInjection.RootIndex.injectCreateReactRootIndex(ExecutionEnvironment.canUseDOM ? ClientReactRootIndex.createReactRootIndex : ServerReactRootIndex.createReactRootIndex);

  ReactInjection.Component.injectEnvironment(ReactComponentBrowserEnvironment);

  if (process.env.NODE_ENV !== 'production') {
    var url = ExecutionEnvironment.canUseDOM && window.location.href || '';
    if (/[?&]react_perf\b/.test(url)) {
      var ReactDefaultPerf = require('../../../test/ReactDefaultPerf');
      ReactDefaultPerf.start();
    }
  }
}

module.exports = {
  inject: inject
};
