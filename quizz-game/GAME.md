# game idea

(GS) Screen / client 1 (Game Screen)
(GM) Screen / client 2 (Game Master Screen)
(NJS) Server (Nodejs)
(ARD) Arduino (Board / Buttons)
(A) Actions (non development)


* (GM) choose predefined playlist from a list of playlists
* (GM) start a new game (on click client, send info to server)
* (NJS) use API (deezer / spotify) to fetch the songs
* (NJS) play song (server send song info to client player)
	* (NJS) Server needs to check if less than 4 players have played, or it’s game over
	* (GS) Client player play song
	* (GM) Client display name of song that needs to be discovered (and artist name)
	* (GM) If no more songs, show start screen, choose a playlist
* (ARD) button gets pressed
	* (NJS) on data, check if what button got pressed
		* (NJS) (Send write to arduino to tell him to light on LED of button that can answer)
			* (ARD) (Arduino light up button)
		* (NJS) Ignore all button input until answer was given
		* (NJS) Ignore input from players that have already played this round
	* (NJS) send button got pressed through socketio to client
		* (GS) show on screen which button got clicked (highlight color of which team must give the answer)
		* (GM) show on screen which button got clicked
	* (NJS) send to arduino which button won the race, make the led of the button light up
	* (NJS) tell client to pause song
		* (GS) Client pauses song
	* (NJS) server tell client to start timer of x seconds
		* (GS) Client display timer
		* (GM) Client display timer
	* (GM) Show two buttons, to press after wrong or correct answer was given
* (A) User gives response (timer still running)
	* (A) Response correct
		* (A) Game master clicks “correct”button
			* (GM) Client sends button clicked to server
			* (GS) Display that given answer is correct
			* (GS) Deactivate color of playing team
			* (NJS) server gets told that answer was given but correct
				* (NJS) Server increment score and send to client
				* (GS) Client display new score
			* (NJS) Add player to list of players that have played for current song
		* (A) Game master needs to click next
	* (A) Response wrong
	* (A) Game master clicks “wrong” button
		* (GM) Client sends button clicked to server
		* (GS) Display that given answer is wrong
		* (GS) Deactivate color of playing team
		* (NJS) server gets told that answer was given but wrong
			* (NJS) Server start song again
		* (NJS) Add player to list of players that have played for current song
* (A) User does not give response (timer runs out)
	* (NJS) Add player to list of players that have played for current song
	* (NJS) Server start song again
* (A) Song Finishes playing and no team won
	* (A) Game Master needs to hit next 
