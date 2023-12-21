
async function include(url, destination){
	const response = await fetch(url);
	const text = await response.text();
	destination.innerHTML = text;
}
customElements.define("header-component", class extends HTMLElement {
  connectedCallback() {
	include("/header.html",this);
  }
});

customElements.define("footer-component", class extends HTMLElement {
  connectedCallback() {
	include("/footer.html",this);
  }
});