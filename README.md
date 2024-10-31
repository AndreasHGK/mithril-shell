# Mithril Shell

An opinionated desktop shell that works out of the box, including a bar and more.
It is built with [AGS](https://github.com/Aylur/ags) and meant to be used on hyprland with
home-manager.

![image](https://github.com/user-attachments/assets/1c0c6cc5-15f6-4693-a85f-5a15639d7bc5)

The aim of this project is to bring the best parts from the polished experience of the GNOME desktop
environment to hyprland.
Full feature parity with GNOME is a non-goal of this project, as is replicating its interface 1:1.

Got a suggestion?
[Open an issue!](https://github.com/AndreasHGK/mithril-shell/issues/new/choose)

## Installation

Home-manager is required to use this project.
For more information, take a look at
[nix-community/home-manager](https://github.com/nix-community/home-manager).

Import this flake by adding the following to your inputs:

```nix
inputs.mithril-shell.url = "github:andreashgk/mithril-shell";
```

Next, import the `mithril-shell.homeManagerModules.default` module to your home configuration and
set the following options:

```nix
services.mithril-shell.enable = true;
# Enable this if you want the bar to configure the necessary hyprland settings for you. Without this
# the bar will not automatically start on launch.
services.mithril-shell.integrations.hyprland.enable = true;
```

Rebuild your configuration and restart the `mithril-shell` user service to see your changes take
effect.
```bash
# Don't run this with sudo!
$ systemctl --user restart mithril-shell
```

## Configuration

### Theming

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

#### Stylix integration

If your system is already configured using the stylix home-manager module the bar will automatically
use those colors.
You can disable this behaviour like so:

```nix
services.mithril-shell.integrations.stylix.enable = false;
```
