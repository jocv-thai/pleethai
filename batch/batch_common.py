import re, requests, openpyxl
from bs4 import BeautifulSoup # html paser
from pykakasi import kakasi  # translate japanese to roman
from janome.tokenizer import Tokenizer # analysis sentence

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

def conv_hiragana_to_roman(word):
    '''conversion hiragana to roman
    
    :param word: target word
    :rtype: String
     '''
    k = kakasi()
    # set mode Hiragana to roman
    k.setMode('H','a') 
    conv = k.getConverter()
    
    return conv.do(word)

def get_part_of_speech(word):
    '''get part of speech 
    if the word is "オームの法則", part of speech is that of "法則"

    :param word: target word
    :rtype: String
    '''
    # <class 'janome.tokenizer.Token'>
    # ex)表      名詞,一般,*,*,*,*,表,ヒョウ,ヒョー
    token = Tokenizer().tokenize(word)[-1]
    # get String ex)"名詞,一般,*,*"
    part_of_speech = token.part_of_speech

    return part_of_speech.split(',')[0]

def get_col_tuple(file: str, sheet: str, col: str):
    '''returns tuple data which get from column of sheet in file

    :param file: target file path
    :param sheet: target sheet name
    :param column: target column name
    :rtype: tuple
    '''
    # open workbook (not DB data)
    wb = openpyxl.load_workbook(file)
    # get first worksheet
    ws = wb.get_sheet_by_name(sheet)
    # return tuple cell of column "japanese"
    return ws[col]

def write_subtitle(active_sheet, subtitles: list):
    '''returns Workbook which finish to set subtitle

    :param subtitles: subtitle which want to set DB excel
    :rtype: Worksheet(active)
    '''
    for i, title in enumerate(subtitles):
        active_sheet.cell(row = 1, column = i + 1 ,value = title)
    
    return active_sheet

def write_2d(active_sheet, data_2d, st_row, st_col):
    for x, col in enumerate(data_2d):
        for y, cell in enumerate(col):
            active_sheet.cell(row=st_row + y,\
                              column=st_col + x,\
                              value=cell)
