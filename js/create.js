// javascript for create.html
const form = document.forms[0];

async function createPost(event) {
  event.preventDefault();

  const formData = new FormData(form);
  formData.append("likes", 0);

  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  url = new URL("http://localhost:3000/posts");
  headers = new Headers({ "Content-Type": "application/json" });
  request = new Request(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers,
  });

  try {
    await fetch(request);
    window.location.replace("/index.html");
  } catch (error) {
    console.error(error.message);
  }
}

form.addEventListener("submit", createPost);
