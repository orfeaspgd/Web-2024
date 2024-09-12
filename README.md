# How to run the project
- Use `npm install` to install the necessary packages
- Run the `database.mongodb` file in a  *MongoDB* console before running the `server.js` file 

- Use `node server.js` to start the *Node.js* server

To connect to the database, the project uses the `.env` file. Edit it accordingly to set your own database URL.

---
`server.js` is the main server file for the backend operations.

`schemas.js` is used in `server.js` to include the Mongoose schemas for every MongoDB document in our database.

The `frontend` directory includes the `js`,`html`,`css` and asset files that are used in the frontend operations

The `routes` directory includes the `js` files that are used for backend operations

