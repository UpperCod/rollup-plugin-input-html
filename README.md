# rollup-plugin-input-html

This plugins allows the export of relative mjs modules from .HTML files, similar to the work of parceljs, but using ESM modules.

## Example:

### input: index.html

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta http-equiv="X-UA-Compatible" content="ie=edge" />
		<title>Document</title>
	</head>
	<body>
		<script type="module" src="./app-1.js"></script>
		<script type="module" src="./app-2.js"></script>
	</body>
</html>
```

### output: index.html

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta http-equiv="X-UA-Compatible" content="ie=edge" />
		<title>Document</title>
	</head>
	<body>
		<script type="module" src="./index.js"></script>
	</body>
</html>
```

script, `src="./index.js"` has the group of `src="./app-1.js"` and `src="./app-2.js"`.

```js
import inputHTML from "@atomico/rollup-plugin-input-html";

export default {
	input: "index.html", //or can use fast-glob expressions, example: *.html, ui-*.html
	output: {
		dir: "./dist",
		format: "esm",
		sourcemap: true
	},
	plugins: [inputHTML() /** ,...otherPlugins **/]
};
```

## default configuration

```js
let defaultOptions = {
	include: ["**/*.html"],
	exclude: [],
	createHTML: true // allows the creation of the html file based on the origin
};
```

#### This plugins must be included as the first element, in order to transfer the modules to the bundle.

### Multiple inputs

You can also use multiple entries supported by rollup, this generate chuck, which group the code between 1 or more html files.

## ⚠️ RULE

do not import html nested in folders outside of root or inside root, since for now this plugins will resolve the path but the rollup import generates a non-deep bundle in directory. **logical is a bundle**.

## This plugins uses the power of

[fast-glob](https://github.com/mrmlnc/fast-glob): small utility for the recovery of files based on search expressions.
[rollup-pluginutils]: allows to generate include and exclude plugins format.
