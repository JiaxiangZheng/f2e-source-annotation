### `ReactDOM.js`
 
- `findDOMNode` 用于从 React 组件获取其对应的真实 DOM 元素，ReactMount.getNodeFromInstance 会作缓存
- 使用默认系统组件进行注入 `ReactDefaultInjection`，这里可以看作 ReactDOM 真正核心的入口
- ReactClass 中提供了创建 ReactComponent 的方法 `createClass`，一个ReactComponent 所包含的方法也在这个文件中被声明（`ReactClassInterface`）

**事件系统框架图**：

```
/*
 * `ReactBrowserEventEmitter` 事件处理架构:
 *
 *  - 原生浏览器端事件最终会被代理到顶层接口， 由支持注入插件式的 ReactEventListener 负责监听。
 *  - 对原生事件，规范化并去重事件以规避某些浏览器怪异行为。
 *  - 将原生事件转发到 `EventPluginHub` 上，由它负责通知对应的 `dispatches` 然后分发事件。
 * 
 * 整体的框架图如下所示：
 *  
 * +------------+    .
 * |    DOM     |    .
 * +------------+    .
 *       |           .
 *       v           .
 * +------------+    .
 * | ReactEvent |    .
 * |  Listener  |    .
 * +------------+    .                         +-----------+
 *       |           .               +--------+|SimpleEvent|
 *       |           .               |         |Plugin     |
 * +-----|------+    .               v         +-----------+
 * |     |      |    .    +--------------+                    +------------+
 * |     +-----------.--->|EventPluginHub|                    |    Event   |
 * |            |    .    |              |     +-----------+  | Propagators|
 * | ReactEvent |    .    |              |     |TapEvent   |  |------------|
 * |  Emitter   |    .    |              |<---+|Plugin     |  |other plugin|
 * |            |    .    |              |     +-----------+  |  utilities |
 * |     +-----------.--->|              |                    +------------+
 * |     |      |    .    +--------------+
 * +-----|------+    .                ^        +-----------+
 *       |           .                |        |Enter/Leave|
 *       +           .                +-------+|Plugin     |
 * +-------------+   .                         +-----------+
 * | application |   .
 * |-------------|   .
 * |             |   .
 * |             |   .
 * +-------------+   .
 *                   .
 */
```

EventLister 中执行具体的 DOM 事件监听处理。

`renderers/shared/reconciler/ReactCompositeComponent.js` 中定义了组件的生命周期：

```
------------------ The Life-Cycle of a Composite Component ------------------

- constructor: Initialization of state. The instance is now retained.
  - componentWillMount
  - render
  - [children's constructors]
    - [children's componentWillMount and render]
    - [children's componentDidMount]
    - componentDidMount

      Update Phases:
      - componentWillReceiveProps (only called if parent updated)
      - shouldComponentUpdate
        - componentWillUpdate
          - render
          - [children's constructors or receive props phases]
        - componentDidUpdate

    - componentWillUnmount
    - [children's componentWillUnmount]
  - [children destroyed]
- (destroyed): The instance is now blank, released by React and ready for GC.
```

