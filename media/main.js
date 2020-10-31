// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  const vscode = acquireVsCodeApi();
  const imgMap = {
    flutter:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iNDgiIGhlaWdodD0iNDgiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDE3MnYtMTcyaDE3MnYxNzJ6IiBmaWxsPSJub25lIj48L3BhdGg+PGc+PHBhdGggZD0iTTkzLjE2NjY3LDE0LjMzMzMzbC03MS42NjY2Nyw3MS42NjY2N2wyMS41LDIxLjVsOTMuMTY2NjcsLTkzLjE2NjY3eiIgZmlsbD0iIzQwYzRmZiI+PC9wYXRoPjxwYXRoIGQ9Ik0xMzYuMTY2NjcsNzguODMzMzNsLTM5LjQxNjY3LDM5LjQxNjY3bC0yMS41LC0yMS41bDE3LjkxNjY3LC0xNy45MTY2N3oiIGZpbGw9IiM0MGM0ZmYiPjwvcGF0aD48cmVjdCB4PSItMTIuNzI4OTUiIHk9IjMzLjk0MDYyIiB0cmFuc2Zvcm09InJvdGF0ZSgtNDUuMDAxKSBzY2FsZSgzLjU4MzMzLDMuNTgzMzMpIiB3aWR0aD0iOC40ODUiIGhlaWdodD0iOC40ODUiIGZpbGw9IiMwM2E5ZjQiPjwvcmVjdD48cGF0aCBkPSJNMTM2LjE2NjY3LDE1Ny42NjY2N2gtNDNsLTE3LjkxNjY3LC0xNy45MTY2N2wyMS41LC0yMS41eiIgZmlsbD0iIzAxNTc5YiI+PC9wYXRoPjxwYXRoIGQ9Ik03NS4yNSwxMzkuNzVsMzIuMjUsLTEwLjc1bC0xMC43NSwtMTAuNzV6IiBmaWxsPSIjMDg0OTk0Ij48L3BhdGg+PC9nPjwvZz48L3N2Zz4=",
    react:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K",
    vue:
      "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAyNjEuNzYgMjI2LjY5IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnIHRyYW5zZm9ybT0ibWF0cml4KDEuMzMzMyAwIDAgLTEuMzMzMyAtNzYuMzExIDMxMy4zNCkiPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE3OC4wNiAyMzUuMDEpIj48cGF0aCBkPSJtMCAwLTIyLjY2OS0zOS4yNjQtMjIuNjY5IDM5LjI2NGgtNzUuNDkxbDk4LjE2LTE3MC4wMiA5OC4xNiAxNzAuMDJ6IiBmaWxsPSIjNDFiODgzIi8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE3OC4wNiAyMzUuMDEpIj48cGF0aCBkPSJtMCAwLTIyLjY2OS0zOS4yNjQtMjIuNjY5IDM5LjI2NGgtMzYuMjI3bDU4Ljg5Ni0xMDIuMDEgNTguODk2IDEwMi4wMXoiIGZpbGw9IiMzNDQ5NWUiLz48L2c+PC9nPjwvc3ZnPgo=",
    angular: "https://imgur.com/ISJUTQr.png",
  };
  const gridNode = document.querySelector(".story-grid");
  const searchBar = document.querySelector(".searchbar");
  let cursor = 0;

  function storySearchHandler(storyElement) {
    storyElement.style.display =
      storyElement.querySelector(".name-container > div").textContent.search(new RegExp(searchBar.value, "i")) == -1 ? "none" : "block";
  }

  function storyToNode(story) {
    const container = document.createElement("div");
    container.setAttribute("class", "unit");
    container.setAttribute("data-everything", JSON.stringify(story));
    const div = document.createElement("div");
    div.setAttribute("class", "avatar has-story");
    const img = document.createElement("img");
    img.setAttribute(
      "onerror",
      "javascript:this.src='https://i.imgur.com/AcqlwUU.png'"
    );
    img.setAttribute(
      "src",
      story.creatorAvatarUrl ||
        `https://ui-avatars.com/api/?background=random&name=${encodeURI(
          story.creatorUsername
        )}`
    );
    container.appendChild(div);
    const nameContainer = document.createElement("div");
    nameContainer.setAttribute("class", "name-container");
    const name = document.createElement("div");
    name.textContent = story.creatorUsername.slice(0, 8);
    nameContainer.appendChild(name);
    container.appendChild(div);
    container.appendChild(nameContainer);
    div.appendChild(img);
    if (story.flair in imgMap) {
      const icon = document.createElement("div");
      icon.setAttribute("class", "flair");
      icon.innerHTML = `<img src="${imgMap[story.flair]}" />`;
      nameContainer.appendChild(icon);
    }
    storySearchHandler(container);
    return container;
  }

  async function loadStuff() {
    try {
      const response = await fetch(
        "https://bowl.azurewebsites.net/stories/hot" +
          (cursor ? `/${cursor}` : "")
      );
      const { stories, hasMore } = await response.json();
      if (!hasMore) {
        document.querySelector(".load-more").classList.add("hidden");
      } else {
        document.querySelector(".load-more").classList.remove("hidden");
      }
      if (stories.length) {
        cursor += 1;
      }
      stories.forEach((story) => {
        gridNode.append(storyToNode(story));
      });
    } catch (err) {
      vscode.postMessage({ type: "onError", value: err.message });
    }
  }
  loadStuff();
  document.querySelector(".load-more").addEventListener("click", async (e) => {
    e.target.disabled = true;
    await loadStuff();
    e.target.disabled = false;
  });

  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.command) {
      case "new-story":
        gridNode.prepend(storyToNode(message.story));
        break;
      case "refresh":
        gridNode.innerHTML = "";
        cursor = 0;
        loadStuff();
        break;
    }
  });

  gridNode.addEventListener("click", (e) => {
    let curr = e.target;
    for (let i = 0; i < 3; i++) {
      if (curr.dataset && curr.dataset.everything) {
        break;
      }
      curr = curr.parentElement;
    }
    vscode.postMessage({
      type: "onStoryPress",
      value: curr.dataset.everything,
    });
  });

  searchBar.addEventListener("input", (e) => {
    for (let story of gridNode.children) {
      storySearchHandler(story);
    }
  });

})();
