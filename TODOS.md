# TODOS

## open:

* export the project from https://circuits.io/home/create and put the files into the arduino folder
* allow user on gamemaster screen to connect own deezer account (oauth)
* allow user to fetch own (public and private) playlists list from deezer
* on player screen ask all teams to press their buzzer once to tell the game that are ready
* two players are minimum, four are maximum, let the game master add team 3 and 4 only if needed, form (+) button adds one more team
* let the gamemaster choose a color per team, by default attribute a color to each team (alert if two teams have same color)
* check if two teams have the same name, if so alert

## done:

* order and arduino board as well as the physical buttons (adafruit big 100mm arcade buttons)
* do prototype for both the gamemaster and player screens
* do nodejs - arduino serial ports reading prototype, to test the buttons input
* add the arduino source code to the repository
* create a design of our board using a tool like https://circuits.io/home/create
* get access to songs through an API (deezer / spotify)
* create player to play back the songs of a playlist
* create the router for client routes of both screens
* write two controllers, one for the player and one for the game master
