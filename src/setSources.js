let closedBody = /(<\/body>)/;
export default function setSources(body, inject) {
	return closedBody.test(body)
		? body.replace(/(<\/body>)/, `${inject}$1`)
		: body + inject;
}
