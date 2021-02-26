from .settings import *
import django_heroku

SECRET_KEY = 'yftgrj&zt8=06mv7(hhum(fjceo2f$3$*xlo7m2gsq&fh92zrf'
#DEBUG = False

# Google Analytics ID
GAID='UA-147976194-1'

# About Page URL
ABOUT_URL_MAP = {
    'ja' : 'https://jocv-thai.github.io/pleethai/ja/',
    'en' : 'https://jocv-thai.github.io/pleethai/en/',
    'th' : 'https://jocv-thai.github.io/pleethai/th/',
}

### Heroku Setting
# Activate Django-Heroku.
django_heroku.settings(locals())
