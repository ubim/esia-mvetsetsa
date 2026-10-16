<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Android wrapper uses Capacitor with `server.url` pointing at the hosted app, because translation runs in server functions that a static bundle can't include.
- Community space lives under /community with no login, by owner choice; it caches documents in localStorage for offline reading.
- Render the shared bottom navigation in the root layout so every content page has one consistent menu and safe-area clearance.
- Keep community search and anonymous feedback payload creation in a browser-safe helper so their behavior can be tested independently.
- Store completed or stopped translation results in device history from the translation flow, not during page rendering.
