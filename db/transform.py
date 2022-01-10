import csv
import sqlite3

def tr_category_data(categories):
    """
    Transform the category data into a list of dictionaries
    """
    category_dicts = []
    for category in categories:
        first_val = category.split('_')[0]
        key = ''
        category_dict = {}
        if 'hydro' in first_val:
            key = 'HFCS'
        elif 'perfluoro' in first_val:
            key = 'PFCS'
        elif 'carbon' in first_val:
            key = 'CO2'
        elif 'green' in first_val:
            key = 'GHGS'
            if 'indirect' in category:
                key += '_CO2'
        elif 'sulphur' in first_val:
            key = 'SF6'
        elif 'methane' in first_val:
            key = 'CH4'
        elif 'nitrous' in first_val:
            key = 'N2O'
        elif 'nitrogen' in first_val:
            key = 'NF3'
        else:
            key = 'UNSPECIFIED'

        category_dict[key] = category
        category_dicts.append(category_dict)
    return category_dicts

# insert country data into sqlite3 'gas_inventory.db' table 'country'
def insert_country(countries):
    conn = sqlite3.connect('gas_inventory.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS countries
                 (id INTEGER PRIMARY KEY,
                 country TEXT)''')
    for country in countries:
        print(country)
        c.execute('''INSERT INTO countries
                    (country)
                    VALUES (?)''', [country])
    conn.commit()
    conn.close()

# insert category data into sqlite3 'gas_inventory.db' table 'category'
def insert_category(category_dicts):
    conn = sqlite3.connect('gas_inventory.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS category
                 (id INTEGER PRIMARY KEY,
                 category TEXT,
                 string TEXT)''')
    for cat in category_dicts:
        c.execute('''INSERT INTO category
                    (category, string)
                    VALUES (?, ?)''', (list(cat.keys())[0], list(cat.values())[0]))
    conn.commit()
    conn.close()

# fetch id from country table by country name
def fetch_country_id(country):
    conn = sqlite3.connect('gas_inventory.db')
    c = conn.cursor()
    c.execute('''SELECT id FROM countries WHERE country = ?''', (country,))
    id = c.fetchone()
    conn.close()
    return id

# fetch id from category table by string
def fetch_category_id(string):
    conn = sqlite3.connect('gas_inventory.db')
    c = conn.cursor()
    c.execute('''SELECT id FROM category WHERE string = ?''', (string,))
    id = c.fetchone()
    conn.close()
    return id

# insert data in sqlite3 'gas_inventory.db'
def insert_data(data):
    conn = sqlite3.connect('gas_inventory.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS inventory
                 (id INTEGER PRIMARY KEY,
                 country_id INTEGER,
                 year INTEGER,
                 value REAL,
                 category_id INTEGER)''')
    for i in range(len(data)):
        data[i][3] = fetch_category_id(data[i][3])[0]
        data[i][0] = fetch_country_id(data[i][0])[0]
        c.execute('''INSERT INTO inventory
                    (country_id, year, value, category_id)
                    VALUES (?, ?, ?, ?)''', data[i])
    conn.commit()
    conn.close()

def main():
    with open('./greenhouse_gas_inventory_data_data.csv', 'r') as f:
        reader = csv.reader(f)
        header = next(reader)
        categories = set()
        countries = set()
        data = [row for row in reader]
        for i in range(len(data)):
            countries.add(data[i][0])
            categories.add(data[i][3])
        categories = list(categories)
        countries = list(countries)

        category_dicts = tr_category_data(categories)
        category_dicts.sort()

        countries.sort()

        insert_country(countries)
        insert_category(category_dicts)
        insert_data(data)

if __name__ == '__main__':
    main()

