from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArtistaViewSet, FotoArtistaViewSet, OrganizadorViewSet, VideoArtistaViewSet

router = DefaultRouter()
router.register(r'artistas', ArtistaViewSet)
router.register(r'fotos', FotoArtistaViewSet)
router.register(r'videos', VideoArtistaViewSet)
router.register(r'organizadores', OrganizadorViewSet)

urlpatterns = [
    path('', include(router.urls)),

]

