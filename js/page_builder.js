
// A set to track all loading promises for the initial page load.
const initialLoadPromises = new Set();
// A list to track all functions to be called after initial load.
const postLoadCallbacks = [];

// A function to register a promise that must complete before the page is shown.
function registerInitialLoad(promise) {
    console.log("Registering initial load promise...")
    initialLoadPromises.add(promise);
    // When the promise finishes, remove it from the set.
    promise.finally(() => {
        initialLoadPromises.delete(promise);
    });
}

// A function to register a callback that will be executed after the initial load promises are settled.
function registerPostLoad(callback) {
    if (typeof callback === 'function') {
        postLoadCallbacks.push(callback);
    } else {
        console.error('registerPostLoad expects a function, but received:', callback);
    }
}

// This function will be called to wait for all initial loads and then show the page.
async function finalizePageLoad() {
    console.log("waiting for initial promises to finish...")
    // Wait for all registered promises to settle.
    await Promise.allSettled([...initialLoadPromises]);
    console.log("Calling post load callbacks...")
    // Execute all post-load callbacks.
    for (const callback of postLoadCallbacks) {
        try {
            callback();
        } catch (e) {
            console.error("Error in post-load callback:", e);
        }
    }

    // Use requestAnimationFrame to ensure the fade-in happens smoothly after all content is ready.
    document.body.style.visibility = "visible";
    
}

async function include(url, destination) {
    const response = await fetch(url);
    const text = await response.text();

    // Use a template element to parse the HTML and handle scripts correctly
    const template = document.createElement('template');
    template.innerHTML = text.trim();
    
    // Find all script tags, create new executable ones, and replace the old ones
    template.content.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });

    destination.appendChild(template.content);
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
    const loadPromise = include("/header.html", this);
    registerInitialLoad(loadPromise);
    await loadPromise;

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
    const loadPromise = include("/site_nav.html", this);
    registerInitialLoad(loadPromise);
    await loadPromise;

    // Once the nav content is loaded, check for an active-nav attribute
    // and call setNav to highlight the correct button.
    const activeNav = this.getAttribute('active-nav');
    if (activeNav) {
      setNav(activeNav);
    }
  }
});

customElements.define("side-bar-component", class extends HTMLElement {
  async connectedCallback() {
    const loadPromise = include("/side_bar.html",this);
    registerInitialLoad(loadPromise);
    await loadPromise;
  }
});

customElements.define("footer-component", class extends HTMLElement {
  async connectedCallback() {
    const loadPromise = include("/footer.html",this);
    registerInitialLoad(loadPromise);
    await loadPromise;
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