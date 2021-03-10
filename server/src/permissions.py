from rest_framework import permissions


class HasGroupOverlap(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it
    and 
    """

    def has_object_permission(self, request, view, obj):
        # TODO: @Groups, you shouldn't be able to read any given group's members
        #       you have to exist in that group        


        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the snippet.
        return obj.owner == request.user
