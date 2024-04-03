from pathlib import Path

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.urls import reverse_lazy
from django.views.generic import CreateView, DeleteView, ListView, UpdateView
from PIL import Image, ImageOps

from .models import MarkImage
from .utils import wm_pos, wm_resize


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


def view_image(request, image_id, insert_wartermark=True):
    del request
    image = get_object_or_404(MarkImage, pk=image_id)
    media_root: Path = Path(settings.MEDIA_ROOT)
    try:
        if insert_wartermark:
            create_image: bool = True

            cache_dir = media_root / 'wm' / 'cache'
            if not cache_dir.exists():
                cache_dir.mkdir(parents=True)

            marked_image_path = cache_dir / f'{image.id}.jpg'
            if marked_image_path.exists():
                last_modify_file = marked_image_path.stat().st_mtime
                last_modify_db = image.modifiy_time.timestamp()

                if last_modify_file > last_modify_db:
                    create_image = False

            if create_image:
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
                        result_image.save(marked_image_path)

            with open(marked_image_path, "rb") as f:
                return HttpResponse(f.read(), content_type="image/jpeg")
        else:
            with open(settings.MEDIA_ROOT + image.src.name, "rb") as original_image:
                return HttpResponse(original_image.read(), content_type="image/jpeg")
    except IOError:
        red = Image.new('RGB', (1, 1), (255,0,0,0))
        response = HttpResponse(content_type="image/jpeg")
        red.save(response, "JPEG")
        return response
