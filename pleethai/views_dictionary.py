from django.shortcuts import render
from django.views import generic
from django.template.loader import render_to_string
from django.http import HttpResponse
from django.db.models import Q, Count
from pleethai.models import SysWordJapanese, SysWordConnector, Example, Constituent, Tag

PAGENATE_BY = 20
TAG_CATEGORIZED_BY = 100

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

    # Get keyword and tags from request
    keyword = request.GET.get("keyword").strip()
    tags = request.GET.get("tags")

    # Create filter object
    filter_obj = Q()
    if keyword:
        # Search and get japanese id list from SysWordConnector
        id_list = SysWordConnector.objects.filter( \
            Q(japanese_id__japanese__icontains=keyword) | \
            Q(japanese_id__hiragana__icontains=keyword) | \
            Q(japanese_id__roman__icontains=keyword) | \
            Q(word_id__thai__icontains=keyword) | \
            Q(word_id__pronunciation_kana__icontains=keyword) | \
            Q(word_id__english__icontains=keyword) \
            ).select_related('word_id').select_related('japanese_id').values_list("japanese_id", flat=True).distinct()
        filter_obj.add(Q(id__in=id_list), Q.AND)

    if tags:
        id_list = SysWordConnector.objects.filter( \
            Q(tags__id__in=tags.split('+')) \
            ).values_list("japanese_id", flat=True).distinct()
        filter_obj.add(Q(id__in=id_list), Q.AND)

    # Get word list
    result_list = SysWordJapanese.objects.filter(filter_obj).distinct() \
        .select_related('wordclass_id').order_by("-search")[offset:limit]

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

    # Get keyword and tags from request
    keyword = request.GET.get("keyword").strip()
    tags = request.GET.get("tags")

    # Create filter object
    filter_obj = Q()
    if keyword:
        filter_obj.add(Q(japanese__icontains=keyword), Q.OR)
        filter_obj.add(Q(hiragana__icontains=keyword), Q.OR)
        filter_obj.add(Q(roman__icontains=keyword), Q.OR)
        filter_obj.add(Q(thai__icontains=keyword), Q.OR)
        filter_obj.add(Q(pronunciation_kana__icontains=keyword), Q.OR)
        filter_obj.add(Q(english__icontains=keyword), Q.OR)

    if tags:
        id_list = Constituent.objects.filter(word_id__tags__id__in=tags.split('+')) \
            .select_related('word_id').values_list('example_id', flat= True).distinct()
        filter_obj.add(Q(id__in=id_list), Q.AND)
    
    # Get example list
    result_list = Example.objects.filter(filter_obj).order_by("id")[offset:limit]

    # Return html
    htmlstr = ""
    for exampleobj in result_list:
        htmlstr += render_to_string('parts/example_item.html', { 'object': exampleobj })
    return HttpResponse(htmlstr)

class WordDetailView(generic.DetailView):
    model = SysWordJapanese
    template_name = "word_detail.html"

class WordDetailQuizJapReadView(generic.DetailView):
    model = SysWordJapanese
    template_name = "word_detail_quiz_jap_read.html"

class WordDetailQuizJapWriteView(generic.DetailView):
    model = SysWordJapanese
    template_name = "word_detail_quiz_jap_write.html"

class ExampleDetailView(generic.DetailView):
    model = Example
    template_name = "example_detail.html"

class ExampleDetailQuizJapReadView(generic.DetailView):
    model = Example
    template_name = "example_detail_quiz_jap_read.html"

class ExampleDetailQuizJapWriteView(generic.DetailView):
    model = Example
    template_name = "example_detail_quiz_jap_write.html"

def tags_all(request):
    tags = Tag.objects.all() \
        .annotate(num_times=Count('pleethai_taggeditem_items'))

    # ignore the tags that have no item
    tags = filter(lambda t: t.num_times > 0, tags)
    # create 2-dimensional list ([tag category][tags])
    # both tag category & tags are sorted by id
    tag_cat_map = {}
    for t in tags:
        k = int(t.id/TAG_CATEGORIZED_BY)
        tag_cat_map[k] = tag_cat_map.get(k, [])
        tag_cat_map[k].append(t)
    object_list = list(sorted(tag_cat_map.values(), key=lambda tlist: tlist[0].id))
    return render(request, 'tags.html', {'object_list': object_list})

def general_window(request, template, param=''):
    object_list = {'param': param}
    # if neccessary, do the operation here for each template

    return render(request, template + '.html', {'object_list': object_list})
