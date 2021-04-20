import io
import re
from datetime import date

import PyPDF2
from django.shortcuts import render
from groups.models import Group, PiquedGroup
from groups.serializers import PiquedGroupSerializer
from info.models import Course, Program
from info.serializers import CourseSerializer, ProgramSerializer
from interests.models import Interest
from interests.serializers import InterestSerializer
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from user.models import PiquedUser


def createPiquedGroupHelper(groupname, interest, userCreated, expiry=None):
    group = Group.objects.create(name=groupname)
    print(expiry)
    piquedGroup = PiquedGroup.objects.create(
        group=group, created_by=userCreated, expired_at=expiry)
    piquedGroup.interests.add(interest)
    piquedGroup.save()
    return piquedGroup

def format_course_names(courseList, year, term):
    sanitisedList = []
    for course in courseList:
        course = course.replace(' ', '')
        sanitisedList.append(course)
    
    courseSuffix = year[2:] + 'T' + term
    return sanitisedList, courseSuffix

def find_enrolment_info(pageText, termNum, termYear):
    termYearString = "Term {} {}".format(termNum, termYear)

    chunkExpression = r"Term ([0-9] [0-9]{4})"
    programExpression = r"(?i:Program:([0-9]{4}) (.*?)Plan)"
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
    courseListFormatted, courseSuffix = format_course_names(courseList, termYear, termNum)
    return programList, majorList, courseListFormatted, courseSuffix

def scrape_courses(file):
    pdfFile = file.read()
    pdfReader = PyPDF2.PdfFileReader(io.BytesIO(pdfFile))
    term = "1"
    year = "2021"
    for i in range(pdfReader.numPages):
        pageText = pdfReader.getPage(i).extractText()
        if (term + " " + year) in pageText:
            return find_enrolment_info(pageText + (pdfReader.getPage(i + 1).extractText() if i < pdfReader.numPages - 1 else ""), term, year)

class TranscriptViewSet(ViewSet):
    queryset=PiquedGroup.objects.all()
    serializer_class= PiquedGroupSerializer, InterestSerializer

    @action( detail=False, methods=['post'])
    def upload(self, request):
        uploadedFile = self.request.FILES['transcript']
        # scrape PDF
        programList, majorList, courseList, courseSuffix = scrape_courses(uploadedFile)

        # filter program objects for relevant stream
        programObj = Program.objects.filter(program_code=programList[0][0]) 
        if not programObj:
            print("invalid program")

        # query generic admin user
        adminUser = PiquedUser.objects.get(user__id=93)
        programResponse = list(programObj)[0]

        interestsToReturn = []

        # query program interest to check if it needs creation
        programInterest = Interest.objects.filter(name=programObj[0].name)
        if not programInterest:
            programInterest = [Interest.objects.create(name=programObj[0].name, is_course=False)]

        interestsToReturn += programInterest

        # query course object reference data
        courseObj = Course.objects.filter(course_code__in=courseList)
        if not courseObj:
            print("invalid course set")

        coursesResponse = list(courseObj)

        # query interests relating to courses
        courseInterests = Interest.objects.filter(name__in=[c.course_code for c in courseObj])
        for c in courseObj:
            if c.course_code not in [i.name for i in courseInterests]:
                interestsToReturn.append(Interest.objects.create(name=c.course_code, is_course=True))

        courseInterests.order_by('name')
        interestsToReturn += list(courseInterests)
        
        groupsToReturn = []

        # query PiquedGroup for program
        programGroup = PiquedGroup.objects.filter(group__name=programObj[0].name)
        groupsToReturn += list(programGroup)
        if not programGroup:
            piquedGroup = createPiquedGroupHelper(programObj[0].name, programInterest[0], adminUser)
            groupsToReturn.append(piquedGroup)


        ####
        # refactor for interest filtering here as well
        ####
        # query course Piqued groups for return to front end
        courseGroupNameList = [c + ' ' + courseSuffix for c in courseList]
        courseGroups = PiquedGroup.objects.filter(group__name__in=courseGroupNameList)
        groupsToReturn += list(courseGroups)
        
        courseGroupNameList.sort()
        courseTupleList = zip(courseGroupNameList,courseInterests)

        # create course Piqued groups that don't already exist
        for c in courseTupleList:
            if c[0] not in [g.group.name for g in courseGroups]:
                piquedGroup = createPiquedGroupHelper(c[0],c[1], adminUser, expiry=date(2021,6,1))
                groupsToReturn.append(piquedGroup)

        # serialize
        group_serializer = PiquedGroupSerializer(groupsToReturn, many=True)
        program_serializer = ProgramSerializer(programResponse)
        course_serializer = CourseSerializer(coursesResponse,many=True)

        # send
        return Response({
            'program': program_serializer.data,
            'courses': course_serializer.data,
            'groups': group_serializer.data
        })
