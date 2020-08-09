from django.db import models
from django.urls import reverse
import os

# Create your models here.
class MarkImage(models.Model):
    src = models.ImageField(upload_to='wm/org')
    vpos_rel = models.DecimalField(decimal_places=0, max_digits=3)
    hpos_rel = models.DecimalField(decimal_places=0, max_digits=3)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return os.path.basename(self.src.name)
    def get_absolute_url(self):
        return reverse("index")

class Watermark(models.Model):
    originalimage = models.ImageField(upload_to='wm/wm')

