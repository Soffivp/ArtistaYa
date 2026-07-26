from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import UserDetailsSerializer
from rest_framework import serializers
from .models import *
import os


class FotoArtistaSerializer(serializers.ModelSerializer):
    class Meta:
        model = FotoArtista
        fields = ['id', 'foto', 'orden', 'subido_en']

    def validate_foto(self, foto):
        max_size = 10 * 1024 * 1024
        if foto.size > max_size:
            raise serializers.ValidationError('Cada foto no puede superar los 10MB.')
        ext = os.path.splitext(foto.name)[1].lower()
        if ext not in ['.png', '.jpg', '.jpeg']:
            raise serializers.ValidationError('Solo se permiten imágenes JPG o PNG.')
        return foto


class VideoArtistaSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoArtista
        fields = ['id', 'video', 'titulo', 'subido_en']

    def validate_video(self, video):
        max_size = 500 * 1024 * 1024
        if video.size > max_size:
            raise serializers.ValidationError('El video no puede superar los 500MB.')
        ext = os.path.splitext(video.name)[1].lower()
        if ext not in ['.mp4', '.mov']:
            raise serializers.ValidationError('Solo se permiten videos MP4 o MOV.')
        return video


class ArtistaSerializer(serializers.ModelSerializer):
    fotos = FotoArtistaSerializer(many=True, read_only=True)
    videos = VideoArtistaSerializer(many=True, read_only=True)
    total_fotos = serializers.SerializerMethodField()
    disciplina_display = serializers.CharField(source='get_disciplina_display', read_only=True)

    class Meta:
        model = Artista
        fields = [
            'id', 'nombre_artistico', 'numero_telefono', 'ciudad',
            'descripcion_profesional', 'documento_identidad', 'foto_perfil',
            'disciplina', 'disciplina_display', 'anios_experiencia',
            'tarifa_por_hora', 'tarifa_por_evento', 'incluye_traslado',
            'fotos', 'videos', 'total_fotos', 'creado_en', 'actualizado_en'
        ]

    def get_total_fotos(self, obj):
        return obj.fotos.count()

    def validate_documento_identidad(self, archivo):
        max_size = 5 * 1024 * 1024
        if archivo.size > max_size:
            raise serializers.ValidationError('El documento no puede superar los 5MB.')
        ext = os.path.splitext(archivo.name)[1].lower()
        if ext not in ['.png', '.jpg', '.jpeg', '.pdf']:
            raise serializers.ValidationError('Solo se permiten PNG, JPG o PDF.')
        return archivo

    def validate_foto_perfil(self, foto):
        max_size = 5 * 1024 * 1024
        if foto.size > max_size:
            raise serializers.ValidationError('La foto de perfil no puede superar los 5MB.')
        ext = os.path.splitext(foto.name)[1].lower()
        if ext not in ['.png', '.jpg', '.jpeg']:
            raise serializers.ValidationError('Solo se permiten PNG o JPG.')
        return foto

    def validate(self, data):
        # Validar mínimo 1 foto al crear
        request = self.context.get('request')
        if request and request.method == 'POST':
            fotos = request.FILES.getlist('fotos')
            if len(fotos) < 1:
                raise serializers.ValidationError({'fotos': 'Debes subir al menos 1 foto.'})
            if len(fotos) > 10:
                raise serializers.ValidationError({'fotos': 'No puedes subir más de 10 fotos.'})
        return data
    

class OrganizadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organizador
        fields = [
            'id', 'telefono', 'profesion_o_empresa',
            'descripcion_breve', 'documento_identidad',
            'foto_perfil', 'creado_en', 'actualizado_en'
        ]

    def validate_descripcion_breve(self, valor):
        if len(valor) > 500:
            raise serializers.ValidationError('La descripción no puede superar los 500 caracteres.')
        return valor

    def validate_documento_identidad(self, archivo):
        max_size = 5 * 1024 * 1024
        if archivo.size > max_size:
            raise serializers.ValidationError('El documento no puede superar los 5MB.')
        ext = os.path.splitext(archivo.name)[1].lower()
        if ext not in ['.png', '.jpg', '.jpeg', '.pdf']:
            raise serializers.ValidationError('Solo se permiten PNG, JPG o PDF.')
        return archivo

    def validate_foto_perfil(self, foto):
        max_size = 5 * 1024 * 1024
        if foto.size > max_size:
            raise serializers.ValidationError('La foto no puede superar los 5MB.')
        ext = os.path.splitext(foto.name)[1].lower()
        if ext not in ['.png', '.jpg', '.jpeg']:
            raise serializers.ValidationError('Solo se permiten PNG o JPG.')
        return foto

    class RegistroSerializer(RegisterSerializer):
        username = None  # desactiva el campo username

        def get_cleaned_data(self):
            return {
                'email': self.validated_data.get('email', ''),
                'password1': self.validated_data.get('password1', ''),
        }

    class CustomUserDetailsSerializer(UserDetailsSerializer):
        class Meta(UserDetailsSerializer.Meta):
            model = Usuario
            fields = ("pk", "email", "rol")