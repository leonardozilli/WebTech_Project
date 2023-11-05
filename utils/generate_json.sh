#!/bin/bash

MAGAZINE_DIR="../issues"

JSON="{ \"issues\": [] }"

for issue_dir in "$MAGAZINE_DIR"/*; do
  issue_name="$(basename "$issue_dir")"
  articles_json="["
  
  for article_file in "$issue_dir"/*.html; do
    article_name="$(basename "$article_file")"
    articles_json+="\n    { \"name\": \"$article_name\" },"
  done
  
  articles_json="${articles_json%,}"
  
  articles_json+="\n  ]"
  
  JSON+="\n  { \"name\": \"$issue_name\", \"articles\": $articles_json },"
done

JSON="${JSON%,}"
JSON+="\n}"

echo -e "$JSON" > magazine_structure.json
echo "JSON file 'magazine_structure.json' has been created."

