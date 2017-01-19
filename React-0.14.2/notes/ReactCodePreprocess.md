如果看 React [源代码](https://github.com/facebook/react)，会发现其中模块的引用全都是使用 `react('component')` 的方式，而非相对路径引入，导致很多情况下无法在编辑器中正常地作文件间跳转。此外，最终通过 Gulp 生成的模块文件会通过一个叫 `flatten` 的插件将文件的目录结构破坏掉，使得所有文件全在同一个目录下，这会导致阅读源代码的时候不能很好的按目录结构进行功能划分。而且最终打包出来的代码也难以通过 source-map 反映出源文件。为此，在阅读源码前，有必要对 React 的打包工具作一定的预处理。

直接看项目根目录的 `gulpfile.js` 不难发现，`gulp react:modules` 本质上就是输入源代码，对源代码中所有的 `__DEV__` 条件判断作一个替换，变成 `process.env.NODE_ENV !== 'production'`；然后将源码中相应的 `require('A')` 变成 `require('./A')` 的形式（仅对引入非 `node_modules` 的情况作这样的处理），最后把所有模块的目录层级展开变成一个文件夹下的文件。这也是为何 React 可以使用 `require('react/lib/ReactDOM')` 这种方式。

所以，要做的事情很简单，只要在 `require` 路径替换阶段作一定的修正就可以了。从 `gulpfile` 中不难看出，它引入了 `fbjs-scripts/babel/rewrite-modules` 这个 babel 插件，在 babel 将源码转成 AST 以后作一个路径替换的处理，我们只需要修改路径替换的逻辑即可。

直接使用 `find ./src/ -name "*.js" | grep -v "__tests__"` 生成所有源码全路径名，通过一定的预处理就可以得到文件名到文件路径的映射，在 `fbjs-scripts/babel/rewrite-modules` 中读取这个映射并通过 `path.relative` 计算出源文件相对其引入文件的地址，作为替换的路径插入源码中。

预处理代码：

```
function computeRelativePath(filePaths) {
  var fileMapper = {};
  filePaths.forEach(function (file) {
    fileMapper[path.basename(file).replace(/\.js$/, '')] = file;
  });
  require('fs').writeFile('./module.json', JSON.stringify(fileMapper, 4, 4), function (err) {
    if (err) throw err;
    console.log('It\'s saved!');
  });
}
```

在 `mapModule` 方法中：

```javascript
if (process.env.NODE_ENV !== 'test') {
	var modulePrefix = context.state.opts._modulePrefix;
	if (modulePrefix == null) {
	  if (!modulePathMap[module]) {
	    console.warn('could not found', module, 'for', context.state.opts.sourceFileName);
	    modulePrefix = './';
	  } else {
	    var prefixAbsolute = './';
	    var source = prefixAbsolute + context.state.opts.sourceFileName;
	    var dest = prefixAbsolute + modulePathMap[module];
	    var res = path.relative(path.dirname(source), path.dirname(dest));
	    if (!/^\./.test(res)) {
	      res = './' + res;
	    }
	    if (!/\/$/.test(res)) {
	      res += '/';
	    }
	    modulePrefix = res;
	  }
	}
}
```

最后，browserify 打包生成一个带 source-map 的 bundle 文件：

```bash
browserify source/React.js --standalone React --debug -o build/react-bundle.js
```

这样就能生成一个带目录结构引用的源代码了。

接下来就是我们的源码阅读之旅。