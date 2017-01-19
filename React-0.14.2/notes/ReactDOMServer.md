React 服务端渲染模块 ReactServerRendering 提供了两个对外的方法：renderToString 和 renderToStaticMarkup，二者都是以 ReactElement 作为输入，以字符串作为输出，那么有何区别呢？

区别在于，前者（renderToString）会把 `data-reactid` 和 `data-react-checksum` 都打到最终返回的 DOM 字符串中，而后者则不包含这些内容。

以 renderToString 为例，其代码如下：

```javascript
var transaction;
try {
  // NOTE(xuanfeng): 改写默认的注入更新策略，在服务端，batchingStrategy 实际上啥也不干。isBatchingUpdates: false,  batchedUpdates: () => {}
  ReactUpdates.injection.injectBatchingStrategy(ReactServerBatchingStrategy);

  var id = ReactInstanceHandles.createReactRootID();
  // NOTE(xuanfeng): 与 renderToStaticMarkup 唯一的区别在于传入的参数，本质上是向 ReactServerRenderingTransaction 传入参数
  transaction = ReactServerRenderingTransaction.getPooled(false);

  return ReactServerRenderingTransaction.perform(function () {
    var componentInstance = instantiateReactComponent(element, null);
    var markup = componentInstance.mountComponent(id, transaction, emptyObject);
    return ReactMarkupChecksum.addChecksumToMarkup(markup);
  }, null);
} finally {
  ReactServerRenderingTransaction.release(transaction);
  // Revert to the DOM batching strategy since these two renderers
  // currently share these stateful modules.
  ReactUpdates.injection.injectBatchingStrategy(ReactDefaultBatchingStrategy);
}
```

大体上的流程为，先注入基本的服务端批量更新策略，而后通过输入的 ReactElement 生成对应的组件（ReactComponent）实例，这样我们就可以通过这个实例的 mountComponent 方法得到对应的 markup 了。注意，这时并没有加上校验 HASH 值，而是通过 ReactMarkupChecksum.addChecksumToMarkup 将 HASH 值加入到 markup 并返回。而 `data-reactid` 是通过向 `ReactServerRenderingTransaction.getPooled` 传入的参数为 false 而生成的。

除开 ReactServerRenderingTransaction 对实例化及生成 HTML 字符串过程进行了一层执行前后的拦截注入，不难看到代码核心在于 ReactUpdates 的注入策略、instantiateReactComponent 对于 ReactComponent 的实例化，而这些，也是属于多端共用的代码。其内部的区别，由 injection 来进行区分。

