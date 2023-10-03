import requests
import urllib.parse
import os

os.chdir('./img/icaps')

base_url = 'https://blackletterkingjamesbible.com/Content/icaps/'

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Referer': 'https://blackletterkingjamesbible.com/',
}

for letter in range(ord('a'), ord('z')+1):
    letter_url = base_url + urllib.parse.quote(chr(letter)) + 'b.gif'
    response = requests.get(letter_url, headers=headers)
    
    if response.status_code == 200:
        file_name = chr(letter) + '.gif'
        with open(file_name, 'wb') as file:
            file.write(response.content)