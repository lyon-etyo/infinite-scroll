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

const blogsContainer = document.querySelector(".blogs");
const searchForm = document.forms[0];
let uri = "http://localhost:3000/posts?_sort=title&_page=1&_limit=3";
let next;
let term;

async function renderPosts(uri, term = null) {
  uri = term ? `${uri}&q=${term}` : uri;
  console.log(next);
  if (!uri) return;
  blogsContainer.nextElementSibling.classList.toggle("is-loading", true);
  const res = await fetch(uri);
  const posts = await res.json();
  const span = document.createElement("span");
  const fragment = document.createDocumentFragment();
  posts.forEach(post => {
    const blogPost = document.createElement("blog-post");
    const title = span.cloneNode();
    const likes = span.cloneNode();
    const body = span.cloneNode();
    title.textContent = post.title;
    likes.textContent = post.likes;
    body.textContent = post.body.slice(0, 150) + "...";
    title.slot = "title";
    likes.slot = "likes";
    body.slot = "body";
    blogPost.dataset.id = post.id;
    blogPost.appendChild(title);
    blogPost.appendChild(likes);
    blogPost.appendChild(body);
    fragment.appendChild(blogPost);
  });
  blogsContainer.appendChild(fragment);
  if (res.headers.get("link").indexOf("next") > -1) {
    const linksArray = res.headers.get("link").split(",");
    const nextLinkArray = linksArray[linksArray.length - 2].split(";");
    const regex = /[<>]/g;
    next = nextLinkArray[0].replace(regex, "");
  } else {
    next = false;
    blogsContainer.removeEventListener("scroll", handleScroll);
  }
  blogsContainer.nextElementSibling.classList.toggle("is-loading", false);
}

function handleScroll() {
  let triggerHeight = this.scrollTop + this.offsetHeight;
  if (triggerHeight >= this.scrollHeight) {
    renderPosts(next);
    console.log("fetching");
  }
}

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();
  if (this.term.value.trim() === term) return;
  blogsContainer.innerHTML = "";
  blogsContainer.addEventListener("scroll", handleScroll);
  renderPosts(uri, this.term.value.trim());
  term = this.term.value.trim();
});
window.addEventListener("DOMContentLoaded", _ => renderPosts(uri));

blogsContainer.addEventListener("scroll", handleScroll);
