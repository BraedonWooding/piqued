# Converts Data to a proper fixture format

import json

with open("raw_interests.raw", "r") as f, open("../server/interests/interests.json", "w") as o:
    interests = f.readlines()
    output_interests = []
    index = 0
    for interest in interests:
        interest = interest.strip()
        print("insert into dbo.interests_interest (name, is_course) values ('" + interest + "', 0)")
        output_interests.append({
            "model": "interests.Interest",
            "pk": index,
            "fields": {
                "name": interest,
                "is_course": False
            }
        })
        index += 1
    o.write(json.dumps(output_interests))

exit()

with open("courses.json", "r") as f, open("../server/info/courses.json", "w") as o:
    courses = json.load(f)
    output_courses = []
    index = 0
    for course_code in courses:
        course = courses[course_code]
        output_courses.append({
            "model": "info.Course",
            "pk": index,
            "fields": {
                "course_code": course_code,
                "course_name": course["course_name"],
                "faculty": course["faculty"],
                "school": course["school"],
                "course_level": course["course_level"],
                "terms": ",".join(course["terms"]) if course["terms"] else "",
                "desc": course["desc"]
            }
        })
        index += 1
    o.write(json.dumps(output_courses))

with open("programs.json", "r") as f, open("../server/info/programs.json", "w") as o:
    programs = json.load(f)
    output_programs = []
    index = 0
    for program_code in programs:
        program = programs[program_code]
        output_programs.append({
            "model": "info.Program",
            "pk": index,
            "fields": {
                "program_code": program_code,
                "name": program["name"],
                "faculty": program["faculty"],
                "duration_years": program["duration"],
                "desc": program["desc"]
            }
        })
        index += 1
    o.write(json.dumps(output_programs))
