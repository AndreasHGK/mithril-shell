inputs:
{
  config,
  lib,
  pkgs,
  ...
}:
let
  inherit (inputs) self;
  inherit (pkgs.hostPlatform) system;

  # Name that the systemd service for the bar will use.
  service-name = "mithril-shell";
  cfg = config.services.mithril-shell;

  hexColorType = lib.mkOptionType {
    name = "hex-color";
    descriptionClass = "noun";
    description = "RGB color in hex format";
    check = x: lib.isString x && !(lib.hasPrefix "#" x) && builtins.match "^[0-9A-Fa-f]{6}$" x != null;
  };
  mkHexColorOption =
    default:
    lib.mkOption {
      type = lib.types.coercedTo lib.types.str (lib.removePrefix "#") hexColorType;
      inherit default;
      example = default;
    };
in
{
  options.services.mithril-shell = with lib; {
    enable = mkOption {
      type = types.bool;
      default = false;
      description = ''
        Whether to enable mithril-shell. Does not automatically start the bar in your window manager.
      '';
    };

    package = mkOption {
      type = types.package;
      default = self.packages.${system}.mithril-shell;
      defaultText = "inputs.mithril-shell.packages.\${system}.mithril-shell";
      description = ''
        The mithril-shell package to use.
      '';
    };

    finalPackage = mkOption {
      type = types.package;
      readOnly = true;
      visible = false;
      description = ''
        The resulting mithril-shell package.
      '';
    };

    theme.colors = {
      primary = mkHexColorOption "#94e2d5";
      text = mkHexColorOption "#cdd6f4";
      background0 = mkHexColorOption "#181825";
      background1 = mkHexColorOption "#1e1e2e";
      surface0 = mkHexColorOption "#313244";
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
        default = config.stylix.enable or false;
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
        Description = "Mithril Shell";
        Documentation = "https://github.com/AndreasHGK/mithril-shell";
        PartOf = [ "graphical-session.target" ];
        After = [ "graphical-session-pre.target" ];
      };

      Service = {
        ExecStart = "${cfg.finalPackage}/bin/mithril-shell";
        Restart = "on-failure";
        KillMode = "mixed";
      };
    };

    wayland.windowManager.hyprland = lib.mkIf cfg.integrations.hyprland.enable {
      settings = {
        exec-once = [
          "systemctl --user start ${service-name}"
        ];
      };
    };

    services.mithril-shell.finalPackage =
      let
        generateThemeScss = colors: ''
          \$primary: #${colors.primary};
          \$text: #${colors.text};
          \$background0: #${colors.background0};
          \$background1: #${colors.background1};
          \$surface0: #${colors.surface0};
        '';

        colors =
          if cfg.integrations.stylix.enable && config.stylix.enable then
            let
              stylixColors = config.lib.stylix.colors;
            in
            {
              primary = stylixColors.base0C;
              text = stylixColors.base05;
              background0 = stylixColors.base00;
              background1 = stylixColors.base01;
              surface0 = stylixColors.base02;
            }
          else
            cfg.theme.colors;

        agsConfig = pkgs.stdenv.mkDerivation {
          name = "ags-config";
          src = ../ags;
          allowSubstitutes = false;
          buildPhase = "true";
          installPhase = ''
            mkdir -p $out
            cp -r . $out
            echo "${generateThemeScss colors}" > $out/theme.scss
          '';
        };
      in
      cfg.package.override {
        inherit agsConfig;
      };
  };
}
