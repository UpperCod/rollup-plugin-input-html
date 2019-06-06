import path from "path";
import getSources from "./getSources.js";
import setSources from "./setSources.js";
import { createFilter } from "rollup-pluginutils";
import fastGlob from "fast-glob";

let defaultOptions = {
	include: ["**/*.html"],
	exclude: [],
	createHTML: true
};

export default function inputHTML(options) {
	options = { ...defaultOptions, ...options };
	let filter = createFilter(options.include, options.exclude);
	let html = {};
	return {
		name: "rollup-plugin-input-html",
		options(opts) {
			let inputs = [].concat(opts.input);
			let [local, globs] = inputs.reduce(
				(group, input) => {
					group[/\*/.test(input) ? 1 : 0].push(input);
					return group;
				},
				[[], []]
			);
			if (globs.length) {
				return {
					...opts,
					input: fastGlob.sync(globs).concat(local)
				};
			}
		},
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
			if (!options.createHTML) return;
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
