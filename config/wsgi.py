import os

from dj_static import Cling #文を新しく記述する
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

application = Cling(get_wsgi_application()) #文を変更する