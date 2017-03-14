# TODOS

## open:

* allow user on gamemaster screen to connect own deezer account (oauth)
* allow user to fetch own (public and private) playlists list from deezer
* on player screen ask all teams to press their buzzer once to tell the game that are ready
* two players are minimum, four are maximum, let the game master add team 3 and 4 only if needed, form (+) button adds one more team
* let the gamemaster choose a color per team, by default attribute a color to each team (alert if two teams have same color)
* check if two teams have the same name, if so alert
* add other services / APIs like spotify or youtube as sources for music
* add the arduino source code to the repository
* find somebody to do a design / logo for the project
* build a landing page (musicquizgame.com), using github pages
* play a sound when a player presses the buzzer
* let the game master set the time users have to guess
* create game has ended / score page
* if the playlist is empty the game must end
* build a box for the physical buttons using a 3d printer
* during game make arduino light up the button that got pressed (first)
* if during a round a player presses the button, but he has already played then ignore it
* highlight the team column which pressed the button

## done:

* order and arduino board as well as the physical buttons (adafruit big 100mm arcade buttons)
* do prototype for both the gamemaster and player screens
* do nodejs - arduino serial ports reading prototype, to test the buttons input
* fetch the playlist using the deezer API and add them to the setup game playlist selection
* create a screen to let the game master set up a new game
* create player to play back the songs of a playlist
* create the router for client routes of both screens
* write two controllers, one for the player and one for the game master
* create a design of our board using a tool like https://circuits.io/home/create
* export the project from https://circuits.io/home/create and put the files into the arduino folder
* add a screenshot of the board using https://circuits.io/ to the project readme
* fetch the songs using the deezer API after a playlist got selected
* initialize the audio player and add all the songs to the queue
* register a domain (musicquizgame.com)
* change the domain DNS to point to our github page
* open a gmail account (musicquizgame@gmail.com)

## ideas for the future:

* create a version of the game where the user have to choose between several right answers, so a game version with no game master
