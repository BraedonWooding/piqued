from rest_framework import permissions

from . import settings


class AppKey(permissions.BasePermission):
    def has_permission(self, request, view):
        if 'HTTP_X_APP_KEY' in request.META and request.META['HTTP_X_APP_KEY'] == settings.APP_KEY:
            return True
        else:
            return False

    def has_object_permission(self, request, view, obj):
        if 'HTTP_X_APP_KEY' in request.META and request.META['HTTP_X_APP_KEY'] == settings.APP_KEY:
            return True
        else:
            return False

class HasGroupOverlap(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the snippet.
        return obj.owner == request.user
