# TODOS

## open:

### important (for MVP) TODOS

* on GM screen, set user score by default to zero
* on GM screen, add sentence that score input is only needed if you want to start with a score from previous games (from previous sessions) that is not zero
* on GM screen, is score automatically set if previous game happend during same session?
* [BUG] the game master screen doesn't respond if player screen is not open yet
* on GM screen, validator for scores, must be numeric, must be integer not float
* on GM screen, show error if playlist can't get fetched because of missing music service setup
* on the game master screen, use words "teams / players" instead of just team / player
* in the configuration rename deezerProfileID to profileID

* during game make arduino light up the button that got pressed (first)
* add the arduino source code to the repository (latest updated version with light management and 4 button support) ???
* finish the button basis painting
* layout the playing countdown
* layout the countdown for the "guessing time"

### less important (nice to have) TODOS

* allow user on gamemaster screen to connect own deezer account (oauth)
* allow user to fetch own (public and private) playlists list from deezer
* on player screen ask all teams to press their buzzer once to tell the game that are ready
* let the game master add team 3 and 4 only if needed, form (+) button adds one more team
* let the gamemaster choose a color per team, by default attribute a color to each team (alert if two teams have same color)
* add other services / APIs like spotify or youtube as sources for music
* extend the configuration file to allow multiple parallel configurations for multiple music services at once
* in the playlists list display the playlists by alphabetical order, grouped by music service
* build a landing page (musicquizgame.com), using github pages
* add a button tester to the first game master screen to be able to connect the colored button to the correct arduino input
* add a current song index x of y total songs info to the game master screen
* create a url after a game got created that can be shared
* create an abstract class for both controllers and move duplicate code into it
* create an improved version of the screens using react / inferno or vuejs instead of all that jquery code
* on the game master screen add a checkbox for auto resume, this means on "wrong answer" or "not answered" events the song gets resumed automatically without having to click resume manually
* we should recalculate the spectrum related sizes on screen resize
* make the playlists selection in the game master game creation form more visual, show covers and use the select box as invisible playlist selection for when the game master selects a cover
* on the game master game setup screen, in the playlist select, after the playlist name add the number of songs that the playlist contains as supplementary information
* create an (offline) cross platform desktop app version of the game using https://github.com/electron/electron 
* put more code related to game logic into the server instead of having the screens handle it, like recording who has answered wrong and disallowing another button press during same round, ...
* what if the player name is bigger then the column width, truncate with css ellipse?

## done / closed TODOS:

* order an Arduino UNO board
* order 4 Adafruit Massive Arcade Button with LED - 100mm Red / Blue / Green / Yellow
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
* build a box for the physical buttons
* add a volume control to the game master screen
* design the game start screen for the player, style the waiting sentence, add a loading animation and the game logo
* play a sound when a player presses the buzzer
* add an option to the game master screen to change to sound being played on buzzer pressed and / or disable sounds
* let the game master set the time users have to guess
* create game has ended / score page
* find somebody to do a design / logo for the project
* add music visual to the player screen
* put the score and team names into local storage and on next game populate the game creation form
* get the values from local storage when building the game master game setup form
* check if two teams have the same name or an empty name, if so alert
* put class active on player column top container when player has pressed Button
* highlight the row of the player that pressed the button on the game master screen
* remove active class from player column top container after answer was given or time has run out
* if the playlist is empty disable the play button, the game master now press the "game end" button
* if during a round a player presses the button, but he has already played then ignore it
* on the game master screen paint the rows of players that have guessed wrong this round red
* if a player has played but was wrong, add an icon to his column indicating he can't guess again for this round
* if a player has given the correct answer put an icon in his column indicating that he won
* on new song remove the "has already played" and "was correct" icons
* fix the score panel columns height based on the score
* layout the answer is correct / wrong messages on the player screen

## ideas for the future:

* create a version of the game where the user have to choose between several right answers, so a game version with no game master
