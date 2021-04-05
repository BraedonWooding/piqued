import io
import re

import PyPDF2
from django.shortcuts import render
from groups.models import Group, PiquedGroup
from groups.serializers import PiquedGroupSerializer
from info.models import Course, Program
from interests.models import Interest
from interests.serializers import InterestSerializer
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet


def createPiquedGroupHelper(groupname,interest):
    group = Group.objects.create(name=groupname)
    piquedGroup = PiquedGroup.objects.create(
        group=group)
    piquedGroup.interests.add(interest)
    piquedGroup.save()
    return piquedGroup

def format_course_names(courseList, year, term):
    sanitisedList = []
    for course in courseList:
        course = course.replace(' ', '')
        # course = (course, year[2:] + 'T' + term)
        sanitisedList.append(course)
    
    courseSuffix = year[2:] + 'T' + term
    return sanitisedList, courseSuffix

def find_degree(pageText, termNum, termYear):
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
    # print(programList)
    # print(majorList)
    courseList, courseSuffix = format_course_names(courseList, termYear, termNum)
    # print(courseList)

    return programList, majorList, courseList, courseSuffix

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
    serializer_class= PiquedGroupSerializer, InterestSerializer

    @action( detail=False, methods=['post'])
    def upload(self, request):
        uploadedFile = self.request.FILES['transcript']
        # scrape PDF
        programList, majorList, courseList, courseSuffix = scrape_courses(uploadedFile)

        # TODO remove hardcoded program_code
        programObj = Program.objects.filter(program_code='4501') 
        if not programObj:
            print("invalid program") # replace with response

        interestsToReturn = []

        programInterest = Interest.objects.filter(name=programObj[0].name)
        if not programInterest:
            # create Interest item
            # update Interests with newly created one
            programInterest = [Interest.objects.create(name=programObj[0].name, is_course=False)]

        interestsToReturn += programInterest

        courseObj = Course.objects.filter(course_code__in=courseList)
        if not courseObj:
            print("invalid course set")

        # grab courses interest
        courseInterests = Interest.objects.filter(name__in=[c.course_code for c in courseObj])
        for c in courseObj:
            if c.course_code not in [i.name for i in courseInterests]:
                courseInterests.append(Interest.objects.create(name=c.course_code, is_course=True))

        courseInterests.order_by('name')
        interestsToReturn += list(courseInterests)
        
        #####
        # assign interests to user 
        ##### 
        # self.request.user.interests.add(courseInterests)
        # self.request.user.interests.add(programInterest)
        groupsToReturn = []

        programGroup = PiquedGroup.objects.filter(group__name=programObj[0].name)
        groupsToReturn += list(programGroup)
        if not programGroup:
            piquedGroup = createPiquedGroupHelper(programObj[0].name, programInterest[0])
            # group = Group.objects.create(name=programObj[0].name)
            # piquedGroup = PiquedGroup.objects.create(
            #     group=group)
            # piquedGroup.interests.add(programInterest[0])
            # piquedGroup.save()
            groupsToReturn.append(piquedGroup)


        ####
        # TODO interest filtering here as well
        ####
        courseGroupNameList = [c + ' ' + courseSuffix for c in courseList]
        courseGroups = PiquedGroup.objects.filter(group__name__in=courseGroupNameList)
        groupsToReturn += list(courseGroups)
        
        courseGroupNameList.sort()
        courseTupleList = zip(courseGroupNameList,courseInterests)
        

        for c in courseTupleList:
            if c[0] not in [g.group.name for g in courseGroups]:
                piquedGroup = createPiquedGroupHelper(c[0],c[1])
                # group = Group.objects.create(name=c[0])
                # piquedGroup = PiquedGroup.objects.create(
                #     group=group)
                # piquedGroup.interests.add(c[1])
                # piquedGroup.save()
                groupsToReturn.append(piquedGroup)

        group_serializer = PiquedGroupSerializer(groupsToReturn, many=True)
        interest_serializer = InterestSerializer(interestsToReturn, many=True)

        return Response({
            'groups':group_serializer.data,
            'interests':interest_serializer.data
        })
        # return Response('good')

