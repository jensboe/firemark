from django.db import models

# Create your models here.
class UserImage(models.Model):
    image = models.ImageField(upload_to='wm/org')
    vpos_rel = models.DecimalField(decimal_places=0, max_digits=3)
    hpos_rel = models.DecimalField(decimal_places=0, max_digits=3)
class Watermark(models.Model):
    originalimage = models.ImageField(upload_to='wm/wm')
