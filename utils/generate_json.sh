#!/bin/bash

# Set the path to the directory containing your issues and articles
MAGAZINE_DIR="../issues"

# Initialize an empty JSON object
JSON="{ \"issues\": [] }"

# Loop through issue directories
for issue_dir in "$MAGAZINE_DIR"/*; do
  issue_name="$(basename "$issue_dir")"
  articles_json="["
  
  # Loop through article files in the issue directory
  for article_file in "$issue_dir"/*.html; do
    article_name="$(basename "$article_file")"
    articles_json+="\n    { \"name\": \"$article_name\" },"
  done
  
  # Remove the trailing comma from the last article entry
  articles_json="${articles_json%,}"
  
  articles_json+="\n  ]"
  
  # Add issue data to the JSON
  JSON+="\n  { \"name\": \"$issue_name\", \"articles\": $articles_json },"
done

# Remove the trailing comma from the last issue entry
JSON="${JSON%,}"

# Add the closing bracket to complete the JSON
JSON+="\n}"

# Write the JSON to a file
echo -e "$JSON" > magazine_structure.json

# Print a message to confirm the file creation
echo "JSON file 'magazine_structure.json' has been created."

