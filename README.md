# TO ETSAV

### Setup workspace
Install client dependencies
`npm install`
Install dev-server node dependencies
`cd .devlite && npm install`
Run development server (after returned to the root directory `cd ..`)
`npm run serve`

### REPOSITORY STRUCTURE

    /
    |- assets <-- Folder to save documents, data an any kind of worthy data related to the project 
    |- build <-- Folder with config files for each compilation environment we need
    |- dist <-- Folder where our app will be placed after a compilation
      |- statics <-- Recursive copy of our statics folder inside src folder
        |- data
        |- templates
        |- images
      |- bundle.css <-- Our css stylesheet after a project's compilation
      |- bundle.js <-- Our javascript code after a project's compilation
      |- index.html <-- Out index.html after a project's compilation
    |- node_modules <-- Folder created by npm, don't care about it
    |- src <-- Folder where all our app source will be placed
        |- statics <- Folder where our static files will be placed.
          |- data <-- Folder where our data (json, csv, xml...) files will be placed.
          |- templates <-- Folder where our templates will be placed.
          |- images <-- Folder where our images will be placed. 
        |- scripts <-- Folder where our js scripts will be placed.
          |- index.js <-- Index file of our scripts.
        |- styles <-- Folder where our stylus scripts will be placed.
          |- index.styl <-- Index file of our styles.
        |- index.html <-- index.html is our index file
    |- devliterc.js <-- Config file for the compilation process
    |- envs.js <-- Config file where our client environment variables may be defined
    |- package.json <-- Config file for npm where our dependencies where registereds, don't care about it.
    |- README.md <-- Description of the project
    |- package-lock.json <-- Config file for npm where our dependencies where registereds, don't care about it.
