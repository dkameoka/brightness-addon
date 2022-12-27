#!/usr/bin/env bash

set -o errexit -o noclobber -o nounset -o pipefail

script_path=$(realpath "$0")
script_dir=$(dirname "$script_path")
cd "$script_dir"

rm --verbose --force brightness-addon.zip
zip -r brightness-addon.zip * --exclude '*.git*' --exclude '*.sh' --exclude '*.zip' --exclude '*.md' --exclude '*/_*' --exclude '_*'
echo 'Wrote brightness-addon.zip'

