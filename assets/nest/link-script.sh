assets_dir=$1
auth_type=$2
database=$3

dir="/"
full_auth_dir="${assets_dir}/nest/multiple-choice-features/authorization/${database}/${auth_type}"
full_test_dir="${assets_dir}/nest/multiple-choice-features/authorization/${database}/test/${auth_type}"

files=$(ls -R "${full_auth_dir}/")
echo $files
for file in $files; do
  if [[ $file == *: ]]; then
    dir=$(echo $file | sed "s/^.*${auth_type}//" | sed "s/:$/\//")
    mkdir "${assets_dir}/nest/example-app-${database}/src/api/auth${dir}"
  fi

  if [[ $file == *.ts ]]; then
    ln "${full_auth_dir}${dir}${file}" "${assets_dir}/nest/example-app-${database}/src/api/auth${dir}${file}"
  fi
done

files=$(ls -R "${full_test_dir}/")
for file in $files; do
  if [[ $file == *: ]]; then
    dir=$(echo $file | sed "s/^.*${auth_type}//" | sed "s/:$/\//")
    mkdir "${assets_dir}/nest/example-app-${database}/test${dir}"
  fi

  if [[ $file == *.ts ]]; then
    ln "${full_test_dir}${dir}${file}" "${assets_dir}/nest/example-app-${database}/test${dir}${file}"
  fi
done
