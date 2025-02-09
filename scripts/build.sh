#!/bin/bash -eu

rootDir="$(pwd)"
rootDist="${rootDir}/dist"
talksDir="${rootDir}/talks"

if [ -d "$rootDist" ]; then
  echo "Cleaning existing ${rootDist} folder..."
  rm -rf "$rootDist"
fi
mkdir -p "$rootDist"

if [ ! -d "$talksDir" ]; then
  echo "Error: ${talksDir} directory not found." >&2
  exit 1
fi

for pkgDir in "${talksDir}"/*; do
  if [ -d "$pkgDir" ]; then
    dirName="$(basename "$pkgDir")"

    if [ -f "${pkgDir}/package.json" ]; then
      pushd "$pkgDir"
      pnpm build --base ${dirName} --out ${rootDist}/${dirName}
      popd
    fi
  fi
done
