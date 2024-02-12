
async function include(url, destination){
  const response = await fetch(url);
  const text = await response.text();
  destination.innerHTML = destination.innerHTML + text;
}
customElements.define("site-head", class extends HTMLElement {
  connectedCallback() {
  include("/site_head.html",document.head);
  }
});
customElements.define("header-component", class extends HTMLElement {
  connectedCallback() {
  include("/header.html",this);
  }
});
customElements.define("site-nav", class extends HTMLElement {
  connectedCallback() {
  include("/site_nav.html",this);
  }
});
customElements.define("footer-component", class extends HTMLElement {
  connectedCallback() {
  include("/footer.html",this);
  }
});
