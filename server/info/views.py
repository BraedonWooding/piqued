
from rest_framework.viewsets import ModelViewSet

from .models import Course, Program
from .serializers import CourseSerializer, ProgramSerializer


class CourseViewSet(ModelViewSet):
    serializer_class = CourseSerializer
    queryset = Course.objects.all()

class ProgramViewSet(ModelViewSet):
    serializer_class = ProgramSerializer
    queryset = Program.objects.all()
