from django.contrib import admin

# Register your models here.
from .models import MarkImage
from .models import Watermark

admin.site.register(MarkImage)
admin.site.register(Watermark)