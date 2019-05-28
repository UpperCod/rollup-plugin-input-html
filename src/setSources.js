export default function setSources(body, inject) {
	return body.replace(/(<\/body>)/, `${inject}$1`);
}
