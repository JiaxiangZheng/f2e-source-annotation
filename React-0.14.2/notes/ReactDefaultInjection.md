```
ReactInjection
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

// 
ReactInjection
  EventEmitter: 
    ReactEventListener -> ReactBrowserEventEmitter
  EventPluginHub:
  NativeComponent: 
    ReactDOMComponent -> genericComponentClass 
    ReactDOMTextComponent -> textComponentClass
  Class
    ReactBrowserComponentMixin -> ReactClass
  DOMProperty
  Updates
    ReactReconcileTransaction -> reconcileTransaction
    ReactDefaultBatchingStrategy -> batchingStrategy
  RootIndex
    clientReactRootIndex.createReactRootIndex | ServerReactRootIndex.createReactRootIndex -> createReactRootIndex 
  Component 
    ReactComponentBrowserEnvironment -> environment
```



