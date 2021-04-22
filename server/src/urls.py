"""piqued URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic.base import RedirectView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt import views as jwt_views

from src import feeds, settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', RedirectView.as_view(url='/admin')),
    path('rss/query', feeds.query_feed),
    path('', include('user.urls')),
    path('', include('filesend.urls')),
    path('', include('transcript.urls')),
    path('', include('interests.urls')),
    path('', include('info.urls')),
    path('', include('messaging.urls')),
    path('', include('groups.urls')),
    path('', include('firebase_notifications.urls')),
    path('token/', jwt_views.TokenObtainPairView.as_view(),
         name='token_obtain_pair'),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
