from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from .models import MarkImage
from django.urls import reverse, reverse_lazy
from django.views.generic import CreateView, ListView, UpdateView, DeleteView
from django.conf import settings
from PIL import Image
from PIL.ImageStat import Stat
import os

from .utils import wm_resize, wm_pos

class IndexView(ListView):
    context_object_name = 'imagelist'

    def get_queryset(self):
        return MarkImage.objects.all()

class ImageUpdateView(UpdateView):
    model = MarkImage
    fields = ['hpos_rel', 'vpos_rel']

class ImageCreateView(CreateView):
    model = MarkImage
    fields = ['src', 'hpos_rel', 'vpos_rel',]

class ImageDeleteView(DeleteView):
    model = MarkImage
    success_url = reverse_lazy('index')


def viewImg(request, image_id, marked=True):
    image = get_object_or_404(MarkImage, pk=image_id)
    try:
        if marked:
            #how much area will be watermarked
            wm_proportion = 0.05
            #space to border (proportion: hight of wm)
            wm_border = .25
            cachename = f"{settings.MEDIA_ROOT}wm\\cache\\{image.id}-{image.hpos_rel}-{image.vpos_rel}-{wm_proportion}-{wm_border}.jpg"
            if not os.path.exists(cachename):
                with Image.open(settings.MEDIA_ROOT + image.src.name) as org:
                    with Image.open(settings.MEDIA_ROOT + 'wm/wm/feuerwehr_blau.png') as wm:


                        wm = wm_resize(org, wm, wm_proportion)
                        target_pos = wm_pos(org, wm, wm_border, float(image.hpos_rel/100), float(image.vpos_rel/100)) 

                        #create new image with alpha channel (transparent)
                        result = Image.new('RGBA', org.size)
                        result.paste(org)

                        result.paste(wm, target_pos, mask=wm)
                        # result.show()
                        #convert to image without alpha channel ()
                        result = result.convert("RGB")
                        result.save(cachename)
                        
            with open(cachename, "rb") as f:
                return HttpResponse(f.read(), content_type="image/jpeg")
        else:
            with open(settings.MEDIA_ROOT + image.src.name, "rb") as org:
                return HttpResponse(org.read(), content_type="image/jpeg")     
    except IOError:
        red = Image.new('RGB', (1, 1), (255,0,0,0))
        response = HttpResponse(content_type="image/jpeg")
        red.save(response, "JPEG")
        return response