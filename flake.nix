{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils = {
      url = "github:numtide/flake-utils";
      inputs.systems.url = "github:nix-systems/default-linux";
    };
    home-manager = {
      url = "github:nix-community/home-manager";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{
      self,
      nixpkgs,
      flake-utils,
      home-manager,
    }:
    {
      homeManagerModules.default = import ./modules inputs;

      lib = import ./lib inputs;

      overlays.default = import ./pkgs inputs;
    }
    // flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system}.extend self.overlays.default;
      in
      {
        formatter = pkgs.nixfmt-rfc-style;

        packages = {
          inherit (pkgs) mithril-control-center mithril-shell;
        };

        checks = {
          biome = self.lib.mkCheck {
            inherit pkgs;

            name = "biome";
            inputs = [
              pkgs.biome
            ];
            text = ''
              biome check
            '';
          };

          home-manager = self.lib.mkHomeManagerCheck {
            inherit pkgs;

            module = {
              imports = [
                self.homeManagerModules.default
              ];

              services.mithril-shell.enable = true;
              services.mithril-shell.integrations.hyprland.enable = true;
            };
          };

          nixfmt = self.lib.mkCheck {
            inherit pkgs;

            name = "nixfmt";
            inputs = [
              pkgs.nixfmt-rfc-style
            ];
            text = ''
              nixfmt -c .
            '';
          };
        };

        devShells.default = pkgs.mkShell {
          packages =
            with pkgs;
            pkgs.mithril-shell.passthru.packages
            ++ [
              biome
              sass
              typescript-language-server
              vscode-langservers-extracted
            ];

          shellHook = ''
            # This assumes the only flake.nix file in the project is in the root directory.
            if test -f flake.nix; then
              # Link the generates ags types in order to get better LSP support.
              ln -sf "$(dirname $(which ags))/../share/com.github.Aylur.ags/types" ags/
            fi
          '';
        };
      }
    );
}
