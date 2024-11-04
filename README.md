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

## Installation & Configuration

An installation guide and configuration reference can be found on the
[wiki](https://andreashgk.github.io/mithril-shell/).

Home-manager is required to use this project.
For more information, take a look at
[nix-community/home-manager](https://github.com/nix-community/home-manager).

You can try the project without installing with the following command:
```bash
nix run github:andreashgk/mithril-shell#mithril-shell
```
NOTE: you may not be able to use the bluetooth panel in the control center if you run it this way.
It should work in a full install.
