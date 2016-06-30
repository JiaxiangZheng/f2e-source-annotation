# 源码分析

从 `React.js` 文件入口，暂时忽略掉 `__REACT_DEVTOOLS_GLOBAL_HOOK__` 相关的内容。

## React 核心结构

React 的代码结构如下图所示，可以看到，`addons` 和 `shared` 是一些额外的辅助代码，可以先忽略掉，而 React 的核心主要在于 `isomorphics` 和 `renderers` 这两块。`React.js` 作为主入口，我们会发现，其中大部分是用于兼容老的 API 而作的一层包装，使用 `deprecated` 作为提示，React 的主要方法则从 `ReactIsomorphic` 中获得。而与 DOM 相关的方法，客户端最好通过额外引用 `ReactDOM` 来获得，服务端则引用 `ReactDOMServer` 。

所以说，本质上我们的代码入口有三个地方：`isomorphic/ReactIsomorphic`、`renderers/dom/ReactDOM.js` 和 `renderers/dom/ReactDOMServer.js`。

```
├── React.js
├── ReactVersion.js
├── addons
│   ├── ReactComponentWithPureRenderMixin.js
│   ├── ReactFragment.js
│   ├── ReactWithAddons.js
│   ├── link
│   │   ├── LinkedStateMixin.js
│   │   └── ReactLink.js
│   ├── renderSubtreeIntoContainer.js
│   ├── shallowCompare.js
│   ├── transitions
│   │   ├── ReactCSSTransitionGroup.js
│   │   ├── ReactCSSTransitionGroupChild.js
│   │   ├── ReactTransitionChildMapping.js
│   │   ├── ReactTransitionEvents.js
│   │   └── ReactTransitionGroup.js
│   └── update.js
├── isomorphic
│   ├── ReactIsomorphic.js
│   ├── children
│   │   ├── ReactChildren.js
│   │   ├── onlyChild.js
│   │   └── sliceChildren.js
│   ├── classic
│   │   ├── class
│   │   │   └── ReactClass.js
│   │   ├── element
│   │   │   ├── ReactCurrentOwner.js
│   │   │   ├── ReactDOMFactories.js
│   │   │   ├── ReactElement.js
│   │   │   └── ReactElementValidator.js
│   │   └── types
│   │       ├── ReactPropTypeLocationNames.js
│   │       ├── ReactPropTypeLocations.js
│   │       └── ReactPropTypes.js
│   ├── deprecated
│   │   ├── OrderedMap.js
│   │   ├── ReactPropTransferer.js
│   │   └── cloneWithProps.js
│   └── modern
│       └── class
│           ├── ReactComponent.js
│           └── ReactNoopUpdateQueue.js
├── renderers
│   ├── dom
│   │   ├── ReactDOM.js
│   │   ├── ReactDOMServer.js
│   │   ├── client
│   │   │   ├── ClientReactRootIndex.js
│   │   │   ├── ReactBrowserEventEmitter.js
│   │   │   ├── ReactDOMIDOperations.js
│   │   │   ├── ReactDOMSelection.js
│   │   │   ├── ReactEventListener.js
│   │   │   ├── ReactInputSelection.js
│   │   │   ├── ReactMount.js
│   │   │   ├── ReactReconcileTransaction.js
│   │   │   ├── eventPlugins
│   │   │   │   ├── BeforeInputEventPlugin.js
│   │   │   │   ├── ChangeEventPlugin.js
│   │   │   │   ├── DefaultEventPluginOrder.js
│   │   │   │   ├── EnterLeaveEventPlugin.js
│   │   │   │   ├── FallbackCompositionState.js
│   │   │   │   ├── SelectEventPlugin.js
│   │   │   │   ├── SimpleEventPlugin.js
│   │   │   │   └── TapEventPlugin.js
│   │   │   ├── findDOMNode.js
│   │   │   ├── syntheticEvents
│   │   │   │   ├── SyntheticClipboardEvent.js
│   │   │   │   ├── SyntheticCompositionEvent.js
│   │   │   │   ├── SyntheticDragEvent.js
│   │   │   │   ├── SyntheticEvent.js
│   │   │   │   ├── SyntheticFocusEvent.js
│   │   │   │   ├── SyntheticInputEvent.js
│   │   │   │   ├── SyntheticKeyboardEvent.js
│   │   │   │   ├── SyntheticMouseEvent.js
│   │   │   │   ├── SyntheticTouchEvent.js
│   │   │   │   ├── SyntheticUIEvent.js
│   │   │   │   └── SyntheticWheelEvent.js
│   │   │   ├── utils
│   │   │   │   ├── DOMChildrenOperations.js
│   │   │   │   ├── ViewportMetrics.js
│   │   │   │   ├── getEventCharCode.js
│   │   │   │   ├── getEventKey.js
│   │   │   │   ├── getEventModifierState.js
│   │   │   │   ├── getEventTarget.js
│   │   │   │   ├── getNodeForCharacterOffset.js
│   │   │   │   ├── getTextContentAccessor.js
│   │   │   │   ├── isEventSupported.js
│   │   │   │   ├── setInnerHTML.js
│   │   │   │   └── setTextContent.js
│   │   │   ├── validateDOMNesting.js
│   │   │   └── wrappers
│   │   │       ├── AutoFocusUtils.js
│   │   │       ├── LinkedValueUtils.js
│   │   │       ├── ReactDOMButton.js
│   │   │       ├── ReactDOMInput.js
│   │   │       ├── ReactDOMOption.js
│   │   │       ├── ReactDOMSelect.js
│   │   │       └── ReactDOMTextarea.js
│   │   ├── server
│   │   │   ├── ReactMarkupChecksum.js
│   │   │   ├── ReactServerBatchingStrategy.js
│   │   │   ├── ReactServerRendering.js
│   │   │   ├── ReactServerRenderingTransaction.js
│   │   │   └── ServerReactRootIndex.js
│   │   └── shared
│   │       ├── CSSProperty.js
│   │       ├── CSSPropertyOperations.js
│   │       ├── DOMProperty.js
│   │       ├── DOMPropertyOperations.js
│   │       ├── Danger.js
│   │       ├── HTMLDOMPropertyConfig.js
│   │       ├── ReactBrowserComponentMixin.js
│   │       ├── ReactComponentBrowserEnvironment.js
│   │       ├── ReactDOMComponent.js
│   │       ├── ReactDOMFeatureFlags.js
│   │       ├── ReactDOMTextComponent.js
│   │       ├── ReactDefaultInjection.js
│   │       ├── ReactInjection.js
│   │       ├── SVGDOMPropertyConfig.js
│   │       └── dangerousStyleValue.js
│   └── shared
│       ├── event
│       │   ├── EventConstants.js
│       │   ├── EventPluginHub.js
│       │   ├── EventPluginRegistry.js
│       │   ├── EventPluginUtils.js
│       │   ├── EventPropagators.js
│       │   └── eventPlugins
│       │       ├── ResponderEventPlugin.js
│       │       ├── ResponderSyntheticEvent.js
│       │       └── ResponderTouchHistoryStore.js
│       └── reconciler
│           ├── ReactChildReconciler.js
│           ├── ReactComponentEnvironment.js
│           ├── ReactCompositeComponent.js
│           ├── ReactDefaultBatchingStrategy.js
│           ├── ReactEmptyComponent.js
│           ├── ReactEmptyComponentRegistry.js
│           ├── ReactEventEmitterMixin.js
│           ├── ReactInstanceHandles.js
│           ├── ReactInstanceMap.js
│           ├── ReactMultiChild.js
│           ├── ReactMultiChildUpdateTypes.js
│           ├── ReactNativeComponent.js
│           ├── ReactOwner.js
│           ├── ReactReconciler.js
│           ├── ReactRef.js
│           ├── ReactRootIndex.js
│           ├── ReactStateSetters.js
│           ├── ReactUpdateQueue.js
│           ├── ReactUpdates.js
│           ├── instantiateReactComponent.js
│           └── shouldUpdateReactComponent.js
├── shared（额外的功能性的辅助代码，供 React 内部调用，但与 React 本身的逻辑不耦合）
│   ├── stubs
│   │   └── Object.assign.js
│   ├── utils
│   │   ├── CallbackQueue.js
│   │   ├── PooledClass.js
│   │   ├── ReactErrorUtils.js
│   │   ├── Transaction.js
│   │   ├── accumulate.js
│   │   ├── accumulateInto.js
│   │   ├── adler32.js
│   │   ├── canDefineProperty.js
│   │   ├── deprecated.js
│   │   ├── escapeTextContentForBrowser.js
│   │   ├── flattenChildren.js
│   │   ├── forEachAccumulated.js
│   │   ├── getIteratorFn.js
│   │   ├── isTextInputElement.js
│   │   ├── quoteAttributeValueForBrowser.js
│   │   └── traverseAllChildren.js
│   └──
└──
```

不考虑目录结果，如果我们把 React 抽丝剥茧般地去除细节，只保留代码骨架，就会发现，整个 React核心 的结构主要包括：

1. 组件工厂
2. 组件挂载
3. 状态管理器
4. 生命周期管理
5. virtual DOM
6. 事件系统

基本上 React 对这几块内容做了尽可能能的高内聚，低耦合，通过 `ReactInjection` 注入的方式将各组件拼装起来，形成一个完整的 React。后面开始会对这些内容进行分析。

- [代码预处理](./ReactCodePreprocess.md)
- [底层基础模块](./BaseModule.md)
- [ReactIsomorphics 模块](./react-study/ReactIsomorphics.md)
- [ReactDOM 模块](./react-study/ReactDOM.md)

*************************************************************************

一个简短的 React 源码分析：<http://purplebamboo.github.io/2015/09/15/reactjs_source_analyze_part_one/>

组件、元素、实例区别：

`https://facebook.github.io/react/blog/2015/12/18/react-components-elements-and-instances.html`

<https://github.com/purplebamboo/little-reactjs>