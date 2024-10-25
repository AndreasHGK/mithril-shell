# Mithril Shell

An opinionated bar based on the GNOME status bar that works out of the box.
It is built with [AGS](https://github.com/Aylur/ags) and meant to be used on hyprland with
home-manager.

## Usage

Home-manager is required to use this bar.
Import this flake by adding the following to your inputs:

```nix
inputs.mithril-shell = {
  url = "github:andreashgk/mithril-shell";
  # Optional, but recommended.
  inputs.nixpkgs.follows = "nixpkgs";
};
```

After importing this flake, add the `mithril-shell.homeManagerModules.default` module to your
imports and add the following config to your home:

```nix
services.mithril-shell.enable = true;
# Enable this if you want the bar to configure the necessary hyprland settings for you. Without this
# the bar will not automatically start on launch.
services.mithril-shell.integrations.hyprland.enable = true;
```

### Theming

The color scheme can easily be changed by setting the following attributes.

```nix
services.mithril-shell.theme.colors = {
  text = "#cdd6f4";
  background = "#181825";
  # Color of the ovals drawn around widgets when hovering over them.
  hover = "#313244";
  # Color of non-active workspaces.
  silent = "#585b70";
};
```

#### Stylix integration

If your system is already configured using the stylix home-manager module
the bar will automatically use those colors.
You can disable this behaviour like so.

```nix
services.mithril-shell.integrations.stylix.enable = false;
```
