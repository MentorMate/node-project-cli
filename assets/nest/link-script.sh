#!/bin/sh
assets_dir=$1
auth_type=$2
database=$3
isMac=$4

uname_output="$(uname -s)"

dir="/"
full_auth_dir="${assets_dir}/nest/multiple-choice-features/authorization/${database}/${auth_type}"
full_users_dir="${assets_dir}/nest/multiple-choice-features/users/${database}/${auth_type}"
full_test_dir="${assets_dir}/nest/multiple-choice-features/authorization/${database}/test/${auth_type}"

mkdir "${assets_dir}/nest/example-app-${database}/src/api/auth"
mkdir "${assets_dir}/nest/example-app-${database}/src/api/users"

files=$(ls -R "${full_auth_dir}/")

mkdir "${assets_dir}/nest/example-app/src/api/auth"

for file in $files; do
  if [[ $file == *: ]]; then
    dir=$(echo $file | sed "s/^.*${auth_type}\///" | sed "s/:$/\//")

    if [[ $isMac == "false" ]] && [[ $dir != "/" ]]; then
      dir="/${dir}"
    fi

    mkdir -p "${assets_dir}/nest/example-app-${database}/src/api/auth${dir}"
  fi

  if [[ $file == *.ts ]]; then
    ln "${full_auth_dir}${dir}${file}" "${assets_dir}/nest/example-app-${database}/src/api/auth${dir}${file}"
  fi
done

files=$(ls -R "${full_users_dir}/")
echo $files
for file in $files; do
  if [[ $file == *: ]]; then
    dir=$(echo $file | sed "s/^.*${auth_type}\///" | sed "s/:$/\//")

    if [[ $isMac == "false" ]] && [[ $dir != "/" ]]; then
      dir="/${dir}"
    fi

    mkdir -p "${assets_dir}/nest/example-app-${database}/src/api/users${dir}"
  fi

  if [[ $file == *.ts ]]; then
    ln "${full_users_dir}${dir}${file}" "${assets_dir}/nest/example-app-${database}/src/api/users${dir}${file}"
  fi
done

files=$(ls -R "${full_test_dir}/")
for file in $files; do
  if [[ $file == *: ]]; then
    dir=$(echo $file | sed "s/^.*${auth_type}\///" | sed "s/:$/\//")

    if [[ $isMac == "false" ]] && [[ $dir != "/" ]]; then
      dir="/${dir}"
    fi

    mkdir -p "${assets_dir}/nest/example-app-${database}/test${dir}"
  fi

  if [[ $file == *.ts ]]; then
    ln "${full_test_dir}${dir}${file}" "${assets_dir}/nest/example-app-${database}/test${dir}${file}"
  fi
done

utils_path="${assets_dir}/nest/example-app-${database}/src/utils"
full_enviroment_dir="${assets_dir}/nest/multiple-choice-features/environment/${database}-${auth_type}"

for file in environment.ts environment.spec.ts
do
  rm -rf "${utils_path}/${file}"
  ln "${full_enviroment_dir}/${file}" "${utils_path}"
done