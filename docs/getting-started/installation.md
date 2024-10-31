# Installation

## Requirements

There are a few requirements needed in order to use mithril-shell:
- The nix package manager with [nix flakes](https://wiki.nixos.org/wiki/Flakes) enabled.
  [This nix installer](https://github.com/DeterminateSystems/nix-installer) is recommended.
- The latest release version of hyprland.
- [Home-manager](https://github.com/nix-community/home-manager) is required to install & configure
  mithril-shell.
  This project targets the NixOS unstable and latest NixOS stable channel.

::: info
Home-manager officially only targets NixOS, but it is known to work on many other linux distros and
supports standalone installation.

[standalone installation guide](https://nix-community.github.io/home-manager/index.xhtml#sec-flakes-standalone)
:::

### Optional dependencies

By default mithril-shell will open
[SwayNotificationCenter](https://github.com/ErikReider/SwayNotificationCenter) as its notification
center.
This is temporary behaviour until a native notification center is implemented
([#8](https://github.com/AndreasHGK/mithril-shell/issues/8)).

If your home-manager setup uses [stylix](https://github.com/danth/stylix), integration with it is
automatically enabled.
This behaviour can be disabled.

## Setup

After
[creating your initial flake](https://nix-community.github.io/home-manager/index.xhtml#ch-nix-flakes)
or using your pre-existing flake, add the following line to your `flake.nix`'s inputs section:
```nix
mithril-shell.url = "github:andreashgk/mithril-shell";
```

Add the `mithril-shell.homeManagerModules.default` module to the imports if your home configuration.
You can then set the following options:
```nix
services.mithril-shell.enable = true;
# Enable this if you want the bar to configure the necessary hyprland settings
# for you. Without this the bar will not automatically start on launch.
services.mithril-shell.integrations.hyprland.enable = true;
```

::: warning
The `integrations.hyprland.enable` option should only be set to true if you configure hyprland
through home-manager, as your configuration may otherwise fail to apply or even overwrite your
existing hyprland configuration.
:::

Your final nix flake may look something like this if you started out with one of the home-manager
templates:
```nix
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    home-manager = {
      url = "github:nix-community/home-manager";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    mithril-shell.url = "github:andreashgk/mithril-shell";
  };

  outputs = { nixpkgs, home-manager, mithril-shell, ... }:
    let
      # Can also be "aarch64-linux", for example if you are on asahi linux.
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      # Replace 'jdoe' with your linux user's name.
      homeConfigurations.jdoe = home-manager.lib.homeManagerConfiguration {
        inherit pkgs;

        modules = [
          mithril-shell.homeManagerModules.default
          {
            services.mithril-shell.enable = true;
            services.mithril-shell.integrations.hyprland.enable = true;
          }
        ];
      };
    };
}
```

## Applying your configuration

To build and apply your configuration you will need to run one of the following two commands
depending on how you installed home-manager:
```bash
# If you use home-manager as a standalone program:
home-manager switch

# If you use home-manager as a nixos module:
nixos-rebuild switch
```

To see any changes made to mithril-shell without rebooting you can run the following command:
```bash
# Do not run this with sudo!
systemctl --user restart mithril-shell
```
