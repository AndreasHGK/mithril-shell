inputs: {
  imports = inputs.self.lib.mkImports [
    ./mithril-control-center.nix
    ./mithril-shell.nix
  ];
}
