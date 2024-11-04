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
  adwaita-icon-theme,
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
    adwaita-icon-theme
  ];

  text = ''
    XDG_DATA_DIRS=$XDG_DATA_DIRS:${adwaita-icon-theme}/share
    exec ags -c ${agsConfig}/config.js -b mithril-shell "$@"
  '';

  derivationArgs.passthru.packages = runtimeInputs;
}
