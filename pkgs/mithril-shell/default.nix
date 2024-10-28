{
  ags,
  bun,
  gammastep,
  grim,
  libnotify,
  mithril-control-center,
  sassc,
  swaynotificationcenter,
  writeShellApplication,
  wl-clipboard,
  agsConfig ? ../../ags,
}:
writeShellApplication rec {
  name = "mithril-shell";

  runtimeInputs = [
    ags
    bun
    gammastep
    grim
    libnotify
    mithril-control-center
    sassc
    swaynotificationcenter
    wl-clipboard
  ];

  text = ''
    exec ags -c ${agsConfig}/config.js "$@"
  '';

  derivationArgs.passthru.packages = runtimeInputs;
}
