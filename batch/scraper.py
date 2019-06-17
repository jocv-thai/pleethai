import re,requests
from bs4 import BeautifulSoup

def scraper(req_param: dict, scrapings: list, url='https://www.google.co.jp/search'):
    '''returns scraping result strings taken using requests and bs4
    
    :param req_param: request parameter
    :param scrapings: list of setting scrapings dict data(key:"search_tag", "attrs")
    :param url: target url for web scraping(default: google japan)
    :rtype: List(String data)
     '''

    # user-agent
    ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) \
        AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8"

    # response
    res=requests.get(url, \
        headers={"user-agent": ua}, params=req_param)

    # parse html
    soup=BeautifulSoup(res.text.encode('utf-8'), "html.parser")
    result_scrapings = []

    for obj in scrapings:
        # get scraping result(as String)
        result_scrapings_html = str(soup.find(obj["search_tag"], attrs=obj["attrs"]))
        # delete html tag for result scrapings
        result_scrapings.append(re.compile(r"<[^>]*?>").sub("", result_scrapings_html))
    
    return result_scrapings
