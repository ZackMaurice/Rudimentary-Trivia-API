Rudimentary trivia API from before I learned of express-sessions.






If the client inputs an invalid query, the server will not respond with questions.
-> responds with status 1, and the reason for that status

-> with status 1 and 2, server always tells the client why it failed	(Not enough questions, invalid token, invalid parameters)

Running instructions:
open cmd in this directory
type:
	node requestServer.js

go to localhost:3000 on browser of choice




Paths:

GET /questions
	1. The server will respond with a JSON response containing the following key/values:
	
		status: an integer value of either 0 (success), 1 (no results or not enough
		questions to fulfill request), 2 (invalid token, see ‘Adding Sessions’ section)
	
		results: an array of question objects, where each question contains all data
		stored in that question’s data file.

	2. If no query parameters are specified, the default server behaviour will be to return 10
	randomly selected questions.
	
	3. The client should be able to supply appropriate query parameters, in which case the
	server should respond with the correct number of questions that match the specified
	category/difficulty.
		Query parameters:
			limit:integer - number of desired questions
			difficulty:integer - desired difficulty ID (1,2,3)
			category:integer - desired category ID (1-24)
			token:string - session ID (gotten from POST /sessions)
			
			
			
POST /sessions
	- Creates a new session ID on the server

GET /sessions
	- Lists all the session IDs that have been made
	
DELETE /sessions/:sessionid
	- Deletes the session with the given sessionID if it exists