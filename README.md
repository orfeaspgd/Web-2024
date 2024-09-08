use 'nodemon server.js' to run (install with 'npm install -g nodemon' if necessary)
nodemon keeps refreshing the server everytime changes are saved without you having to restart it manually
recommend using git bash terminal for running the command, the wsl ubuntu terminal was way slower

to connect to the database, have a file named ".env" in the same directory as the server.js file that includes "DB=mongodb://127.0.0.1:27017/Web2024" or your own database url

server.js is the main server file for the backend operations

schemas.js is used in server.js to include the mongoose schemas for every mongodb document (aka table) in our database


