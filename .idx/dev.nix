{pkgs}: {
  channel = "stable-24.05";
  packages = [
    pkgs.python311Packages.pip
    pkgs.nodejs_20
  ];
  idx.extensions = [
    "svelte.svelte-vscode"
    "vue.volar"
  ];
  idx.previews = {
    previews = {
      web = {
        command = [
          "npm"
          "run"
          "start"
          "--"
          "--port=5000"
          "--host"
          "0.0.0.0"
        ];
        manager = "web";
      };
    };
  };
}