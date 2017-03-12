# TODOS

## open:


* allow user on gamemaster screen to connect own deezer account (oauth)
* allow user to fetch own (public and private) playlists list from deezer
* on player screen ask all teams to press their buzzer once to tell the game that are ready
* two players are minimum, four are maximum, let the game master add team 3 and 4 only if needed, form (+) button adds one more team
* let the gamemaster choose a color per team, by default attribute a color to each team (alert if two teams have same color)
* check if two teams have the same name, if so alert
* create the ui for the player (game master screen)
* add other services / APIs like spotify or youtube as sources for music
* add the arduino source code to the repository
* find somebody to do a design / logo for the project
* build a landing page (musicquizgame.com), using github pages

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
* open a gmail account (musicquizgame@gmail.com)

## Xavier:
* gamemaster: 
 * when click submit show game page
 * page game code button start game (send event startGame to server and server to player)
 * display answer mode and code 'false' button ('true' button is for Chris)
* player: 
 * correct play game screen
 * show answer mode on game page when user press button
 * display score page

## Chris:
* player:
 * when server send event gameStart start the song
* gamemaster:
 * on game page code next button (skipe current track)
 * answer 'true' button, add score and next song
 * check when playlist is finished
 * start new game
* node:
 * fetch songs and send to player

