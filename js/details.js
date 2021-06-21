// javascript for details.html
const id = new URLSearchParams(window.location.search).get("id");
const detailsContainer = document.querySelector(".details");
const deleteBtn = detailsContainer.nextElementSibling;

deleteBtn.addEventListener("click", async e => {
  const uri = "http://localhost:3000/posts/" + id;
  await fetch(uri, { method: "DELETE" });
  window.location.replace("/index.html");
});
window.addEventListener("DOMContentLoaded", _ => renderDetails());

async function renderDetails() {
  const uri = "http://localhost:3000/posts/" + id;
  const res = await fetch(uri);
  const post = await res.json();
  const postElement = `
    <h1>${post.title}</h1>
    <p><small>${post.likes} likes</small></p>
    <p>${post.body}</p>
  `;
  detailsContainer.innerHTML = postElement;
}
