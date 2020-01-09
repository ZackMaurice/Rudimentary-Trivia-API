const express = require("express");
const fs = require("fs");
const app = express();
const id = require("uid-safe");

let sessions = [];
let questions = {};
questions[""]=[];


function logRequest(req,res,next){
	
	console.log("Method: "+req.method);
	console.log("URL: "+req.url);
	console.log("Path: "+req.path);
	next();
	
}

function createSession(req,res){
	
	let session = id.sync(6);
	while(true){
		//making damn sure theres no duplicates
		if(sessions.includes(session)){
			console.log("Duplicate found, re-assigning.");
			session = id.sync(6);
		}else{
			break;
		}
	}
	console.log("User's Session ID: "+session);
	sessions.push(session);
	questions[session] = [];
	res.status(201).send(session);
	
}



function getQuestions(req,res){
	
	let body = req.query;
	
	let newQuestions = [];
	
	let status = 0;
	let limit = 10;
	let difficulty;
	let category;
	let token = "";
	
	let invalid = {"status":status, "reason":""};
	
	if(body["token"] != null){
		if(sessions.includes(body["token"])){
			token = body["token"];
		}else{
			invalid["status"] = 2;
			invalid["reason"] = "Invalid token";
		}
	}
	if(body["limit"] != null){
		if(parseInt(body["limit"]) > 0){
			limit = parseInt(body["limit"]);
		}else{
			invalid["status"] = 1;
			invalid["reason"] = "Invalid limit";
		}
	}
	if(body["difficulty"] != null){
		if(parseInt(body["difficulty"]) > 0 && parseInt(body["difficulty"]) < 4){
			difficulty = parseInt(body["difficulty"]);
		}else{
			invalid["status"] = 1;
			invalid["reason"] = "Invalid difficulty";
		}
	}//else{
		//difficulty = Math.ceil(Math.random()*3);
	//}
	if(body["category"] != null){
		if(parseInt(body["category"]) > 0 && parseInt(body["category"]) < 25){
			category = parseInt(body["category"]);			
		}else{
			invalid["status"] = 1;
			invalid["reason"] = "Invalid category";
		}
		
	}
	
	
	
	let readQuestions = 0;
	let savedQuestions = 0;
	
	
	let randomBank = [];
	
	
	if(invalid["status"] == 0){								//only run this if we are going to use it
		while(savedQuestions < limit){
			if(readQuestions < 500){//while we havent capped out of questions, keep going
				
				let file;		//holds file
				let question;	//holds question
				
				
				let random = Math.ceil(Math.random()*500);
																	//how i get a random file
				while(randomBank.includes(random)){
					random = Math.ceil(Math.random()*500);
				}
				file = fs.readFileSync("./questions/"+(random)+".txt");
				
				if(body["difficulty"] == null && body["category"] == null){	//if no query was provided, run this
				
					console.log("No difficulty/Category provided");
					console.log(questions[token].length);


					question = JSON.parse(file);
					
					let dupe = false;
					questions[token].forEach(function (q){

						if(q["question_id"] == question["question_id"]){
							dupe = true;
						}
					});
					if(dupe == false){
						
						questions[token].push(question);
						newQuestions.push(question);
						
						savedQuestions -= -1; //meme
						//savedQuestions++;
						//console.log("Question: "+random+" saved");
					}
					console.log("Question: "+random+" read");
					
					
				}else{	//otherwise, find the number of questions equal to the limit that match the query, if that number of questions exists
					
					console.log("Query provided");
					
					
					question = JSON.parse(file);
					
					let dupe = false;
					questions[token].forEach(function (q){

						if(q["question_id"] == question["question_id"]){
							dupe = true;
						}
					});
					if(dupe == false){

						let validQuestion = true;	//if this maintains true by the end of the if statemenets, its a valid question matching the query
						
						if(difficulty != null){
							
							if(question["difficulty_id"] != difficulty){
								validQuestion = false;
							}
						}
						if(category != null){
							if(question["category_id"] != category){
								validQuestion = false;
							}
						}
						
						if(validQuestion == true){
							questions[token].push(question);
							newQuestions.push(question);
							savedQuestions -= -1; //meme
							//savedQuestions++;
						}
					}
					
					
					
				}
				
				readQuestions -= -1; //meme
				//readQuestions++;	//increase the number of questions we've read so that we don't go over the limit
				
				
			}else{//if we've capped out of questions, end this and say we dont have enough
				invalid["status"] = 1;
				invalid["reason"] = "Not enough questions.";
				break;
			}
		}
	}
	

	
	
	//check to see if something was invalid
	if(invalid["status"] != 0){
		console.log("Invalid being sent.");
		res.send(invalid);
	}else{
		console.log("Questions being sent.");
		res.send(newQuestions);
		

	}
}



function displaySessions(req,res){
	
	res.status(200).send(sessions);
	
}

function deleteSession(req,res){
	let id = (req.params)["sessionID"];
	console.log(id);
	let q = {};
	
	let index = -1;
	for(let i = 0; i < sessions.length; i -= -1){
		if(sessions[i] == id){
			index = i;
			break;
		}
	}
	if(index != -1){
		/*
		*	splice the id at the index it was found at
		*	rewrite the questions without the old session's questions to save space
		*/
		sessions.splice(index,1);
		sessions.forEach(function(session){
			q[session] = questions[session];
		});
		questions = q;
		
		res.status(200).send("SessionID removed.");
		
	}else{
		res.sendStatus(404);
	}
	
	
}






app.use(logRequest);
app.use(express.static("public",{index:"index.html"}));
app.get("/questions",getQuestions);
app.route("/sessions")
	.get(displaySessions)
	.post(createSession)
app.delete("/sessions/:sessionID",deleteSession);





app.listen(3000);
console.log("Server is up at http://localhost:3000");