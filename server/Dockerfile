FROM ubuntu:18.04
ENV PYTHONUNBUFFERED 1
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update
RUN apt install software-properties-common -y
RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt-get update && apt-get install -y curl apt-transport-https python3.8 python3.8-dev python3-pip locales
RUN python3.8 -m pip install pip
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
RUN python3.8 -m pip install -r requirements.txt
RUN python3.8 -m pip install gunicorn
RUN python3.8 -m pip install Twisted==20.3.0
RUN python3.8 -m pip install uvloop
RUN python3.8 -m pip install httptools
RUN python3.8 -m pip install pytest
RUN python3.8 -m pip install websockets
RUN python3.8 -m pip install cffi
ADD . /code/
CMD python3.8 manage.py collectstatic --no-input

#Layer for exposing the app through gunicorn
EXPOSE 8000
COPY entrypoint.sh /code/
WORKDIR /code
ENTRYPOINT ["sh", "entrypoint.sh"]
