{
  gnome-control-center,
  readPatches,
}:
gnome-control-center.overrideAttrs (old: {
  pname = "mithril-control-center";

  patches = old.patches ++ (readPatches ./.);

  postFixup = ''    
    for i in $out/share/applications/*; do
      substituteInPlace $i --replace "Exec=$out/bin/gnome-control-center" "Exec=$out/bin/mithril-control-center"
    done
    mv $out/bin/gnome-control-center $out/bin/mithril-control-center
  '';

  doCheck = false;

  meta.mainProgram = "mithril-control-center";
})
