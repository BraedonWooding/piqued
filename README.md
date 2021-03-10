# Piqued - Making YourUNSW a little less lonely

## Help! How do I run this?

- Install the 'standalone' azure database emulator from here: https://go.microsoft.com/fwlink/?linkid=717179&clcid=0x409
- cd into `client`
    - run `npm install` to install all the required packages.
    - run `npm run dev` to run client app
- cd into `server`
    - install `python3.9`, UNIX (`sudo apt install python3.9 python3.9-venv`)
    - create venv; `python3.9 -m venv venv`
    - active venv: Windows (`venv\Scripts\activate.bat`) and UNIX (`source venv/bin/activate`)
    - then install requirements `pip3.9 install -r requirements.txt`
    - cd up into the main folder
    - run the emulator setup file 'python setupDB'
    - cd into 'server'
    - then run `python3 manage.py runserver` to run the server!
    
