from django.contrib import admin

# Register your models here.
from .models import UserImage
from .models import Watermark

admin.site.register(UserImage)
admin.site.register(Watermark)