# TO ETSAV

### Setup workspace
Create python virtualenv to avoid dependency collisions
`virtualenv -p python3 .`
Activate the virtualenv
`source bin/activate`
Install python requirements
`pip install -r requirements.txt`
Install npm dependencies
`npm install`
Run development server
`npm run serve`

### REPOSITORY STRUCTURE

    /
    |- assets <-- Folder to save documents, data an any kind of worthy data related to the project 
    |- dist <-- Folder where our app will be placed after a compilation
    |- include <-- Folder created by virtualenv, don't care about it
    |- lib <-- Folder created by virtualenv, don't care about it
    |- node_modules <-- Folder created by npm, don't care about it
    |- src <-- Folder where all our app source will be placed
        |- data <-- Folder where our data (json, csv, xml...) files will be placed.
        |- scripts <-- Folder where our js scripts will be placed.
        |- styles <-- Folder where our stylus scripts will be placed.
        |- templates <-- Folder where our templates will be placed.
        |- index.js <-- Index file of our scripts.
        |- index.styl <-- Index file of our styles.
    |- index.html <-- index.html is our index file
    |- package.json <-- Config file for npm where our dependencies where registereds, don't care about it.
    |- README.md <-- Description of the project
    |- requirments.txt <-- Config file for python where our dependencies where registereds, don't care about it.
    |- server.py <-- Source code of the development server
    |- package-lock.json <-- Config file for npm where our dependencies where registereds, don't care about it.
