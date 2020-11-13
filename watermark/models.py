from django.db import models
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
import os

# Create your models here.

class Watermark(models.Model):
    src = models.ImageField(upload_to='wm/wm')
    name = models.CharField(max_length=40)

    def __str__(self):
        return self.name

class MarkImage(models.Model):

    class VerticalAlign(models.TextChoices):
        TOP = 'TP', _('top')
        CENTER = 'CT', _('center')
        BOTTOM = 'BT', _('bottom')
        
    class HorizontalAlign(models.TextChoices):
        LEFT = 'LF', _('left')
        CENTER = 'CT', _('center')
        RIGHT = 'RT', _('right')

    src = models.ImageField(
        upload_to = 'wm/org',
        verbose_name = _('Image'),
        help_text = _('Select image what should be watermarked.')
    )
    created = models.DateTimeField(
        auto_now_add = True,
        verbose_name = _('creation time')
    )
    modified = models.DateTimeField(
        auto_now = True,
        verbose_name = _('modification time')
    )
    proportion = models.DecimalField(
        decimal_places = 0,
        max_digits = 3,
        default = 5,
        verbose_name=_('proportion'),
        help_text=_('Change propotion between image and watermark. Default is 5.')
    )
    border = models.DecimalField(
        decimal_places = 0,
        max_digits = 3,
        default = 25,
        verbose_name = _('border'),
        help_text = _('Border in the image. Default is 25.')
    )

    valign = models.CharField(
        max_length = 2,
        choices = VerticalAlign.choices,
        default = VerticalAlign.TOP,
        verbose_name = _('vertical alignment'),
        help_text = _('position of the watermark')
    )

    halign = models.CharField(
        max_length = 2,
        choices = HorizontalAlign.choices,
        default = HorizontalAlign.LEFT,
        verbose_name = _('horizontal alignment'),
        help_text = _('position of the watermark')
    )

    wm = models.ForeignKey(
        Watermark,
        on_delete = models.RESTRICT,
        verbose_name = _('watermark'),
        help_text = _('Embedded watermark inside the image.')
    )

    def __str__(self):
        return os.path.basename(self.src.name)

    def get_absolute_url(self):
        return reverse("index")

