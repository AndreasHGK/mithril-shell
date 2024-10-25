inputs:
let
  inherit (inputs.nixpkgs) lib;
in
{
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
