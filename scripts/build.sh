#!/bin/bash -eu

# Build environment was changed since 7.6.0 (https://github.com/KonghaYao/cn-font-split/commit/f3c35d546b47cae3cb8be735091654558defafcc)
# and the newer environment (Ubuntu 22.04) has a version of glibc incompatible with the Vercel environment.
# So we need to install the older version of cn-font-split core.
pnpm dlx cn-font-split i default@7.5.5

rootDir="$(pwd)"
rootDist="${rootDir}/dist"
decksDir="${rootDir}/decks"

if [ -d "$rootDist" ]; then
  echo "Cleaning existing ${rootDist} folder..."
  rm -rf "$rootDist"
fi
mkdir -p "$rootDist"

if [ ! -d "$decksDir" ]; then
  echo "Error: ${decksDir} directory not found." >&2
  exit 1
fi

for pkgDir in "${decksDir}"/*; do
  if [ -d "$pkgDir" ]; then
    dirName="$(basename "$pkgDir")"

    if [ -f "${pkgDir}/package.json" ]; then
      pushd "$pkgDir"
      pnpm build --base /${dirName} --out ${rootDist}/${dirName}
      popd
    fi
  fi
done

pnpm --filter index build
mv packages/index/dist/* "${rootDist}/."
