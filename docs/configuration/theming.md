# Theming

The color scheme can easily be changed by setting the following attributes:

```nix
services.mithril-shell.theme.colors = {
  primary = "#94e2d5";
  text = "#cdd6f4";
  background0 = "#181825";
  background1 = "#1e1e2e";
  surface0 = "#313244";
};
```

## Stylix integration

If your system is already configured using the stylix home-manager module the bar will automatically
use those colors.
You can disable this behaviour like so:

```nix
services.mithril-shell.integrations.stylix.enable = false;
```
