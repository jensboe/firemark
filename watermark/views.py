from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from .models import MarkImage
from django.urls import reverse
from django.views.generic import CreateView, ListView, UpdateView
from django.conf import settings
from PIL import Image
from PIL.ImageStat import Stat

class IndexView(ListView):
    context_object_name = 'imagelist'

    def get_queryset(self):
        return MarkImage.objects.all()

class ImageUpdateView(UpdateView):
    model = MarkImage
    fields = ['hpos_rel', 'vpos_rel']


def highres(request, image_id, marked=True):
    image = get_object_or_404(MarkImage, pk=image_id)
    try:
        with open(settings.MEDIA_ROOT + image.src.name, "rb") as f:
            return HttpResponse(f.read(), content_type="image/jpeg")
    except IOError:
        red = Image.new('RGB', (1, 1), (255,0,0,0))
        response = HttpResponse(content_type="image/jpeg")
        red.save(response, "JPEG")
        return response
def update(request, image_id):
    
    markimage = get_object_or_404(MarkImage, pk=image_id)
    return HttpResponseRedirect(reverse('index'))