'''
This script uses data from the Japanese column of Word Excel to input searches column.
Specify an excel file to be read as a command line argument.

python batch_get_searches.py <file_path>
'''
import sys, os, re, openpyxl
from scraper import scraper

# constant
SEARCHES_COLUMN = 'J'
JAPANESE_COLUMN = 'B'
WORD_SHEET_INDEX = 0

# main
# check command line argument
try:
    if len(sys.argv) < 2:
        print("please set commandLine argument")
        raise Exception

    file_name=sys.argv[1]
    if ".xlsx" not in file_name and ".xls" not in file_name:
        print("please set excel file")
        raise Exception
    elif not os.path.exists(file_name):
        print("{} dosen't exists.".format(file_name))
        raise Exception
except:
    sys.exit()

# open workbook
wb = openpyxl.load_workbook(file_name)
# get first worksheet
ws = wb.get_sheet_by_name(wb.get_sheet_names()[WORD_SHEET_INDEX])
# get tuple column "searches"
cl_s = ws[SEARCHES_COLUMN]
# make variable for cell of "japanese"
cl_j = ws[JAPANESE_COLUMN]
# setting for scraper
scrapings = [{'search_tag': 'div','attrs': {'id': 'resultStats'}}]

for i in range(2, len(cl_j)+1):
    # get value of cell "searches"
    vl_cl_s = cl_s[i-1].value
    # get value of cell "japanese"
    vl_cl_j = cl_j[i-1].value
    # if searches value is None, try to get searches 
    if vl_cl_s == None:
        params={'q': "allinetext:" + vl_cl_j, \
        'oe': 'utf-8', \
        'hl': 'ja' }
        ws[SEARCHES_COLUMN + str(i)] = int(re.findall(r'([0-9,]+)',scraper(params, scrapings)[0])[0].replace(",",""))

# save workbook
wb.save(file_name)
wb.close()
