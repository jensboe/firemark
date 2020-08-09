from django.db import models
from django.urls import reverse
import os

# Create your models here.

class Watermark(models.Model):
    src = models.ImageField(upload_to='wm/wm')
    name = models.CharField(max_length=40)

    def __str__(self):
        return self.name

class MarkImage(models.Model):
    src = models.ImageField(upload_to='wm/org')
    vpos_rel = models.DecimalField(decimal_places=0, max_digits=3)
    hpos_rel = models.DecimalField(decimal_places=0, max_digits=3)
    created = models.DateTimeField(auto_now_add=True, )
    modified = models.DateTimeField(auto_now=True)
    proportion = models.DecimalField(decimal_places=0, max_digits=3, default=5)
    border = models.DecimalField(decimal_places=0, max_digits=3, default=25)

    wm = models.ForeignKey(Watermark, on_delete=models.CASCADE)

    def __str__(self):
        return os.path.basename(self.src.name)

    def get_absolute_url(self):
        return reverse("index")

