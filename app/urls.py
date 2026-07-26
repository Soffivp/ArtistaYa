<<<<<<< HEAD
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

=======
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

>>>>>>> 313a0a2b38e17b1e8ddb32824152a2795d87b069
