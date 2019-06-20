'''
This script integrates the original data of DB of multiple files 
and converts it into a format that can be registered in DB.

python batch_get_searches.py <file_path1> <file_path2> <file_path3>...
'''
import sys, os, openpyxl, datetime
from batch_common import *
from batch_common_constant import *
from datetime import datetime as dt

# define function
def get_all_col_tuple(sheet = WORK_SHEET_NAME, col = JP_COL):
    '''returns tuple data which get from all excel file

    :param sheet: read worksheet name
    :param col: target column(default "jananese")
    :rtype tuple
    '''
    cell=()
    for file_name in sys.argv[1:]:
        # get tuple from column (except subtitle)
        cell += get_col_tuple(file_name, sheet, col)[1:]

    return cell

def get_tp_thai(before, after):
    # TODO delete this condition
    if after == None:
        return before
    # if after data is "ok", return before data
    elif after.lower() == "ok":
        return before
    # if there is after data, return it.
    return after

# main
# check command line argument
try:
    if len(sys.argv) < 2:
        print("please set commandLine argument")
        raise Exception

    for file_name in sys.argv[1:]:
        if ".xlsx" not in file_name and ".xls" not in file_name:
            print("please set excel file")
            raise Exception
        elif not os.path.exists(file_name):
            print("{} dosen't exists.".format(file_name))
            raise Exception
except:
    sys.exit()

# make DB data from cell value
jp = tuple(cell.value for cell in get_all_col_tuple())
id = tuple(i for i in range(ST_ID, len(jp) + ST_ID))
hira = tuple(cell.value for cell in get_all_col_tuple(col= HIRA_COL))
roman = tuple(conv_hiragana_to_roman(val) for val in hira)
eng = tuple(cell.value for cell in get_all_col_tuple(col= EN_COL))
# thai column
thai_bef = tuple(cell.value for cell in get_all_col_tuple(col= TH_BEF_COL))
thai_aft = tuple(cell.value for cell in get_all_col_tuple(col= TH_AFT_COL))
thai = tuple(get_tp_thai(x,y) for x,y in zip(thai_bef, thai_aft))
# TODO 
pronunciation_kana = ()
pronunciation_symbol = ()
# searches column
scrapings_searches = [{'search_tag': 'div','attrs': {'id': 'resultStats'}}]
searches = tuple(int(re.findall(r'([0-9,]+)',\
    scraper({'q': "allinetext:" + val, 'oe': 'utf-8', 'hl': 'ja'}, scrapings_searches)[0])[0].replace(",",""))\
         for val in jp)
# wordclass_id column
part_of_speech = tuple(get_part_of_speech(val) for val in jp)
wordclass_id = tuple(WORD_CLASS.get(x) for x in part_of_speech)

# order column
order = [1 for val in jp]
# scan for duplicate Japanese data
for val in jp:
    # if the same Japanese data exists in the tuple
    if jp.count(val) != 1:
        # list of duplicate Japanese data index
        id_mul = [i for i,x in enumerate(jp) if x == val]
        # update if the second and duplicate data is 1
        for i, x in enumerate(id_mul[1:]):
            # The first duplicate data is omitted and enumerate is executed, 
            # so the index of second duplicate data is treated as 0.
            if(order[x] == 1):
                order[x] = i + 2

# make new workbook
wb = openpyxl.Workbook()
# activate worksheet
ws = wb.active

# make 2Ddata for DB
write_data_2d = (id, jp, hira, roman, thai, pronunciation_symbol, pronunciation_kana,\
                 order, eng, searches ,wordclass_id)
subtitles = ("id", "japanese", "hiragana", "roman","thai", "pronunciation_symbol",\
             "pronunciation_kana", "order","english", "searchs", "wordclass_id")
# write data for cell of active worksheet
write_2d(write_subtitle(ws, subtitles), write_data_2d, st_row = 2, st_col = 1)

# save as new excel file
datetime = dt.now().strftime('%Y%m%d')
wb.save(NAME_TABLE + '_' + datetime + '.xlsx')
wb.close()
