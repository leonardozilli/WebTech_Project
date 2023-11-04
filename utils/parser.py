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
    nlp = spacy.load("en_core_web_trf")
    doc = nlp(text)
    entities = [(ent.text, ent.label_) for ent in doc.ents if ent.label_ in ["PERSON", "FAC", "ORG", "GPE", "EVENT", "PRODUCT", "LAW"] or ent.label_ == "DATE" and re.match(r'\d{4}', ent.text) ]
    return entities

def wrap_entities_with_tags(p_text, entities):
    for entity, entity_type in entities:
        entity = re.sub(r'(\n|\s{2,}|[’\']s$|^[tT]he\s+)', '', entity)
        entity_id = entity.replace(' ', '_').strip().lower()
        entity_occurrences = re.finditer(re.escape(entity), p_text)
        
        if entity_type != "DATE":
            for match in entity_occurrences:
                p_text = re.sub(rf'(?<!<span class="tag[^"]">)\b{entity}\b(?!<\/span>)', f"""<span class="tag {tags[entity_type]}" id="{entity_id}">{entity}</span>""", p_text, re.IGNORECASE)
        else:
                p_text = re.sub(rf'(?<!"){entity}(?!<\/span>)', f"""<span class="tag {tags[entity_type]}" id="{entity_id}">{entity}</span>""", p_text, re.IGNORECASE)
    
    return p_text

def main():
    input_html_path = "./what-to-do-with-climate-emotions.html"
    output_html_path = "./what-to-do-with-climate-emotions_parsed.html"

    with open(input_html_path, 'r', encoding='utf-8') as text:
        html_content = text.read()
    
    soup = BeautifulSoup(html_content, 'html.parser')

    ps = soup.find_all('p')

    for p in ps:
        entities = extract_entities(p.get_text())
        print('---')
        print(entities)
        p_text = str(p.get_text())
        p_text_with_tags = wrap_entities_with_tags(p_text, entities)

        if p.string is not None:
            p.string.replace_with(BeautifulSoup(p_text_with_tags, 'html.parser'))
        else:
            print('skipped!')
            print(p.string)
            print(p)

    with open(output_html_path, 'w', encoding='utf-8') as file:
        file.write(str(soup))


if __name__ == "__main__":
    main()
