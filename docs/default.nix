{
  fetchYarnDeps,
  git,
  home-manager,
  nixosOptionsDoc,
  nodejs,
  pkgs,
  stdenvNoCC,
  yarn,
  yarnConfigHook,
  # The home-manager module to generate documentation for.
  hmModule,
  ...
}:
let
  options = nixosOptionsDoc {
    # We need to evaluate a config in order to get the options.
    options =
      (home-manager.lib.homeManagerConfiguration {
        inherit pkgs;

        modules = [
          hmModule
          {
            home.username = "user";
            home.homeDirectory = "/home/user";
            home.stateVersion = "24.11";
          }
        ];
      }).options;

    # We only want the options defined by this flake.
    transformOptions =
      option:
      option
      // {
        visible =
          option.visible
          && (
            (builtins.elem "mithril-control-center" option.loc) || (builtins.elem "mithril-shell" option.loc)
          );
      };
  };
in
stdenvNoCC.mkDerivation {
  name = "mithril-docs";
  src = ./.;

  yarnOfflineCache = fetchYarnDeps {
    yarnLock = ./yarn.lock;
    # Don't forget to update this when changing the yarn.lock file. Forgetting to update this may
    # cause nix to re-use the old dependencies and you will get an error related to yarn offline
    # mode.
    hash = "sha256-n/MXBkvsSxPj73BMq2Eu+EVCFe9eui5k6x28qFvsYgM=";
  };

  nativeBuildInputs = [
    # Git is needed for vitepress.
    git
    nodejs
    yarn
    yarnConfigHook
  ];

  patchPhase = ''
    # Append the generated options at the end of the options.md file.
    cat ${options.optionsCommonMark} >> ./configuration/options.md
  '';

  buildPhase = ''
    mkdir -p $out
    # For some reason, if the stderr output is not redirected the build will just hang indefinitely.
    if yarn --offline build --outDir $out 2>log ; then
      echo "Build succeeded!"
    else
      echo "Build failed. Logs:"
      cat log
    fi
  '';
}
