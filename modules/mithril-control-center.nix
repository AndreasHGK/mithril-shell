self: {
  config,
  lib,
  pkgs,
  ...
}:
let
  inherit (pkgs.hostPlatform) system;

  cfg = config.programs.mithril-control-center;

  target = "mithril-control-center";

  mkService = exec: {
    Unit = {
      Description = "${target} compatibility service";
      PartOf = "${target}.target";
    };

    Service = {
      ExecStart = exec;
      Restart = "on-failure";
    };
    
    Install.WantedBy = [
      "${target}.target"
    ];
  };
in
{
  options.programs.mithril-control-center = with lib; {
    enable = mkOption {
      type = types.bool;
      default = config.services.mithril-shell.enable;
      description = ''
        Enable mithril-control-center, a patched version of gnome-control-center.

        Patches include improving compatibility outside of GNOME and hiding unsupported and/or
        extraneous settings.
      '';
    };

    package = mkOption {
      type = types.nullOr types.package;
      default = self.packages.${system}.mithril-control-center;
      defaultText = "inputs.mithril-shell.packages.\${system}.default";
      description = ''
        The mithril-control-center package to use.
      '';
    };

    compatibility = {
      enable = mkOption {
        type = types.bool;
        default = true;
        description = ''
          Enable various services to improve compatibility of various aspects of the control center
          app.
        '';
      };

      bluetooth.enable = mkOption {
        type = types.bool;
        default = true;
        description = ''
          Whether to enable gnome-settings-daemon's rfkill service, allowing the bluetooth panel to
          be used.
        '';
      };
    };
  };

  config = lib.mkIf cfg.enable {
    home.packages = lib.mkIf (cfg.package != null) [
      cfg.package
    ];

    systemd.user = lib.mkIf cfg.compatibility.enable {
      targets.${target} = {
        Unit.description = ''
          A group of services to complement mithril-control-center.
        '';

        Install.WantedBy = [  
          "mithril-shell.service"
        ];
      };

      services.gsd-rfkill = lib.mkIf cfg.compatibility.bluetooth.enable
        (mkService "${pkgs.gnome-settings-daemon}/libexec/gsd-rfkill");
    };
  };
}
