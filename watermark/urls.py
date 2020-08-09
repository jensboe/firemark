from django.urls import path

from . import views

urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('edit/<int:pk>', views.ImageUpdateView.as_view(), name='edit'),
    path('img/<int:image_id>', views.highres,{'marked': '0'}, name='img'),
    path('img/<int:image_id>/<int:marked>', views.highres, name='img'),
]