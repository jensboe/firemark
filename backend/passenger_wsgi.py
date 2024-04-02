## Change this & application specific code below
APP_SPECIFIC_VENV = "firemark"
PYTHON_VERSION = "python3.12"
MINICONDA_ROOT = "/miniconda3"
"""
Miniconda3 installer doesn't work always.
Miniconda3-4.5.11-Linux-x86_64.sh is a working version

os.environ["HOME"] is the path which the normal ssh user sees as "~/".
But Pessenger isn't the user. Therefor "/" becomes "/var/www/vhosts/hosting*user*.*server*.netcup.net/"

Create your app specific conda venv with 'conda create --name APP_SPECIFIC_VENV python=X'. X Specifies the python version

This file in a recursive way.
'Some' interpreter will call this file.
If it doesnt match our defined interpreter it will call the defined interpreter.
If it match the defined interpreter it will run the normal application code.
"""

import sys, os
INTERP = os.environ["HOME"]+MINICONDA_ROOT+"/envs/"+APP_SPECIFIC_VENV+"/bin/"+PYTHON_VERSION

if sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)

"""
application specific code starts here
"""

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'firemark.deploysettings')
application = get_wsgi_application()