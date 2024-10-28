inputs:
# An overlay of all the packages exported by the flake.
final: prev: rec {
  mithril-control-center = final.callPackage ./mithril-control-center {
    inherit (inputs.self.lib) readPatches;
  };
  mithril-shell = final.callPackage ./mithril-shell {
    inherit mithril-control-center;
  };
}
