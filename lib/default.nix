inputs:
let
  inherit (inputs.nixpkgs) lib;
in
{
  # Creates a simple check consisting of a shell script to be used in the flake's `checks` output.
  # The commands in this script are executed at the root of the repository.
  mkCheck =
    {
      inputs ? [ ],
      name,
      pkgs,
      text,
    }:
    pkgs.runCommand name
      {
        nativeBuildInputs = inputs;
      }
      ''
        mkdir -p $out
        # Change directory to the project root.
        cd ${../.}
        ${text}
      '';

  # Creates a derivation that builds a home-manager configuration with the specified module(s),
  # essentially creating a test that passes when the configuration builds successfully.
  mkHomeManagerCheck =
    {
      module ? { },
      modules ? [ ],
      pkgs,
    }:
    (inputs.home-manager.lib.homeManagerConfiguration {
      inherit pkgs;

      modules = modules ++ [
        module

        # Sets some options that are required in a home-manager configuration. The actual values are
        # not very important since the configuration is never applied.
        {
          home.username = "user";
          home.homeDirectory = "/home/user";
          home.stateVersion = "24.11";
        }
      ];
    }).activationPackage;

  # Simple helper function to facilitate importing other modules in a home-manager (or nixos)
  # module.
  mkImports = paths: builtins.map (elem: import elem inputs) paths;

  # Takes a path to a folder and returns a list with full paths to all the `.patch` files in the
  # folder.
  readPatches =
    path:
    lib.pipe (builtins.readDir path) [
      (lib.filterAttrs (_: type: type == "regular"))
      (lib.filterAttrs (name: _: lib.hasSuffix ".patch" name))
      (lib.mapAttrsToList (name: _: path + ("/" + name)))
    ];
}
