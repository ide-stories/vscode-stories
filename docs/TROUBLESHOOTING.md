## Troubleshoting

Here's a place to document steps if things are working as expected.

- [Failed to Fetch](#Failed-to-Fetch)

## Failed to fetch

As noted on [#107](https://github.com/ide-stories/vscode-stories/issues/107) some users are having issues resolving the api server address. If you can ping the IP, but not the URL, we suggest that you add an entry to hosts files if you have sudo/admin rights.

## Tests

See if you can ping the api server.

```
ping vscode-stories-295306.uk.r.appspot.com
```

```
ping 216.58.194.52
```

### Windows

Windows path C:\Windows\System32\drivers\etc


### Linux/Mac

Linux/Mac path /etc/hosts

### Hosts Entry

```
216.58.194.52 vscode-stories-295306.uk.r.appspot.com
```