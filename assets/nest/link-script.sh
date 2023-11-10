#!/bin/sh
assets_dir=$1
auth_type=$2
isMac=$3

uname_output="$(uname -s)"

dir="/"
full_auth_dir="${assets_dir}/nest/multiple-choice-features/authorization/${auth_type}"
full_test_dir="${assets_dir}/nest/multiple-choice-features/authorization/test/${auth_type}"

files=$(ls -R "${full_auth_dir}/")

mkdir "${assets_dir}/nest/example-app/src/api/auth"

for file in $files; do
  if [[ $file == *: ]]; then
    dir=$(echo $file | sed "s/^.*${auth_type}\///" | sed "s/:$/\//")

    if [[ $isMac == "false" ]] && [[ $dir != "/" ]]; then
      dir="/${dir}"
    fi

    mkdir -p "${assets_dir}/nest/example-app/src/api/auth${dir}"
  fi

  if [[ $file == *.ts ]]; then
    ln "${full_auth_dir}${dir}${file}" "${assets_dir}/nest/example-app/src/api/auth${dir}${file}"
  fi
done

files=$(ls -R "${full_test_dir}/")
for file in $files; do
  if [[ $file == *: ]]; then
    dir=$(echo $file | sed "s/^.*${auth_type}\///" | sed "s/:$/\//")

    if [[ $isMac == "false" ]] && [[ $dir != "/" ]]; then
      dir="/${dir}"
    fi

    mkdir -p "${assets_dir}/nest/example-app/test${dir}"
  fi

  if [[ $file == *.ts ]]; then
    ln "${full_test_dir}${dir}${file}" "${assets_dir}/nest/example-app/test${dir}${file}"
  fi
done
