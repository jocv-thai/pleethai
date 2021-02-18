from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from django.conf import settings
from django.conf.urls import url
from django.contrib import messages
from django.shortcuts import redirect
from pleethai.models import Word, SysWordJapanese, SysWordConnector, WordClass, Example, Constituent, Tag, TaggedItem
from pleethai.common import Common
from taggit.utils import _parse_tags
from django.db import models

class WordResource(resources.ModelResource):

    class Meta:
        model = Word

class WordClassResource(resources.ModelResource):

    class Meta:
        model = WordClass

class ExampleResource(resources.ModelResource):

    class Meta:
        model = Example

class ConstituentResource(resources.ModelResource):

    class Meta:
        model = Constituent

class TagResource(resources.ModelResource):

    class Meta:
        model = Tag

class WordAdmin(ImportExportModelAdmin):
    resource_class = WordResource
    # Add "UPDATE SYS_WORD TABLES" button
    change_list_template = "admin/pleethai/Word/change_list.html"

    # URL for update system tables
    def get_urls(self):
        urls = super().get_urls()
        my_urls = [
            url(r'^updatesystables/$', self.admin_site.admin_view(self.update_system_tables)),
            url(r'^appendsystables/$', self.admin_site.admin_view(self.append_system_tables)),
        ]
        return my_urls + urls

    # Condition of search
    def exist_japanese(self, word1, word2) -> bool:
        return word1.japanese == word2.japanese and word1.hiragana == word2.hiragana

    def delete_all(self, model: models.Model):
        while model.objects.count():
            ids = model.objects.values_list('pk', flat=True)[:100]
            model.objects.filter(pk__in = ids).delete()
            
    # Create SysWordJapanse table and SysWordConnector table from Word table
    def update_system_tables(self, request):
        all_words = Word.objects.all()
        sys_japanese = []
        sys_word_con = []
        temp_constituent = []
        try:
            for word in all_words:
                # Add a Word record (japanese & hiragana unique) to SysWordJapanese table
                if not Common.contains(sys_japanese, word, self.exist_japanese):
                    sys_japanese.append(SysWordJapanese.create(word))
                # Add a Word record to SysWordConnector table
                tempConnect = SysWordConnector.create(word, sys_japanese)
                if tempConnect != None:
                    sys_word_con.append(tempConnect)
            # delete and recreate
            for con_dict in Constituent.objects.values():
                temp_constituent.append(Constituent(**con_dict))
            self.delete_all(Constituent)
            self.delete_all(SysWordConnector)
            self.delete_all(SysWordJapanese)
            SysWordJapanese.objects.bulk_create(sys_japanese)
            SysWordConnector.objects.bulk_create(sys_word_con)
            Constituent.objects.bulk_create(temp_constituent)
            self.update_tags()
            messages.info(request, "Succeeded to update system tables")
        except Exception as e:
            messages.error(request, "Failed to update system tables")
            messages.error(request, str(e))
        return redirect(request.META['HTTP_REFERER'])

    # Update tags
    def update_tags(self):
        all_tags = Tag.objects.all().values_list('name', flat=True)
        for word_con in SysWordConnector.objects.all():
            for tag in _parse_tags(Word.objects.filter(id=word_con.id).first().tags):
                # skip the invalid tag
                if tag not in all_tags:
                    continue
                word_con.tags.add(tag)

    # Append SysWordJapanse table and SysWordConnector table
    # (append words number max is defined in settings.py)
    def append_system_tables(self, request):
        all_words = Word.objects.all()
        exist_sys_japs = list(SysWordJapanese.objects.all())
        sys_japanese = []
        exist_word_ids = SysWordConnector.objects.all().values_list("id", flat=True).distinct()
        sys_word_con = []
        all_tags = Tag.objects.all().values_list('name', flat=True)
        try:
            for word in all_words:
                # skip existed word
                if word.id in exist_word_ids:
                    continue

                # check max append
                if len(sys_word_con) >= settings.APPEND_TABLES_MAX_NUM:
                    break

                # Add a Word record (japanese & hiragana unique) to SysWordJapanese table
                if not Common.contains(exist_sys_japs + sys_japanese, word, self.exist_japanese):
                    sys_japanese.append(SysWordJapanese.create(word))
                # Add a Word record to SysWordConnector table
                tempConnect = SysWordConnector.create(word, exist_sys_japs + sys_japanese)
                if tempConnect != None:
                    sys_word_con.append(tempConnect)
                    # create tag
                    for tag in _parse_tags(word.tags):
                        # skip the invalid tag
                        if tag not in all_tags:
                            continue
                        tempConnect.tags.add(tag)
            # append
            SysWordJapanese.objects.bulk_create(sys_japanese)
            SysWordConnector.objects.bulk_create(sys_word_con)

            if len(sys_japanese) == 0 and len(sys_word_con) == 0:
                messages.info(request, "Already all data appended.")
            else:
                messages.info(request, "Succeeded to append {0} system tables(id from {1} to {2})"
                    .format(len(sys_word_con), sys_word_con[0].id, sys_word_con[-1].id))
                messages.info(request, "Not-appended data may remain. Try to 'append system tables' again.")
        except Exception as e:
            messages.error(request, "Failed to append system tables")
            messages.error(request, str(e))
        return redirect(request.META['HTTP_REFERER'])

class WordClassAdmin(ImportExportModelAdmin):
    resource_class = WordClassResource

class ExampleAdmin(ImportExportModelAdmin):
    resource_class = ExampleResource

class ConstituentAdmin(ImportExportModelAdmin):
    resource_class = ConstituentResource

class TaggedItemInline(admin.StackedInline):
    model = TaggedItem
    
class TagAdmin(ImportExportModelAdmin):
    resource_class = TagResource
    inlines = [TaggedItemInline]

admin.site.register(Word, WordAdmin)
admin.site.register(SysWordJapanese)
admin.site.register(SysWordConnector)
admin.site.register(WordClass,WordClassAdmin)
admin.site.register(Example, ExampleAdmin)
admin.site.register(Constituent, ConstituentAdmin)
admin.site.register(Tag, TagAdmin)
admin.site.register(TaggedItem)

