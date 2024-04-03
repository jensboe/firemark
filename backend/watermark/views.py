from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from .models import MarkImage
from django.urls import reverse_lazy
from django.views.generic import CreateView, ListView, UpdateView, DeleteView
from django.conf import settings
from PIL import Image, ImageOps
import os

from .utils import wm_resize, wm_pos

class IndexView(ListView):
    context_object_name = 'imagelist'
    model = MarkImage
    paginate_by = 9
    ordering = ['-upload_time']

class ImageUpdateView(UpdateView):
    model = MarkImage
    fields = ['wm', 'valign', 'halign', 'border', 'proportion']

class ImageCreateView(CreateView):
    model = MarkImage
    fields = ['src', 'wm', 'valign', 'halign', 'border', 'proportion']

class ImageDeleteView(DeleteView):
    model = MarkImage
    success_url = reverse_lazy('index')


def viewImg(request, image_id, marked=True):
    image = get_object_or_404(MarkImage, pk=image_id)
    if not os.path.exists(f"{settings.MEDIA_ROOT}wm\\cache\\"):
        os.mkdir(f"{settings.MEDIA_ROOT}wm\\cache\\")
    try:
        if marked:
            cachename = f"{settings.MEDIA_ROOT}wm\\cache\\{image.id}-{image.wm.id}-{image.halign}-{image.valign}-{image.proportion}-{image.border}.jpg"
            if not os.path.exists(cachename):
                with Image.open(settings.MEDIA_ROOT + image.src.name) as original_image:

                    # Apply EXIF rotation
                    original_image = ImageOps.exif_transpose(original_image)

                    with Image.open(settings.MEDIA_ROOT + image.wm.src.name) as watermark_image:
                        watermark_image = wm_resize(original_image, watermark_image, float(image.proportion/100))
                        hpos_rel = 0
                        if image.halign in MarkImage.HorizontalAlign.LEFT:
                            hpos_rel = 0
                        if image.halign in MarkImage.HorizontalAlign.CENTER:
                            hpos_rel = 50
                        if image.halign in MarkImage.HorizontalAlign.RIGHT:
                            hpos_rel = 100
                        vpos_rel = 0
                        if image.valign in MarkImage.VerticalAlign.TOP:
                            vpos_rel = 0
                        if image.valign in MarkImage.VerticalAlign.CENTER:
                            vpos_rel = 50
                        if image.valign in MarkImage.VerticalAlign.BOTTOM:
                            vpos_rel = 100
                        target_pos = wm_pos(original_image, watermark_image, float(image.border/100), float(hpos_rel/100), float(vpos_rel/100)) 

                        # create new image with alpha channel (transparent)
                        result_image = Image.new('RGBA', original_image.size)
                        # insert original in result
                        result_image.paste(original_image)

                        # insert watermark image in result
                        result_image.paste(watermark_image, target_pos, mask=watermark_image)
                        
                        # Remove the Alpha channel
                        result_image = result_image.convert("RGB")
                        result_image.save(cachename)
                        
            with open(cachename, "rb") as f:
                return HttpResponse(f.read(), content_type="image/jpeg")
        else:
            with open(settings.MEDIA_ROOT + image.src.name, "rb") as original_image:
                return HttpResponse(original_image.read(), content_type="image/jpeg")     
    except IOError:
        red = Image.new('RGB', (1, 1), (255,0,0,0))
        response = HttpResponse(content_type="image/jpeg")
        red.save(response, "JPEG")
        return response