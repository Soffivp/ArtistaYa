import os
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


# ==================== MANAGER ====================
class UsuarioManager(BaseUserManager):
    def create_user(self, email, nombre, rol, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, nombre=nombre, rol=rol, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nombre, rol='artista', password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, nombre, rol, password, **extra_fields)


# ==================== VALIDADORES REUTILIZABLES ====================
def _validar_tamano(archivo, max_mb):
    if archivo.size > max_mb * 1024 * 1024:
        raise ValidationError(f'El archivo no puede superar los {max_mb}MB.')


def validar_documento(archivo):
    _validar_tamano(archivo, 5)
    ext = os.path.splitext(archivo.name)[1].lower()
    if ext not in ['.png', '.jpg', '.jpeg', '.pdf']:
        raise ValidationError('Solo se permiten PNG, JPG o PDF.')


def validar_foto_perfil(archivo):
    _validar_tamano(archivo, 5)
    ext = os.path.splitext(archivo.name)[1].lower()
    if ext not in ['.png', '.jpg', '.jpeg']:
        raise ValidationError('Solo se permiten PNG o JPG.')


def validar_foto_galeria(archivo):
    _validar_tamano(archivo, 10)
    ext = os.path.splitext(archivo.name)[1].lower()
    if ext not in ['.png', '.jpg', '.jpeg']:
        raise ValidationError('Solo se permiten PNG o JPG.')


def validar_video(archivo):
    _validar_tamano(archivo, 500)
    ext = os.path.splitext(archivo.name)[1].lower()
    if ext not in ['.mp4', '.mov']:
        raise ValidationError('Solo se permiten MP4 o MOV.')


# ==================== USUARIO BASE ====================
class Usuario(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    username = None
    email = models.EmailField(_('email address'), unique=True)
    nombre = models.CharField(max_length=150)
    rol = models.CharField(max_length=20, choices=[
        ('artista', 'Artista'),
        ('organizador', 'Organizador'),
    ])
    email_verificado = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre', 'rol']

    objects = UsuarioManager()

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['rol']),
        ]

    def __str__(self):
        return f"{self.email} ({self.rol})"


# Clase Artista
class Artista(models.Model):
    DISCIPLINAS = [
        ('musica', 'Música'),
        ('danza', 'Danza'),
        ('teatro', 'Teatro'),
        ('magia', 'Magia'),
        ('circo', 'Circo'),
        ('pintura', 'Pintura'),
        ('fotografia', 'Fotografía'),
        ('stand_up', 'Stand Up'),
        ('canto', 'Canto'),
        ('dj', 'DJ'),
        ('otro', 'Otro'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    usuario = models.OneToOneField(
        Usuario, 
        on_delete=models.CASCADE, 
        related_name='perfil_artista'
    )
    
    nombre_artistico = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(max_length=250, unique=True, blank=True)  # Para URLs amigables
    numero_telefono = models.CharField(max_length=20)
    ciudad = models.CharField(max_length=100, db_index=True)
    descripcion_profesional = models.TextField()
    
    documento_identidad = models.FileField(
        upload_to='artistas/documentos/', 
        validators=[validar_documento]
    )
    foto_perfil = models.ImageField(
        upload_to='artistas/perfiles/', 
        validators=[validar_foto_perfil]
    )
    
    disciplina = models.CharField(max_length=50, choices= DISCIPLINAS, db_index=True)  # (mantén tus choices)
    anios_experiencia = models.PositiveIntegerField()
    
    tarifa_por_hora = models.DecimalField(max_digits=10, decimal_places=2)
    tarifa_por_evento = models.DecimalField(max_digits=10, decimal_places=2)
    incluye_traslado = models.BooleanField(default=False)

    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Artista"
        verbose_name_plural = "Artistas"
        indexes = [
            models.Index(fields=['ciudad', 'disciplina']),
            models.Index(fields=['nombre_artistico']),
        ]

    def __str__(self):
        return self.nombre_artistico


# ==================== GALERÍA Y VIDEOS ====================
class FotoArtista(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    artista = models.ForeignKey(
        Artista, 
        on_delete=models.CASCADE, 
        related_name='fotos'
    )
    foto = models.ImageField(upload_to='artistas/fotos/', validators=[validar_foto_galeria])
    orden = models.PositiveIntegerField(default=0)
    subido_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['orden']
        indexes = [models.Index(fields=['artista', 'orden'])]


class VideoArtista(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    artista = models.ForeignKey(
        Artista, 
        on_delete=models.CASCADE, 
        related_name='videos'
    )
    video = models.FileField(upload_to='artistas/videos/', validators=[validar_video])
    titulo = models.CharField(max_length=200, blank=True)
    subido_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=['artista'])]


# clase Organizador
class Organizador(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    usuario = models.OneToOneField(
        Usuario, 
        on_delete=models.CASCADE, 
        related_name='perfil_organizador'
    )
    
    telefono = models.CharField(max_length=20)
    profesion_o_empresa = models.CharField(max_length=200, db_index=True)
    descripcion_breve = models.TextField(max_length=500)
    
    documento_identidad = models.FileField(
        upload_to='organizadores/documentos/', 
        validators=[validar_documento]
    )
    foto_perfil = models.ImageField(
        upload_to='organizadores/perfiles/', 
        validators=[validar_foto_perfil]
    )

    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Organizador"
        verbose_name_plural = "Organizadores"
        indexes = [models.Index(fields=['profesion_o_empresa'])]

    def __str__(self):
        return self.profesion_o_empresa