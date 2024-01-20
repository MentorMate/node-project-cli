#!/bin/bash

# Define the paths
current_working_directory=$(pwd)

path_to_old_folder="$(dirname "$current_working_directory")"
path_to_new_folder="$(dirname "$current_working_directory")"

# Define the possible values
frameworks=("express" "nest")
databases=("pg" "mongodb")
auths=("auth0" "jwt")

# Iterate over each framework
for framework in ${frameworks[@]}; do
  if [ $framework = "express" ]; then
    # If express, only use pg for database
    databases=("pg")
  else
    # If not express, use all databases
    databases=("pg" "mongodb")
  fi

  # Iterate over each database
  for database in ${databases[@]}; do
    project_database=$database

    if [ $database = "mongodb" ]; then
      # If mongodb, change the name to mongo for the project name
      project_database="mongo"
    fi

    for auth in ${auths[@]}; do
      # Define the project name
      project_name="${framework}-${project_database}-${auth}"

      # Delete the old folder
      rm -rf "${path_to_old_folder}/${project_name}"

      node bin/node-cli g $project_name -e --database=$database --framework=$framework --auth=$auth  --path="${path_to_new_folder}" &
    done
  done
done

wait