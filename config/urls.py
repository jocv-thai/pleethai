"""config URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from pleethai import views_dictionary, views_request

urlpatterns = [
    path('admin/', admin.site.urls),
    path('i18n/', include('django.conf.urls.i18n')),
    path('', views_dictionary.SearchView.as_view(), name='search'),
    path('word/<int:pk>/', views_dictionary.WordDetailView.as_view(), name='word_detail'),
    path('word/<int:pk>/quiz_jap_read', views_dictionary.WordDetailQuizJapReadView.as_view(), name='word_detail_quiz_jap_read'),
    path('word/<int:pk>/quiz_jap_write', views_dictionary.WordDetailQuizJapWriteView.as_view(), name='word_detail_quiz_jap_write'),
    path('example/<int:pk>/', views_dictionary.ExampleDetailView.as_view(), name='example_detail'),
    path('example/<int:pk>/quiz_jap_read', views_dictionary.ExampleDetailQuizJapReadView.as_view(), name='example_detail_quiz_jap_read'),
    path('example/<int:pk>/quiz_jap_write', views_dictionary.ExampleDetailQuizJapWriteView.as_view(), name='example_detail_quiz_jap_write'),
    path('searchword', views_dictionary.search_word, name='search_word'),
    path('searchexample', views_dictionary.search_example, name='search_example'),
    path('tags', views_dictionary.tags_all, name='tags'),
    path('gen/<slug:template>/', views_dictionary.general_window, name='gen'),
    path('gen/<slug:template>/<slug:param>/', views_dictionary.general_window, name='gen'),
    path('mail/input/', views_request.MailInput.as_view(), name='mail_input'),
    path('mail/confirm/', views_request.MailConfirm.as_view(), name='mail_confirm'),
    path('mail/complete/', views_request.MailComplete.as_view(), name='mail_complete'),
]