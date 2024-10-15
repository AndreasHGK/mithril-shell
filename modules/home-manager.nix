{
  config,
  lib,
  pkgs,
  ...
}:
let
  # Name that the systemd service for the bar will use.
  service-name = "ags-bar";
  cfg = config.services.ags-bar;
in
{
  options.services.ags-bar = with lib; {
    enable = mkOption {
      type = types.bool;
      default = false;
      description = ''
        Whether to enable ags-bar. Does not automatically start the bar in your window manager.
      '';
    };      

    intergation = {
      hyprland.enable = mkOption {
        type = types.bool;
        default = false;
        description = ''
          If enabled, autostarts the bar when hyprland launches.
        '';
      };      
    };
  };

  config = lib.mkIf cfg.enable {
    # The systemd user service that is in charge of running the bar. It needs to be manually started
    # by your desktop environment.
    systemd.user.services.${service-name} = {
      Unit = {
        Description = "Aylur's Gnome Shell";
        Documentation = "https://aylur.github.io/ags-docs/";
        PartOf = [ "graphical-session.target" ];
        After = [ "graphical-session-pre.target" ];
      };

      Service = {
        ExecStart = "${pkgs.ags}/bin/ags -c ${../ags}/config.js";
        Restart = "on-failure";
        KillMode = "mixed";
        Environment = [
          "PATH=${pkgs.bun}/bin:${pkgs.coreutils}/bin:${pkgs.sassc}/bin:${pkgs.swaynotificationcenter}/bin"
        ];
      };
    };

    wayland.windowManager.hyprland = lib.mkIf cfg.intergation.hyprland.enable {
      settings = {
        exec-once = [
          "systemctl --user start ${service-name}"
        ];
      };
    };
  };
}
