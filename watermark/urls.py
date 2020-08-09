from django.urls import path

from . import views

urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('update/<int:pk>', views.ImageUpdateView.as_view(), name='update'),
    path('create', views.ImageCreateView.as_view(), name='create'),
    path('delete/<int:pk>', views.ImageDeleteView.as_view(), name='delete'),
    path('img/<int:image_id>', views.highres,{'marked': '0'}, name='img'),
    path('img/<int:image_id>/<int:marked>', views.highres, name='img'),
]