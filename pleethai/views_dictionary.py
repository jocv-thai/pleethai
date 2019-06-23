from django.shortcuts import render
from pleethai.models import SysWordJapanese, SysWordThai, Example
from django.views import generic
from django.template.loader import render_to_string
from django.http import HttpResponse
from django.db.models import Q

PAGENATE_BY = 20

class SearchView(generic.ListView):
    model = SysWordJapanese
    template_name = "search.html"

#Search Word
def search_word(request):
    # Get page number
    page = int(request.GET.get("page"))
    if page < 1:
        return
    offset = (page -1) * PAGENATE_BY
    limit = page * PAGENATE_BY
    # Get keyword
    keyword = request.GET.get("keyword")
    if keyword:
        # Search and get japanese id list
        id_list = SysWordThai.objects.filter( \
            Q(japanese_id__japanese__icontains=keyword) | \
            Q(japanese_id__hiragana__icontains=keyword) | \
            Q(japanese_id__roman__icontains=keyword) | \
            Q(thai__icontains=keyword) | \
            Q(pronunciation_kana__icontains=keyword) | \
            Q(english__icontains=keyword) \
        ).select_related('japanese_id').values_list("japanese_id", flat=True).distinct()
        # Get japanese list
        result_list = SysWordJapanese.objects.filter(id__in=id_list) \
            .select_related('wordclass_id').order_by("-searchs")[offset:limit]
    else:
        # Get japanese list
        result_list = SysWordJapanese.objects.all() \
            .select_related('wordclass_id').order_by("-searchs")[offset:limit]
    # Return html
    htmlstr = ""
    for wordobj in result_list:
        htmlstr += render_to_string('parts/word_item.html', { 'object': wordobj })
    return HttpResponse(htmlstr)

#Search Example
def search_example(request):
    # Get page number
    page = int(request.GET.get("page"))
    if page < 1:
        return
    offset = (page -1) * PAGENATE_BY
    limit = page * PAGENATE_BY
    # Get keyword
    keyword = request.GET.get("keyword")
    if keyword:
        # Get japanese list
        result_list = Example.objects.filter( \
            Q(japanese__icontains=keyword) | \
            Q(hiragana__icontains=keyword) | \
            Q(roman__icontains=keyword) | \
            Q(thai__icontains=keyword) | \
            Q(pronunciation_kana__icontains=keyword) | \
            Q(english__icontains=keyword) \
        ).order_by("id")[offset:limit]
    else:
        # Get japanese list
        result_list = Example.objects.all().order_by("id")[offset:limit]
    # Return html
    htmlstr = ""
    for exampleobj in result_list:
        htmlstr += render_to_string('parts/example_item.html', { 'object': exampleobj })
    return HttpResponse(htmlstr)

class WordDetailView(generic.DetailView):
    model = SysWordJapanese
    template_name = "word_detail.html"

class ExampleDetailView(generic.DetailView):
    model = Example
    template_name = "example_detail.html"
    
