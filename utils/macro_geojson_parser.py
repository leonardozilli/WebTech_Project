import os
import json

def process_geojson_file(geojson_path, issue_number, article_number, locations):
    with open(geojson_path, 'r') as geojson_file:
        geodata = json.load(geojson_file)

        for feature in geodata.get('features', []):
            if feature.get('geometry', {}):
                location_properties = feature.get('properties', {})
                location_id = location_properties.get('id')  # Adjust this based on your data structure

                if location_id:
                    if location_id not in locations:
                        locations[location_id] = {'articles': []}

                    articles_list = locations[location_id]['articles']
                    article_info = {'issue': issue_number, 'article': article_number}

                    # Check if the article is already in the list for the location
                    if article_info not in articles_list:
                        articles_list.append(article_info)

def process_directory(directory_path, locations):
    for root, dirs, files in os.walk(directory_path):
        for file in files:
            if file.endswith('.geojson'):
                issue_number = os.path.basename(os.path.dirname(root))
                article_number = os.path.basename(root)
                geojson_path = os.path.join(root, file)

                process_geojson_file(geojson_path, issue_number, article_number, locations)

def main():
    rootdir = './issues'
    locations = {}

    for subdir, dirs, files in os.walk(rootdir):
        for file in files:
            if file.endswith('.geojson'):
                issue_number = os.path.basename(os.path.dirname(subdir))
                article_number = os.path.basename(subdir)
                geojson_path = os.path.join(subdir, file)

                process_geojson_file(geojson_path, issue_number, article_number, locations)

    with open('macro.geojson', 'w') as outfile:
        json.dump(locations, outfile, indent=4)

if __name__ == '__main__':
    main()
