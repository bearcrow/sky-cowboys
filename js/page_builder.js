
async function include(url, destination){
  const response = await fetch(url);
  const text = await response.text();
  destination.innerHTML = destination.innerHTML + text;
}
function setNav(heading){
  // Highlight the current page's navigation button.
  
  const navButton = document.getElementById(heading);
  
  if (navButton) {
    navButton.classList.add('highlight');
  }
}

customElements.define("site-head", class extends HTMLElement {
  connectedCallback() {
  include("/site_head.html",document.head);
  }
});
customElements.define("header-component", class extends HTMLElement {
  async connectedCallback() {
    await include("/header.html", this);

    // Pass the active-nav attribute down to the site-nav component
    const siteNavElement = this.querySelector('site-nav');
    const activeNav = this.getAttribute('active-nav');
    
    if (siteNavElement && activeNav) {
      siteNavElement.setAttribute('active-nav', activeNav);
    }
  }
});

customElements.define("site-nav", class extends HTMLElement {
  async connectedCallback() {
    await include("/site_nav.html", this);

    // Once the nav content is loaded, check for an active-nav attribute
    // and call setNav to highlight the correct button.
    const activeNav = this.getAttribute('active-nav');
    
    if (activeNav) {
      setNav(activeNav);
    }
  }
});

customElements.define("side-bar-component", class extends HTMLElement {
  connectedCallback() {
  include("/side_bar.html",this);
  }
});

customElements.define("footer-component", class extends HTMLElement {
  connectedCallback() {
  include("/footer.html",this);
  }
});

// Create a class for the element
class PostsComponent extends HTMLElement {
  static observedAttributes = ["max-posts"];

  constructor() {
    // Always call super first in constructor
    super();
    /*
    If you want isolated content from the rest of the document
    const shadow = this.attachShadow({ mode: "open" });
    const div = document.createElement("div");
    const style = document.createElement("style");
    shadow.appendChild(style);
    shadow.appendChild(div);
    */
  }

  connectedCallback() {
    
    const myPromise = new Promise(async (resolve,reject) => {
      try {
        const response = await fetch("posts.json");
        const data = await response.json();
        resolve(data);
      } catch (error) {
        console.error("Error fetching or parsing chapter manifest:", error);
        reject(error); // Re-throw the error for handling in the calling code
      }
    });
    myPromise.then(
      (data) => {
        // var posts_div = this.shadowRoot.querySelector("div");
        var posts_div = document.createElement("div");
        for(var i in data.posts){
          var post = data.posts[i];
          
          var content_div = document.createElement("div");
          var date_span = document.createElement("span");
          var title_h = document.createElement("h1");
          var post_div = document.createElement("div");
          post_div.classList.add("post");
          date_span.innerHTML = post.date;
          title_h.innerHTML = post.title;
          content_div.innerHTML = post.content;
          post_div.appendChild(title_h);
          post_div.appendChild(date_span);
          post_div.appendChild(content_div);
          posts_div.appendChild(post_div);
        }
        this.appendChild(posts_div);
      },
      function(error){
        
      }
    );
  }

  disconnectedCallback() {
    
  }

  adoptedCallback() {
    
  }

  attributeChangedCallback(name, oldValue, newValue) {
    
  }
}

customElements.define("posts-component", PostsComponent);