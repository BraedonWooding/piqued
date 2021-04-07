FROM ubuntu:18.04
ENV PYTHONUNBUFFERED 1
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y curl apt-transport-https python3 python3-pip python-dev locales
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
RUN curl https://packages.microsoft.com/config/ubuntu/18.04/prod.list > /etc/apt/sources.list.d/mssql-release.list
RUN apt-get update
RUN apt-get install libodbc1 -y
RUN apt-get update
RUN ACCEPT_EULA=Y apt-get -y install msodbcsql17
RUN apt-get install -y unixodbc-dev
RUN mkdir /code
WORKDIR /code
ADD requirements.txt /code/
RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt
RUN pip3 install gunicorn
ADD . /code/
CMD python3 manage.py collectstatic --no-input

#Layer for exposing the app through gunicorn
EXPOSE 8000
COPY entrypoint.sh /code/
WORKDIR /code
ENTRYPOINT ["sh", "entrypoint.sh"]
