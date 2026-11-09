# Add release awareness

## Why

A locally implemented integration does not become available in another installation until that installation receives a Talia build or source update. The open-source app has no update feed or visible notice that a newer Talia version exists.

## What changes

- Compare the app's version with the latest published release of this Talia fork.
- Check after first paint and on demand from the sidebar version button.
- Show a visible newer-version indicator and open the fixed release page when clicked.
- Keep installation manual; document source checkout updates and the distinction from upstream Orkas downloads.

## Limits

GitHub Releases must actually contain a newer release. A source release does not install itself into another computer. The initial channel is stable releases only; prereleases are ignored.
