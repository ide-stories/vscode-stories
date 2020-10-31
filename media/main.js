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
    python:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iNDgiIGhlaWdodD0iNDgiCnZpZXdCb3g9IjAgMCAyMjYgMjI2IgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDIyNnYtMjI2aDIyNnYyMjZ6IiBmaWxsPSJub25lIj48L3BhdGg+PGc+PHBhdGggZD0iTTExMy4yMjEyOSwyMy41NDE2N2MtNy4zMjE0NiwwLjAyMzU0IC0xMi4zOTcwNCwwLjY2ODU4IC0xOC41MzIsMS43Mjc5NmMtMTguMTE3NjcsMy4xNTQ1OCAtMjEuNDE4MjEsOS43NzkyMSAtMjEuNDE4MjEsMjEuOTg3OTJ2MTguNjU5MTJoNDIuMzc1djkuNDE2NjdoLTQzLjk4NTI1aC0yMC40ODEyNWMtMTIuNDExMTcsMCAtMjMuMjczMjksNS44NDc3NSAtMjYuNzE1MDgsMTkuODY0NDZjLTMuODg5MDgsMTYuMDg4MzggLTQuMDYzMjksMjYuMTY0MjEgMCw0Mi45NjM1NGMzLjA4Mzk2LDEyLjUyODg4IDkuODc4MDgsMjEuOTIyIDIyLjI5Mzk2LDIxLjkyMmgxNy4xMDA2N3YtMjQuMDMxMzNjMCwtMTMuOTY0OTIgMTIuNjQ2NTgsLTI3Ljc2MDMzIDI3LjEzODgzLC0yNy43NjAzM2gzNC4wNjk1YzExLjg3OTEyLDAgMjMuNTQxNjcsLTguNzY2OTIgMjMuNTQxNjcsLTIwLjYwODM3di00MC40MjU3NWMwLC0xMS40ODM2MyAtOC4yODE5NiwtMjAuMDcxNjIgLTE5Ljg1OTc1LC0yMS45OTczM2MwLjI4NzIxLC0wLjAyODI1IC04LjI2NzgzLC0xLjc0Njc5IC0xNS41MjgwOCwtMS43MTg1NHpNODkuNzU0OTYsNDIuMzc1YzMuODY1NTQsMCA3LjA2MjUsMy4xODc1NCA3LjA2MjUsNy4wNzE5MmMwLDMuOTIyMDQgLTMuMTk2OTYsNy4wNTMwOCAtNy4wNjI1LDcuMDUzMDhjLTMuOTQwODcsMCAtNy4wNjI1LC0zLjEyNjMzIC03LjA2MjUsLTcuMDUzMDhjMCwtMy44NzAyNSAzLjEyMTYzLC03LjA3MTkyIDcuMDYyNSwtNy4wNzE5MnoiIGZpbGw9IiMwMjc3YmQiPjwvcGF0aD48cGF0aCBkPSJNMTA4LjY1ODkyLDIwMi40NTgzM2M3LjMyMTQ2LC0wLjAyMzU0IDEyLjM5NzA0LC0wLjY2ODU4IDE4LjUzMiwtMS43Mjc5NmMxOC4xMTc2NywtMy4xNTQ1OCAyMS40MTgyMSwtOS43NzkyMSAyMS40MTgyMSwtMjEuOTg3OTJ2LTE4LjY1OTEzaC00Mi4zNzV2LTkuNDE2NjdoNDMuOTg5OTZoMjAuNDgxMjVjMTIuNDExMTcsMCAyMy4yNzMyOSwtNS44NDc3NSAyNi43MTUwOCwtMTkuODY0NDZjMy44ODkwOCwtMTYuMDg4MzcgNC4wNjMyOSwtMjYuMTY0MjEgMCwtNDIuOTYzNTRjLTMuMDg4NjcsLTEyLjUyODg3IC05Ljg4Mjc5LC0yMS45MjIgLTIyLjI5ODY3LC0yMS45MjJoLTE3LjEwMDY3djI0LjAzMTMzYzAsMTMuOTY0OTIgLTEyLjY0NjU4LDI3Ljc2MDMzIC0yNy4xMzg4MywyNy43NjAzM2gtMzQuMDY5NWMtMTEuODc5MTMsMCAtMjMuNTQxNjcsOC43NjY5MiAtMjMuNTQxNjcsMjAuNjA4Mzd2NDAuNDI1NzVjMCwxMS40ODM2MiA4LjI4MTk2LDIwLjA3MTYyIDE5Ljg1OTc1LDIxLjk5NzMzYy0wLjI4NzIxLDAuMDI4MjUgOC4yNjc4MywxLjc0Njc5IDE1LjUyODA4LDEuNzE4NTR6TTEzMi4xMjk5NiwxODMuNjI1Yy0zLjg2NTU0LDAgLTcuMDYyNSwtMy4xODc1NCAtNy4wNjI1LC03LjA3MTkyYzAsLTMuOTIyMDQgMy4xOTY5NiwtNy4wNTMwOCA3LjA2MjUsLTcuMDUzMDhjMy45NDA4OCwwIDcuMDYyNSwzLjEyNjMzIDcuMDYyNSw3LjA1MzA4YzAsMy44NzAyNSAtMy4xMjYzMyw3LjA3MTkyIC03LjA2MjUsNy4wNzE5MnoiIGZpbGw9IiNmZmMxMDciPjwvcGF0aD48L2c+PC9nPjwvc3ZnPg==",
    dart:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iNDgiIGhlaWdodD0iNDgiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDE3MnYtMTcyaDE3MnYxNzJ6IiBmaWxsPSJub25lIj48L3BhdGg+PGc+PHBhdGggZD0iTTM1LjgzMzMzLDQzbDEwLjc1LDg5LjU4MzMzbC0yOC43MzQ3NSwtMjguNzM0NzVjLTQuMjYwNTgsLTQuMjYwNTggLTUuNDAzNjcsLTEwLjczNTY3IC0yLjg1MjMzLC0xNi4xOTY2N3oiIGZpbGw9IiMxNTY1YzAiPjwvcGF0aD48cGF0aCBkPSJNOTcuODkzMDgsMjIuNjQzMDhjLTMuMDI3OTIsLTMuMDI3OTIgLTcuMTMwODMsLTQuNzI2NDIgLTExLjQwOTMzLC00LjcyNjQyYy0yLjY2OTU4LDAgLTUuMjk5NzUsMC42NjI5MiAtNy42NTA0MiwxLjkyNzgzbC00MywyMy4xNTU1djcyLjg5NTc1YzAsMy44MDE5MiAxLjUwODU4LDcuNDQ2MTcgNC4xOTk2NywxMC4xMzM2N2w2LjU1MDMzLDYuNTUzOTJoNzguODMzMzN2LTE3LjkxNjY3bDI1LjA4MzMzLC0zOS40MTY2N3oiIGZpbGw9IiM0MmE1ZjUiPjwvcGF0aD48cGF0aCBkPSJNMzUuODMzMzMsNDNoNzYuNDc5MDhjMy44MDE5MiwwIDcuNDQ2MTcsMS41MDg1OCAxMC4xMzM2Nyw0LjE5OTY3bDI4LjA1MzkyLDI4LjA1MDMzdjU3LjMzMzMzaC0yNS4wODMzM3oiIGZpbGw9IiMxNTY1YzAiPjwvcGF0aD48cGF0aCBkPSJNMTI1LjQxNjY3LDEzMi41ODMzM2gtNzguODMzMzNsMjEuNSwyMS41aDU3LjMzMzMzeiIgZmlsbD0iIzg1Y2JmOCI+PC9wYXRoPjwvZz48L2c+PC9zdmc+",
  };

  const gridNode = document.querySelector(".story-grid");
  let cursor = 0;

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
})();
