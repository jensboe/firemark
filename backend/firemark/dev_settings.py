from .base_settings import *


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'lgdog1ygpzbsw0^c5cjqelmoh0trmmp@ssrt-(z+g_1r9u0h9%'

ALLOWED_HOSTS = [
    '127.0.0.1',
    'localhost',
]
Debug = True

SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_HSTS_PRELOAD = False