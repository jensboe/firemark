from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from .models import MarkImage
from django.views.generic import CreateView, ListView
from django.conf import settings
from PIL import Image
from PIL.ImageStat import Stat

class IndexView(ListView):
    template_name = 'watermark/index.html'
    context_object_name = 'imagelist'

    def get_queryset(self):
        return MarkImage.objects.all()

def edit(request, image_id):
    return HttpResponse("You're looking at image %s." % image_id)

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
