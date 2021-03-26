from .settings import *
import django_heroku
import os

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

EMAIL_BACKEND = 'gmailapi_backend.mail.GmailBackend'
GMAIL_API_CLIENT_ID = os.environ['GMAIL_API_CLIENT_ID']
GMAIL_API_CLIENT_SECRET = os.environ['GMAIL_API_CLIENT_SECRET']
GMAIL_API_REFRESH_TOKEN = os.environ['GMAIL_API_REFRESH_TOKEN']

REQUEST_MAIL_SEND_INFO = {
    'subject': 'GaifaaYeepun Request Mail',
    'templete_path': 'mails/request.txt',
    'from_email': 'pleethai.jv@gmail.com',
    'recipient_list': [
        'pleethai.jv@gmail.com',
    ],
}

### Heroku Setting
# Activate Django-Heroku.
django_heroku.settings(locals())
