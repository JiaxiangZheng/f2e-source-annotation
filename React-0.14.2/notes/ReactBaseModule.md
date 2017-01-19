## 基础代码

### 基础代码之事务（Transaction）

Transaction 是一个 Mixin，或者说，是一个抽象类，其源码位于：`shared/utils/Transaction.js`，React 底层代码中大量地用到了这个概念，因此有必要先分析一下它。这里翻译成事务，但不要与数据库中的事务概念混淆。

那么，事务是为了解决一类什么样的问题而出现的呢？在我们处理问题的时候，很多情况下都有预处理及后处理这两个过程，类似于构造及析构函数这两个过程，事务可以看作是把这些抽象出来以后封装的一个结果。通过事务的 perform 方法而非直接调用处理方法，我们可以自定义其前置及后置处理，而且这些处理将被自动调用。

一个简单的自定义事务使用如下：

```javascript
const Transaction = require('./Transaction'); // 引入 ReactTransaction
function MyTransaction() {}
Object.assign(MyTransaction.prototype, Transaction.Mixin, {
  getTransactionWrapper() {
    return [{
      initialize: () => {},
      close: () => {}
    }]
  }
});

const myTransaction = new MyTransaction();
myTransaction.perform(() => {
  // do something
});
```

可以看到，要自定义一个事务类，我们需要向这个类注入事务抽象类，考虑到我们的前置后置处理往往不止一个，React 的事务默认会通过 getTransactionWrapper 取出所有前置后置函数。而前置后置函数统一用 `initialize` 和 `close` 方法来定义。

此时再回头看源码中的这个图就会显得清晰多了，多个 wrapper 对应于我们 getTransactionWrapper 取出的数组。

```
                       wrappers (injected at creation time)
                                      +        +
                                      |        |
                    +-----------------|--------|--------------+
                    |                 v        |              |
                    |      +---------------+   |              |
                    |   +--|    wrapper1   |---|----+         |
                    |   |  +---------------+   v    |         |
                    |   |          +-------------+  |         |
                    |   |     +----|   wrapper2  |--------+   |
                    |   |     |    +-------------+  |     |   |
                    |   |     |                     |     |   |
                    |   v     v                     v     v   | wrapper
                    | +---+ +---+   +---------+   +---+ +---+ | invariants
 perform(anyMethod) | |   | |   |   |         |   |   | |   | | maintained
 +----------------->|-|---|-|---|-->|anyMethod|---|---|-|---|-|-------->
                    | |   | |   |   |         |   |   | |   | |
                    | |   | |   |   |         |   |   | |   | |
                    | |   | |   |   |         |   |   | |   | |
                    | +---+ +---+   +---------+   +---+ +---+ |
                    |  initialize                    close    |
                    +-----------------------------------------+
```

而关于源码中对这一块的实现具体的内容，可以参考在代码（`shared/utils/Transaction.js`）中做的注释。

**参考**：

- <http://reactkungfu.com/2015/12/dive-into-react-codebase-transactions/>

### 基础代码之对象池管理（PooledClass）

React 中池化类（PooledClass）技术的主要目的是什么呢？为避免频繁的垃圾回收，React 内部实现了一个池注入技术，所有需要接入它的类都需要提供 `destructor` 方法清空原数据，方便下次的回收利用。

怎么用呢？可以参考 React 源码中的回调队列相关的代码，其中就使用到了池化技术。使用 `PooledClass.addPoolingTo` 将相应的方法注入到我们自定义的类中。

```javascript
function MyQueue {
}
PooledClass.addPoolingTo(MyQueue);
```

使用中，我们不再通过 `new MyQueue` 构造对象，而是通过 `MyQueue.getPooled()` 将内存管理统一放在对象池中管理，以避免频繁的 GC 开销。而真正调用 `getPolled` 方法时，我们实际上是通过 PooledClass 模块中的 `xxArgumentPooler` 统一管理对象的生存周期（下面为 oneArgumentPooler 示例），当不需要该对象的时候，我们需要手工调用 `instance.release()` 方法，而这本质上调用的是一个统一的内存回收方法（本质上是放回管理池中），见下面的代码。从这里，看到，我们自定义的类需要实现一个 destructor 方法。

```
var oneArgumentPooler = function (copyFieldsFrom) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, copyFieldsFrom);
    return instance;
  } else {
    return new Klass(copyFieldsFrom);
  }
};
var standardReleaser = function (instance) {
  var Klass = this;
  !(instance instanceof Klass) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Trying to release an instance into a pool of a different type.') : invariant(false) : undefined;
  instance.destructor();
  if (Klass.instancePool.length < Klass.poolSize) {
    Klass.instancePool.push(instance);
  }
};
```

### 基础代码之回调队列（CallbackQueue）

这个很简单，就是管理了一系列回调函数，提供了一个触发所有回调的接口，注意，触发所有回调的同时，队列会被清空，即可以认为这是一个一次性的回调队列。

TODO

### virtual-DOM

不像众多 MVVM 框架使用脏检查的方法那样，React 底层使用的是虚拟 DOM 算法进行高效的 DOM 更新。如果说 React 是一辆汽车，虚拟 DOM 算法就是驱动这辆汽车快速行驶的引擎。没有高效的 virtual-dom 算法，很难想象 React 的性能会有多好。

事实上，virtual-dom 可以和 React 本身完全解耦，在开源社区中，确实有人把 virtual-dom 算法单独实现了，参考[这个链接](https://github.com/Matt-Esch/virtual-dom)。这里只是简单地说明这个算法是如何运作的，而对于 React 中 virtual-dom 的实现，考虑到了解了本质以后就是将 virtual-dom 粘合起来，因此我们暂时不作过多分析。

先把 virtual-dom 问题简化一下，就是对两个树状数据结构进行 diff 并计算其最小 diff 结果。那么，两棵树的最小 diff 操作，标准的时间复杂度有多高呢？大概是 `O(N^3)` 的时间复杂度，显然是不可取的。而 virtual-dom 采用一种近似的方式以 `O(n)` 复杂度解决了这个问题的绝大部分情况。如果从数学期望上来看，基本上复杂度可以认为是线性复杂度。

TODO：

参考：<http://calendar.perfplanet.com/2013/diff/>
