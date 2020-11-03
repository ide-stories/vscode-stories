// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  const vscode = acquireVsCodeApi();

  const top = document.querySelector(".data-container");
  const commentsSection = document.querySelector('.comments');

  const username = top.dataset.username;
  const id = top.dataset.id;

  fetch(`https://bowl.azurewebsites.net/story/likes/${id}`)
    .then((x) => x.json())
    .then((x) => {
      if (x.likes) {
        document.querySelector(".likes").textContent = x.likes;
      }
    });

  document.querySelector(".empty").addEventListener("click", async (e) => {
    document.querySelector(".full").classList.remove("hidden");
    document.querySelector(".empty").classList.add("hidden");
    const likes = document.querySelector(".likes");
    const nLikes = parseInt(likes.textContent.replace(/\.|,/g, ""));
    if (!Number.isNaN(nLikes)) {
      likes.textContent = (nLikes + 1).toLocaleString();
    }
    if (e.target.dataset && e.target.dataset.id) {
      try {
        const response = await fetch(
          `https://bowl.azurewebsites.net/like-story/${e.target.dataset.id}/${username}`,
          {
            method: "POST",
          }
        );
        if (response.status !== 200) {
          throw new Error(await response.text());
        }
      } catch (err) {
        vscode.postMessage({ type: "onError", value: err.message });
      }
    }
  });

  document.querySelector('.comment-textarea').addEventListener('keydown', (e) => {
    let target = e.target;
    let comment = '';
    if (e.which === 13) {
      comment = e.target.value;
    }
    if (comment !== '') {
      // I couldn't figure out how to get the user name
      let by = '';
      let element = document.createElement('div');
      element.classList.add('comment');
      element.innerHTML = `<b>${by}</b>: ${comment}`;
      commentsSection.prepend(element);
      target.value = "";
      target.blur();
    }
  });

})();
