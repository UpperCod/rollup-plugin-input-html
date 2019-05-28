'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = _interopDefault(require('path'));
var rollupPluginutils = require('rollup-pluginutils');

let fileLocal = /^\./;
function getSources(input) {
	let sources = [];
	/*
	/(<(script)([^\>]+)>\s*<\/script>|<(link)([^\>]+)(?:\/){0,1}>)/g
	*/
	let output = input.replace(/(<script[^\>]+>\s*<\/script>)/g, (all, tag) => {
		let tagName = tag.match(/<(\w+)\s+/)[1];
		let props = { tagName };
		if (tagName) {
			tag.replace(
				/ +([\w\-]+)=(?:"([^\"]+)"|'([^\']+)')/g,
				(all, index, value) => {
					props[index] = value;
				}
			);
			if (props.type == "module" && fileLocal.test(props.src || "")) {
				sources.push(props);
				return "";
			}
		}
		return all;
	});

	return {
		output,
		input,
		sources
	};
}

function setSources(body, inject) {
	return body.replace(/(<\/body>)/, `${inject}$1`);
}

let defaultOptions = {
	include: ["**/*.html"],
	exclude: []
};

function inputHTML(options) {
	options = { ...defaultOptions, ...options };
	let filter = rollupPluginutils.createFilter(options.include, options.exclude);
	let html = {};
	return {
		name: "rollup-plugin-input-html",
		transform(code, id) {
			if (!filter(id)) return;

			html[id] = html[id] || {};

			if (html[id].input !== code) {
				let data = getSources(code);
				data.code = data.sources
					.filter(({ tagName }) => tagName == "script")
					.map(script => `export * from ${JSON.stringify(script.src)};`)
					.join(";\n");
				html[id] = data;
			}
			return {
				code: html[id].code
			};
		},
		generateBundle(opts, bundle) {
			let dir = opts.dir || path.dirname(opts.file);
			for (let key in html) {
				let data = html[key];
				if (!data.create) {
					let filePath = path.relative(dir, key);
					let fileName = path.join(dir, filePath);
					let fileJS = "./" + fileName.replace(".html", ".js");

					bundle[fileName] = {
						fileName,
						isAsset: true,
						source: setSources(
							data.output,
							`<script type="module" src="${fileJS}"></script>`
						)
					};

					data.create = true;
				}
			}
		}
	};
}

module.exports = inputHTML;
