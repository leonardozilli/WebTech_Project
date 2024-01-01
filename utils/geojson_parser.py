import json
import sys
from bs4 import BeautifulSoup

def get_geometry_by_id(geojson_data, element_id, type=None):
    aaa = {
        'united_states': 'United States of America'
    }

    id =  element_id.replace("_", " ") if element_id not in aaa else aaa[element_id]
    
    id_key = 'ADMIN' if type == 'country' else 'name'
    for feature in geojson_data['features']:
        if feature['properties'][id_key].lower() == id.lower():
            return feature['geometry']
    return None

def extract_geojson(html_content, countries_geojson=False, state_geojson=False):
    soup = BeautifulSoup(html_content, 'html.parser')
    article = soup.find('article')
    features = []

    if article:
        for paragraph in article.find_all('p'):
            for tag in paragraph.find_all('span', class_='place', id=True):
                element_id = tag.get('id')
                coordinates = tag.get('data-coord')
                classes = tag.get('class')

                geometry = None

                if coordinates:
                    geometry = {
                        'type': 'Point',
                        'coordinates': [float(coord) for coord in coordinates.split(',')]
                    }
                elif 'country' in classes:
                    if classes[-1] == 'country':
                        print('error in class for ', tag)
                    geometry = get_geometry_by_id(countries_geojson, classes[-1], type='country')

                elif 'state' in classes:
                    geometry = get_geometry_by_id(state_geojson, classes[-1], type='state')
                else:
                    geometry = None

                properties = {
                    'id': element_id,
                    'classes': classes,
                    'name': tag.text
                }

                feature = {
                    'type': 'Feature',
                    'geometry': geometry,
                    'properties': properties
                }

                features.append(feature)

            geojson_data = {
                'type': 'FeatureCollection',
                'features': features
            }

    return geojson_data


def main(target_path, countries_geojson_path, states_geojson_path):
    with open(target_path, 'r', encoding='utf-8') as file:
        html_content = file.read()

    with open(countries_geojson_path, 'r', encoding='utf-8') as countries_file:
        countries_geojson = json.load(countries_file)

    with open(states_geojson_path, 'r', encoding='utf-8') as states_file:
        states_geojson = json.load(states_file)

    geojson_data = extract_geojson(html_content, countries_geojson=countries_geojson, state_geojson=states_geojson)

    with open(target_path.replace('.html', '.geojson'), 'w', encoding='utf-8') as output_file:
        json.dump(geojson_data, output_file, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    if len(sys.argv) != 4:
        print("Usage: python script.py <target_path>")
        sys.exit(1)

    target_path = sys.argv[1]
    countries_geojson_path = sys.argv[2]
    states_geojson_path = sys.argv[3]
    main(target_path, countries_geojson_path, states_geojson_path)