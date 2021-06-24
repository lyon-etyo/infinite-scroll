// javascript for index.html
const template = document.createElement("template");
template.innerHTML = /* html */ `
  <style>
    .post {
      padding: 16px;
      background: white;
      border-radius: 10px;
      margin: 20px 0;
    }
    .post h2 {
      margin: 0;
      text-transform: capitalize;
    }
    .post p {
      margin-top: 0;
    }
    .post a {
      color: #36cca2;
    }
  </style>
  <div class="post">
    <h2><slot name="title">Title of Blog</slot></h2>
    <p><small><slot name="likes">Number of Likes</slot> likes</small></p>
    <p><slot name="body">Lorem ipsum dolor sit amet consectetur adipisicing elit.</slot></p>
    <a>Read More...</a>
  </div>
`;

customElements.define(
  "blog-post",
  class Post extends HTMLElement {
    static get observedAttributes() {
      return ["id"];
    }

    constructor() {
      super();
      const templateContent = template.content;
      this.attachShadow({ mode: "open" }).appendChild(templateContent.cloneNode(true));
    }

    setId(value) {
      const link = this.shadowRoot.querySelector("a");
      link.setAttribute("href", `/details.html?id=${value}`);
    }

    connectedCallback() {
      this.setId(this.dataset.id);
    }

    attributeChangedCallback(name, oldValue, newValue) {
      this.setId(this.dataset.id);
    }
  }
);

window.addEventListener("DOMContentLoaded", _ => {
  // Access DOM elements
  const blogsContainer = document.querySelector(".blogs");
  const spinner = document.querySelector(".spinner-1");
  const searchForm = document.forms[0];
  let next = "";
  let term = "";

  // First time data load render
  renderPosts();

  // create Intersection Observer options
  const options = {
    root: null,
    rootMargins: "0px",
    threshold: 0,
  };
  // observe the element if intersect and next link is exist then fetch data and render to the DOM
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && next) renderPosts(next);
  }, options);
  observer.observe(spinner.parentElement);

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (this.term.value.trim() === term) return;
    term = this.term.value.trim();
    next = `http://localhost:3000/posts?_sort=title&_page=1&_limit=3&q=${term}`;
    blogsContainer.innerHTML = "";
    observer.observe(spinner.parentElement);
  });

  async function renderPosts(uri = "http://localhost:3000/posts?_sort=title&_page=1&_limit=3") {
    // add class "is-loading"
    spinner.classList.toggle("is-loading", true);
    // fetch data
    const res = await fetch(uri);
    const posts = await res.json();
    // get next link from headers
    next = getNextLink(res.headers);
    // unobserver infinite scroll if next link not exist
    if (!next) observer.unobserve(spinner.parentElement);
    // Rendering to the DOM
    render(posts, blogsContainer);
    // remove class "is-loading"
    spinner.classList.toggle("is-loading", false);
  }

  function render(data, containerElement) {
    const span = document.createElement("span");
    const fragment = document.createDocumentFragment();
    data.forEach(post => {
      const blogPost = document.createElement("blog-post");
      const title = span.cloneNode();
      const likes = span.cloneNode();
      const body = span.cloneNode();
      title.textContent = post.title;
      likes.textContent = post.likes;
      body.textContent = post.body.slice(0, 150);
      title.slot = "title";
      likes.slot = "likes";
      body.slot = "body";
      blogPost.dataset.id = post.id;
      blogPost.appendChild(title);
      blogPost.appendChild(likes);
      blogPost.appendChild(body);
      fragment.appendChild(blogPost);
    });
    containerElement.appendChild(fragment);
  }

  function getNextLink(headers) {
    if (headers.get("link").indexOf("next") < 0) return "";
    const linksArray = headers.get("link").split(",");
    const nextLinkArray = linksArray[linksArray.length - 2].split(";");
    return nextLinkArray[0].replace(new RegExp(/[<>]/g), "");
  }
});
