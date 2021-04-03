from django.http import HttpResponse
from django.shortcuts import render
from groups.models import PiquedGroup
from rest_framework.decorators import action, api_view
from rest_framework.viewsets import ViewSet
import PyPDF2
import io
import re

def format_course_names(courseList, year, term):
    sanitisedList = []
    for course in courseList:
        course = course.replace(' ', '')
        course = course + ' ' + year[2:] + 'T' + term
        sanitisedList.append(course)
    
    return sanitisedList

def find_degree(pageText, termNum, termYear):
    termYearString = "Term {} {}".format(termNum, termYear)

    chunkExpression = r"Term ([0-9] [0-9]{4})"
    programExpression = r"(?i:Program:([0-9]{4}))"
    majorExpression = r"Plan:[A-Z]{5,6}[0-9]{4,5} (.*? Major)"
    courseExpression = r"[A-Z]{4} [0-9]{4}"
    termsOnPage = re.findall(chunkExpression, pageText)
    
    chunks = re.split(chunkExpression, pageText)
    for i in range(len(chunks)):
        if chunks[i][0] == termNum:
            chunkIndex = i+1

    programList = re.findall(programExpression, chunks[chunkIndex])
    majorList = re.findall(majorExpression, chunks[chunkIndex])
    courseList = re.findall(courseExpression, chunks[chunkIndex])
    print(programList)
    print(majorList)
    print(format_course_names(courseList, termYear, termNum))

    return programList, majorList, courseList

def scrape_courses(file):
    pdfFile = file.read()
    pdfReader = PyPDF2.PdfFileReader(io.BytesIO(pdfFile))
    term = "2"
    year = "2019"
    for i in range(pdfReader.numPages):
        pageText = pdfReader.getPage(i).extractText()
        if (term + " " + year) in pageText:
            return find_degree(pageText, term, year)

class TranscriptViewSet(ViewSet):
    queryset=PiquedGroup.objects.all()

    @action( detail=False, methods=['post'])
    def upload(self, request):
        uploadedFile = self.request.FILES['transcript']
        programList, majorList, courseList = scrape_courses(uploadedFile)
        groups = PiquedGroup.objects.all()
        # courses = 

        # figure out if groups are pre-existing or not
        # filter shit out 
        # observe backend of courses
        return HttpResponse('Successfully uploaded {}'.format(uploadedFile))


