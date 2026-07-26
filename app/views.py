from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import *
from .serializers import ArtistaSerializer, FotoArtistaSerializer, OrganizadorSerializer, VideoArtistaSerializer


class ArtistaViewSet(viewsets.ModelViewSet):
    queryset = Artista.objects.all()
    serializer_class = ArtistaSerializer
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        artista = serializer.save()

        # Guardar fotos
        fotos = request.FILES.getlist('fotos')
        for i, foto in enumerate(fotos):
            FotoArtista.objects.create(artista=artista, foto=foto, orden=i + 1)

        # Guardar videos
        videos = request.FILES.getlist('videos')
        for video in videos:
            titulo = request.data.get('titulo_video', '')
            VideoArtista.objects.create(artista=artista, video=video, titulo=titulo)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FotoArtistaViewSet(viewsets.ModelViewSet):
    queryset = FotoArtista.objects.all()
    serializer_class = FotoArtistaSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        artista_id = self.kwargs.get('artista_pk')
        if artista_id:
            return FotoArtista.objects.filter(artista_id=artista_id)
        return super().get_queryset()


class VideoArtistaViewSet(viewsets.ModelViewSet):
    queryset = VideoArtista.objects.all()
    serializer_class = VideoArtistaSerializer
    parser_classes = [MultiPartParser, FormParser]

class OrganizadorViewSet(viewsets.ModelViewSet):
    queryset = Organizador.objects.all()
    serializer_class = OrganizadorSerializer
    parser_classes = [MultiPartParser, FormParser]    