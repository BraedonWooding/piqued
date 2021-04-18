# Piqued - Making YourUNSW a little less lonely

<<<<<<< HEAD
## Help! How do I run this?

=======
[![Netlify Status](https://api.netlify.com/api/v1/badges/75966aeb-e8fb-4e0e-81f9-525737f864f0/deploy-status)](https://app.netlify.com/sites/frosty-jepsen-14c9ba/deploys)

## Help! How do I run this?

>>>>>>> 93fd960b06259209c92ee77e3365b41b511cfb2d
- Install the 'standalone' azure database emulator from here: https://go.microsoft.com/fwlink/?linkid=717179&clcid=0x409
- cd into `client`
    - run `npm install` to install all the required packages.
    - run `npm run dev` to run client app
- cd into `server`
    - install `python3.9`, UNIX (`sudo apt install python3.9 python3.9-venv`)
    - create venv; `python3.9 -m venv venv`
    - active venv: Windows (`venv\Scripts\activate.bat`) and UNIX (`source venv/bin/activate`)
    - then install requirements `pip3.9 install -r requirements.txt`
    - then run `python3 manage.py runserver` to run the server!
    
