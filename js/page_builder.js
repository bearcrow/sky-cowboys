
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
    console.log("fetching posts...");
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
          console.log(post);
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
        console.log("Could not load posts.");
      }
    );
  }

  disconnectedCallback() {
    console.log("Custom element removed from page.");
  }

  adoptedCallback() {
    console.log("Custom element moved to new page.");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Attribute ${name} has changed.`);
  }
}

customElements.define("posts-component", PostsComponent);