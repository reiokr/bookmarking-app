# from pprint import pprint
import requests
from bs4 import BeautifulSoup

URL = "https://www.monster.com/jobs/search/?q=Software-Developer&where=Australia"
page = requests.get(URL)

# print(URL)
soup = BeautifulSoup(page.content, 'html.parser')
#
# print(soup)
results = soup.find()

# print(results.prettify())
job_elements = results.find_all('section', class_='card-content')
for job_element in job_elements:
    print(job_element, end='\n'*2)

