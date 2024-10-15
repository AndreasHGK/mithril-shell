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

    integrations = {
      hyprland.enable = mkOption {
        type = types.bool;
        default = false;
        description = ''
          If enabled, autostarts the bar when hyprland launches.
        '';
      };

      stylix.enable = mkOption {
        type = types.bool;
        default = false;
        description = ''
          If enabled, uses the stylix color scheme to style the bar.
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

    wayland.windowManager.hyprland = lib.mkIf cfg.integrations.hyprland.enable {
      settings = {
        exec-once = [
          "systemctl --user start ${service-name}"
        ];
      };
    };

    home.activation = lib.mkIf (config.stylix.enable && cfg.integrations.stylix.enable) {
      agsBarStyle =
        let
          generateColorschemeScss = colors: ''
            $text: #${colors.base01};
            $background: #${colors.base00};
            $hover: #${colors.base02};
            $silent: #${colors.base05};
          '';
        in
        lib.hm.dag.entryAfter [ "writeBoundary" ] ''
          echo "Exporting stylix colors for ${service-name}."
          $DRY_RUN_CMD cat > ${../ags}/colorscheme.scss <<EOF
          ${generateColorschemeScss config.lib.stylix.colors}
          EOF
        '';
    };
  };
}
