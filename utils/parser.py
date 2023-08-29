from bs4 import BeautifulSoup
import spacy
import re

tags = {
    "PERSON": "person",
    "FAC": "building",
    "ORG": "organization",
    "GPE": "place",
    "EVENT": "event",
    "PRODUCT": "product",
    "LAW": "law",
    "DATE": "date"
}

def extract_entities(text):
    nlp = spacy.load("en_core_web_lg")
    doc = nlp(text)
    entities = [(ent.text, ent.label_) for ent in doc.ents if ent.label_ in ["PERSON", "FAC", "ORG", "GPE", "EVENT", "PRODUCT", "LAW"] or ent.label_ == "DATE" and re.match(r'\d{4}', ent.text) ]
    return entities

def main():
    text = "./issues/1/03_the-real-obstacle-to-nuclear-power.html"
    with open(text, 'r', encoding='utf-8') as text:
        html_content = text.read()
    
    soup = BeautifulSoup(html_content, 'html.parser')

    ps = soup.find_all('p')

    for p in ps:
        entities = extract_entities(p.get_text())
        print('---')
        print(entities)
        p_text = str(p.get_text())
        for entity in entities:
            p_text = re.sub(rf'(?<!<span class="tag[^"]">){entity[0]}(?!<\/span>)', f"""<span class="tag {tags[entity[1]]}">{entity[0]}</span>""", p_text, re.IGNORECASE)
            
        p.contents = BeautifulSoup(p_text, "html.parser").contents
        
    with open('./parsed.html', 'w', encoding='utf-8') as file:
        file.write(str(soup))

    


if __name__ == "__main__":
    main()
