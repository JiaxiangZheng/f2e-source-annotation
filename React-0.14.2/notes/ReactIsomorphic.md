React不仅仅是前端应用框架，它还支持服务端渲染，即所谓[同构渲染](http://isomorphic.net/)。`ReactIsomorphic` 模块即为同构渲染相关代码的入口。它也是我们平时引用 `const React = require('react')` 时所对应的模块。

`ReactIsomorphic.js` 这个文件的主要目的在于对外暴露子模块内部的接口，由于这一块牵扯到 React 庞大的代码分支，我们先分析这个文件的整体结构，然后再对其中错综复杂的子结构进行分析。涉及到的子模块主要包括：

- `ReactElement` 和 `ReactDOMFactories`
- `ReactPropTypes`
- `ReactComponent`
- `ReactChildren`
- `ReactClass`

## ReactElement & ReactDOMFactories

先从最简单的前两个模块开始吧！

ReactElement 模块主要用于创建 React 元素，其内部有一个工厂函数 ReactElement，而其所有的对外接口（createElement、cloneElement、createFactory 等等）都是对工厂函数的接口封装。每个 ReactElement 本质上就是下面结构的对象：

```javascript
var element = {
  // This tag allow us to uniquely identify this as a React Element
  $$typeof: REACT_ELEMENT_TYPE,

  // Built-in properties that belong on the element
  type: type,
  key: key,
  ref: ref,
  props: props,

  // Record the component responsible for creating this element.
  _owner: owner
};
```
基本上这个模块就这么多东西，另外值得注意的一个地方就是 `REACT_ELEMENT_TYPE` 这个内部变量，这是用于判断是否是 ReactElement 的标志。

而 ReactDOMFactories 则是将所有正常 DOM 中包含的那些标签所对应的 createElement 方法统一到了 ReactDOMFactories 中，并对外以 `React.DOM` 接口暴露出去。这样在外面，我们直接调用 `React.DOM.div(props, children)` 就能生成一个 div 类型的 ReactElement 了。

> TODO：在 React 中我们知道除了正常的 DOM 外，React 定义了 ReactElement、ReactComponent、ReactClass 等诸多概念，这些有何区别呢？
> TODO：ReactCurrentOwner 是什么鬼？

## ReactPropTypes

另外一个比较简单的模块是 ReactPropTypes。虽然它并不在生产环境中使用，只用于开发环境下的类型校验，但其中的代码设计很值得学习，所以这里对它进行分析。

ReactPropTypes 怎么使用的呢？当创建下面的代码以后，如果我们给 props.arrProp 传入了一个字符串值，则 React 提示报错。

```javascript
class MyComponent extends React.Component {
  static propTypes = {
    arrProp: React.PropTypes.array.isRequired,
    strProp: React.PropTypes.string
  };
  static defaultProps = {
    arrProp: [],
    strProp: ''
  }
}
```

说白了，`React.PropTypes.XXX` 返回的是一个验证函数（`React.PropTypes.XXX.isRequired` 也是函数），所以对每个 `XXX`，我们只需要给出对应的验证规则，剩下的就是一个统一的模板方法，将这个验证规则传入其中。所以说，虽然这个模块代码有三四百行，但核心的代码（即这个模板方法）其实很少，而这个模板方法，最核心的就是 createChainableTypeChecker 这个方法。

```javascript
// 模板方法大概流程如下
function templateMethod(validator) {
  return createChainableTypeChecker(validator);
}
// createChainableTypeChecker
function createChainableTypeChecker(validate) {
  function checkType(isRequired, props, propName, componentName, location, propFullName) {
    componentName = componentName || ANONYMOUS;
    propFullName = propFullName || propName;
    // NOTE(xuanfeng): 如果属性为 null，则直接判断是否为必填项，否则对其值类型进行校验
    if (props[propName] == null) {
      var locationName = ReactPropTypeLocationNames[location];
      if (isRequired) {
        return new Error('Required ' + locationName + ' `' + propFullName + '` was not specified in ' + ('`' + componentName + '`.'));
      }
      return null;
    } else {
      return validate(props, propName, componentName, location, propFullName);
    }
  }

  var chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);

  return chainedCheckType;
}
```

从上面的 createChainableTypeChecker 方法来看，里面通过使用 `bind` 方法，使得 `React.PropTypes.array` 和 `React.PropTypes.array.isRequired` 本质上其实都是一样的，只不过传入 checkType 的参数值不太一样而已。

当然，对于 `React.PropTypes.arrayOf` 这种，其实只要将验证方法里改为判断元素是否在给定集合范围内。

## ReactComponent

ReactComponent 是我们所定义的那些所有组件的抽象基类，我们可以通过 `class XXX extends ReactComponent` 的方法继承出一个自定义的组件。我们平时所使用的 `setState` 就是源于此，考虑到我们后面会有专门的一篇文章去分析 React 组件生命周期，这里不对 ReactComponent 的各方法一一介绍。

多提一句，setState 背后复杂的逻辑，其实应该要通过 ReactComponent 参数中的 updater 来进行分析。而我们直接看这个模块的代码时，会发现它用的默认 updater 是 ReactNoopUpdateQueue，但这个更新队列其实是个抽象的队列（可以参考前面的文章）。事实上，因为 React 区分服务端渲染和客户端渲染，所以其实对这两种类型传入的 updater 是不一样的。React 整个代码中都重度依赖于依赖注入（不同于 Angular 的依赖注入），这样不同环境下（如 server side ）可以用不同的组件注入，updater 的注入可以参考 ReactCompositeComponent 文件的 mountComponent 方法。

而且，setState 本身的代码，就三行：

```javascript
this.updater.enqueueSetState(this, partialState);
if (callback) {
  this.updater.enqueueCallback(this, callback);
}
```

## ReactChildren

两个重要的概念：ForEachBookKeeping 和 MapBookKeeping。

TODO: 先不做分析，更多的是提供了一系列的工具函数。

## ReactClass

`React.createClass` 这个最常用的方法就是在这里，可以参考代码里的注释，有更详细的分析。

> TODO:
>  
> 1. `React.createClass` vs `new React.Component` 本质区别，如何相关起来？

* * *

到这里，isomorphic 文件夹下的代码我们基本已经过完了一遍，剩下的 React 核心工作流程全在 renderers 文件夹中。