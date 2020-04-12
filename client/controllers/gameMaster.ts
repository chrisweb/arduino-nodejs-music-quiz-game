// vendor (node_modules)
import * as io from 'socket.io-client';

// library
import { LocalStorageLibrary } from '../library/localStorage';

export interface IPlaylistsOption {
    id: number;
    title: string;
    cover: string;
}

export class GameMasterController {
    protected _socket: SocketIOClient.Socket;

    protected _localStorageLibrary: LocalStorageLibrary;

    protected _$container: JQuery;

    protected _gameHasStarted = false;

    protected _isSongPlaying = false;

    protected _isAnsweringTime = false;

    protected _playersData: any;

    protected _playlistSongs: any;

    protected _currentPlaylistSongIndex = 0;

    protected _latestPlayerId: number | null = null;

    protected _songPlayingProgress: number | null = null;

    protected _songPlayingIntervalId: number;

    protected _answerIntervalId: number;

    protected _volume = 80;

    protected _buzzerSound = 'messagealert';

    protected _answerTimeDuration: number;

    protected _answerTimeSelect = 15;

    protected _playlistsOptions: IPlaylistsOption[] | null = null;

    public constructor() {

      // INFO: twitter bootstrap 4 components https://v4-alpha.getbootstrap.com/components/alerts/
      // grid: https://v4-alpha.getbootstrap.com/layout/grid/

    }

    public run() {
      const $body = $('body');

      $body.addClass('gamemasterScreen');

      this._$container = $body.find('.js-container');

      this._$container.addClass('container');

      // open socket.io connection
      this._socket = io.connect('http://127.0.0.1:35001');

      // initialize the local storage library
      this._localStorageLibrary = new LocalStorageLibrary();

      // identify as game master
      this._socket.emit('identifyGameMaster');

      const onPlaylistFinished = () => {
        this._showValidateAnswerContainer(false);
        this._showStartSetUpScreen();
      };

      // on server send event 'playlistFinished'
      this._socket.on('playlistFinished', onPlaylistFinished);

      const onPlayerViewReady = () => {
        this._buildGameScreen();
      };

      // on server send event playerViewReady
      this._socket.on('playerViewReady', onPlayerViewReady);

      const onPlayerPressedButton = (playerId: number) => {
        this._onPlayerPressedButton(playerId);
      };

      // on server send event 'arduinoPressButton'
      this._socket.on('playerPressedButton', onPlayerPressedButton);

      const onInitializeScreens = (playersData: any, playlistTracks: any) => {
        this._playersData = playersData;
        this._playlistSongs = playlistTracks;
        this._gameHasStarted = true;
      };

      this._socket.on('initializeScreens', onInitializeScreens);

      const onSongStarted = () => {
        this._onSongStarted();
      };

      this._socket.on('songStarted', onSongStarted);

      const onSongEnded = () => {
        this._onSongEnded();
      };

      this._socket.on('songEnded', onSongEnded);

      const onSongPaused = (playTimeOffset: number) => {
        this._onSongPaused(playTimeOffset);
      };

      this._socket.on('songPaused', onSongPaused);

      const onSongResumed = (playTimeOffset: number) => {
        this._onSongResumed(playTimeOffset);
      };

      this._socket.on('songResumed', onSongResumed);

      const onSongLoading = () => {
        this._onSongLoading();
      };

      this._socket.on('songLoading', onSongLoading);

      const onSongProgress = (playingProgress: number, maximumValue: number, currentValue: number) => {
        this._onSongProgress(playingProgress, maximumValue, currentValue);
      };

      this._socket.on('songProgress', onSongProgress);

      const onPlaylistsList = (userPlaylists: any) => {
        this._buildGameSetUpScreen(userPlaylists);
      };

      this._socket.on('playlistsList', onPlaylistsList);

      this._showStartSetUpScreen();
    }

    protected _showStartSetUpScreen() {
      this._$container.empty();

      const $startSetUpButton = $('<button class="btn btn-primary js-start-set-up-button">');

      $startSetUpButton.text('Set up a new game');

      this._$container.append($startSetUpButton);

      // listen for start set up game button click
      $startSetUpButton.one('click', (event: JQueryEventObject) => {
        event.preventDefault();

        this._showGameSetUpScreen();
      });
    }

    protected _showGameSetUpScreen() {
      // fetch the playlists list
      this._socket.emit('fetchPlaylistsList');

      // note to self: as soon as we get the playlist tracks
      // the socket.io playlistsList will be triggered and this
      // will call the method _buildGameSetUpScreen
    }

    protected _buildGameSetUpScreen(userPlaylists: any) {
      // build the screen
      this._$container.empty();

      console.log(userPlaylists);

      // parse the playlist data
      const playlistsOptions: IPlaylistsOption[] = [];

      userPlaylists.forEach((playlist: any) => {
        playlistsOptions.push({
          id: playlist.id,
          title: playlist.title,
          cover: playlist.picture_small,
        });
      });

      this._playlistsOptions = playlistsOptions;

      // build the layout
      const $gameCreationRow = $('<div class="row">');
      const $gameCreationColumn = $('<div class="col-3">');

      $gameCreationRow.append($gameCreationColumn);
      this._$container.append($gameCreationRow);

      // form errors container
      const $formErrorsContainer = $('<ul class="formErrors js-form-errors">');

      $gameCreationColumn.append($formErrorsContainer);

      // game creation form
      const $gameCreationForm = $('<form id="gameCreationForm">');
      const $gameCreationScreenTitle = $('<h1>');

      $gameCreationScreenTitle.text('Setup teams: ');

      $gameCreationColumn.append($gameCreationScreenTitle);

      // get previous values from localstorage if any available
      const valesToGet = {
        teamName0: '',
        teamName1: '',
        teamName2: '',
        teamName3: '',
        teamScore0: '',
        teamScore1: '',
        teamScore2: '',
        teamScore3: '',
      };

      const valesToPopulate = this._localStorageLibrary.getMultiple(valesToGet);

      // create the form fields
      for (let i = 0; i < 4; ++i) {
        const $teamLabel = $('<label>');

        $teamLabel.text(`team ${(i + 1).toString()}:`);

        $gameCreationForm.append($teamLabel);

        const $nameInputFieldFormGroup = $('<div class="input-group">');

        const $nameInputField = $(`<input type="text" id="teamName${i}" name="teamName${i}" class="form-control">`);

        $nameInputField.prop('placeholder', 'enter a team name');

        if (valesToPopulate[`teamName${i}`] !== null) {
          $nameInputField.val(valesToPopulate[`teamName${i}`]);
        }

        const $nameInputGroupAddonIcon = $('<span class="input-group-addon"><i class="material-icons md-18">face</i></span>');

        $nameInputFieldFormGroup.append($nameInputField);
        $nameInputFieldFormGroup.append($nameInputGroupAddonIcon);

        $gameCreationForm.append($nameInputFieldFormGroup);

        $gameCreationForm.append($('<br>'));

        const $scoreInputFieldFormGroup = $('<div class="input-group">');

        const $scoreInputField = $(`<input type="text" id="teamScore${i}" name="teamScore${i}" class="form-control">`);

        $scoreInputField.prop('placeholder', 'enter a player score');

        if (valesToPopulate[`teamScore${i}`] !== null) {
          $scoreInputField.val(valesToPopulate[`teamScore${i}`]);
        }

        const $scoreInputGroupAddonIcon = $('<span class="input-group-addon"><i class="material-icons md-18">star_border</i></span>');

        $scoreInputFieldFormGroup.append($scoreInputField);
        $scoreInputFieldFormGroup.append($scoreInputGroupAddonIcon);

        $gameCreationForm.append($scoreInputFieldFormGroup);

        $gameCreationForm.append($('<br>'));
      }

      const $playlistLabel = $('<label>');

      $playlistLabel.text('playlist:');

      $gameCreationForm.append($playlistLabel);

      const $playlistSelectFormGroup = $('<div class="input-group">');

      const $playlistSelect = $('<select id="playlistId" name="playlistId" class="form-control">');

      // default option
      const $playlistOption = $('<option value="0">');

      $playlistOption.text('select a playlist');

      $playlistSelect.append($playlistOption);

      // the playlists selection
      playlistsOptions.forEach((playlistOption: IPlaylistsOption) => {
        const $playlistOption = $(`<option value="${playlistOption.id}">`);

        $playlistOption.text(playlistOption.title);

        $playlistSelect.append($playlistOption);
      });

      const $playlistInputGroupAddonIcon = $('<span class="input-group-addon"><i class="material-icons md-18">queue_music</i></span>');

      $playlistSelectFormGroup.append($playlistSelect);
      $playlistSelectFormGroup.append($playlistInputGroupAddonIcon);

      $gameCreationForm.append($playlistSelectFormGroup);

      $gameCreationForm.append($('<br>'));

      // the form submit button
      const $submitButton = $('<button type="submit" class="btn btn-primary js-game-set-up-submit-button">');

      $submitButton.text('submit');

      $gameCreationForm.append($submitButton);

      $gameCreationColumn.append($gameCreationForm);

      $gameCreationForm.off('submit');
      $gameCreationForm.on('submit', this._onGameCreationFormSubmit.bind(this));
    }

    protected _onGameCreationFormSubmit(event: JQueryEventObject): void {
      event.preventDefault();

      // clear the errors container
      const $formErrorsContainer = this._$container.find('.js-form-errors');

      $formErrorsContainer.empty();

      // serialize the form data
      const formSerialize: Array<{ name: string; value: string }> = $(event.currentTarget).serializeArray();
      const formData: { [key: string]: string } = {};

      for (let i = 0; i < formSerialize.length; ++i) {
        formData[formSerialize[i].name] = formSerialize[i].value;
      }

      // check for errors in the form
      let formHasError = false;

      // check if at least two teams have been defined
      let playersCount = 0;

      for (const key in formData) {
        if (key.includes('teamName') && formData[key] !== '') {
          playersCount++;
        }
      }

      if (playersCount < 2) {
        const playerCountError = $('<li>');

        playerCountError.text('you must add at least two players');

        $formErrorsContainer.append(playerCountError);

        formHasError = true;
      }

      // check if a playlist has been selected
      if (formData.playlistId === '0') {
        const noPlaylistError = $('<li>');

        noPlaylistError.text('you must select a playlist');

        $formErrorsContainer.append(noPlaylistError);

        formHasError = true;
      }

      if (formHasError) {
        return;
      }

      // add progress animation to submit button
      const $submitButton = $(event.target).find('.js-game-set-up-submit-button');

      $submitButton.addClass('m-progress');

      // get form info and send it to server
      this._socket.emit('initializeGame', formData);

      // first clear all values
      const resetValues = {
        playlistId: '',
        teamName0: '',
        teamName1: '',
        teamName2: '',
        teamName3: '',
        teamScore0: '',
        teamScore1: '',
        teamScore2: '',
        teamScore3: '',
      };

      this._localStorageLibrary.removeMultiple(resetValues);

      // save the player name and scores in localstorage for next time
      this._localStorageLibrary.setMultiple(formData);
    }

    protected _onPlayerPressedButton(playerId: number) {
      if (this._gameHasStarted) {
        // check if song is playing, else dismiss the click
        if (this._isSongPlaying) {
          // if the song was playing and a player pressed then the
          // player screen will have stopped the song
          this._isSongPlaying = false;

          this._showValidateAnswerContainer(true);

          this._latestPlayerId = playerId;

          // remove the progress indicator from the play song button
          const $buttonPlaySong = this._$container.find('.js-play-song-button');

          $buttonPlaySong.removeClass('m-progress');

          // activate the player row of the player that pressed
          this._activatePlayerRow();

          // inform arduino current selected player
          this._socket.emit('selectPlayer', playerId, true);
        }
      } else {

        // TODO: check if all players are ready
        // TODO: display the game screen

      }
    }

    protected _buildGameScreen() {
      // build the screen
      this._$container.empty();

      // some space
      this._$container.append($('<br>'));

      // game master main row
      const $gameMasterMainRow = $('<div class="d-flex flex-row js-gamemaster-main-row">');

      // create three columns
      const $columnOne = $('<div class="col-4 d-flex flex-column align-items-stretch js-gamemaster-column-one">');
      const $columnTwo = $('<div class="col-4 d-flex flex-column align-items-stretch js-gamemaster-column-two">');
      const $columnThree = $('<div class="col-4 d-flex flex-column align-items-stretch js-gamemaster-column-three">');

      $gameMasterMainRow.append($columnOne);
      $gameMasterMainRow.append($columnTwo);
      $gameMasterMainRow.append($columnThree);

      this._$container.append($gameMasterMainRow);

      // game master music controls
      const $buttonPlaySong = $('<button class="btn btn-primary btn-lg js-play-song-button">');

      $buttonPlaySong.text('Play Song');

      $columnOne.append($buttonPlaySong);

      const onClickButtonPlaySong = (event: Event) => {
        event.preventDefault();

        this._playSong();

        $buttonPlaySong.prop('disabled', true);

        $buttonPlaySong.addClass('m-progress');
      };

      this._$container.off('click', '.js-play-song-button');
      this._$container.on('click', '.js-play-song-button', onClickButtonPlaySong);

      // some space
      $columnOne.append($('<br><br>'));

      // volume bar
      const $volumeSlider = $(`<input type="range" min="0" max="100" value="${this._volume}" step="1" id="js-sound-volume" />`);

      $columnOne.append($volumeSlider);

      const onChangeVolume = (event: Event) => {
        const rangeElement = event.target as HTMLInputElement;
        const value = parseInt(rangeElement.value);

        this._volume = value;

        this._socket.emit('volumeChange', value);
      };

      $volumeSlider.off('change');
      $volumeSlider.on('change', onChangeVolume);

      // some space
      $columnOne.append($('<br><br>'));

      // build the players table
      const $playersTable = $('<table class="table js-players-table">');

      const playersData = this._playersData;
      let playersCount = 0;
      let i: number;

      // check how much players we have
      for (i = 0; i < 4; i++) {
        const nameIndexName = `teamName${i.toString()}`;
        const playerName = playersData[nameIndexName];

        if (playerName !== '') {
          playersCount++;
        }
      }

      let y: number;

      const $playersTableHead = $('<thead>');

      const $playersTableHeadRow = $('<tr class="">');

      const $playerIdHeadColumn = $('<td class="">');
      const $playerNameHeadColumn = $('<td class="">');
      const $playerScoreHeadColumn = $('<td class="">');

      $playerIdHeadColumn.text('id');
      $playerNameHeadColumn.text('name');
      $playerScoreHeadColumn.text('score');

      $playersTableHeadRow.append($playerIdHeadColumn);
      $playersTableHeadRow.append($playerNameHeadColumn);
      $playersTableHeadRow.append($playerScoreHeadColumn);

      $playersTableHead.append($playersTableHeadRow);

      $playersTable.append($playersTableHead);

      // tbody
      const $playersTableBody = $('<tbody>');

      $playersTable.append($playersTableBody);

      // create a table row for each player
      for (y = 0; y < playersCount; y++) {
        const $playersTableRow = $(`<tr class="js-players-table-row js-players-table-row-${y}">`);

        const $playerIdColumn = $('<td class="js-players-table-id-column">');
        const $playerNameColumn = $('<td class="js-players-table-name-column">');
        const $playerScoreColumn = $('<td class="js-players-table-score-column">');

        const nameIndexName = `teamName${y.toString()}`;
        const scoreIndexName = `teamScore${y.toString()}`;

        const playerName = playersData[nameIndexName];
        const playerScore = playersData[scoreIndexName] === '' ? 0 : playersData[scoreIndexName];

        $playerIdColumn.text(y.toString());
        $playerNameColumn.text(playerName);
        $playerScoreColumn.text(playerScore);

        $playersTableRow.append($playerIdColumn);
        $playersTableRow.append($playerNameColumn);
        $playersTableRow.append($playerScoreColumn);

        $playersTableBody.append($playersTableRow);
      }

      $columnOne.append($playersTable);

      // playlist information container
      const $playlistInformationContainer = $('<div class="playlistInformation js-playlist-information">');

      // playlist information
      const $playlistCoverImage = $('<img class="playlistCover js-playlist-cover">');
      const $playlistName = $('<div class="playlistName js-playlist-name">');

      const playlistId = parseInt(this._playersData.playlistId);

      let currentPlaylist: IPlaylistsOption;

      this._playlistsOptions.forEach((playlist) => {
        if (playlist.id === playlistId) {
          currentPlaylist = playlist;
        }
      });

      $playlistCoverImage.prop('src', currentPlaylist.cover);
      $playlistName.text(currentPlaylist.title);

      const $songNumber = $('<div class="songNumber js-song-number">');
      const $numbersDivider = $('<div class="numbersDivider">');
      const $songsTotal = $('<div class="songTotal js-songs-total">');

      const totalSongsCount = this._playlistSongs.length;

      $songNumber.text('1');
      $numbersDivider.text('/');
      $songsTotal.text(totalSongsCount);

      const $songPositionContainer = $('<div class="songPosition">');

      $songPositionContainer.append($songNumber);
      $songPositionContainer.append($numbersDivider);
      $songPositionContainer.append($songsTotal);

      $playlistInformationContainer.append($playlistCoverImage);
      $playlistInformationContainer.append($playlistName);
      $playlistInformationContainer.append($songPositionContainer);

      $columnTwo.append($playlistInformationContainer);

      // some space
      $columnTwo.append($('<br><br>'));

      // player information container
      const $playerInformationContainer = $('<div class="playerInformation js-player-information hidden">');

      // song information
      const $audioPlayerSongName = $('<p class="lead">');
      const $audioPlayerArtistName = $('<p class="lead">');

      $playerInformationContainer.append($audioPlayerSongName);
      $playerInformationContainer.append($audioPlayerArtistName);

      const $songNameTitle = $('<span class="font-weight-bold">');
      const $artistNameTitle = $('<span class="font-weight-bold">');

      $songNameTitle.text('song: ');
      $artistNameTitle.text('artist: ');

      $audioPlayerSongName.append($songNameTitle);
      $audioPlayerArtistName.append($artistNameTitle);

      const $currentSongName = $('<span class="js-current-song-name">');
      const $currentSongArtistName = $('<span class="js-current-song-artist-name">');

      $audioPlayerSongName.append($currentSongName);
      $audioPlayerArtistName.append($currentSongArtistName);

      $columnTwo.append($playerInformationContainer);

      // some space
      $columnTwo.append($('<br><br>'));

      // answer validation box
      const $validateAnswerContainer = $('<div class="js-validate-answer hidden">');

      const $buttonsGroup = $('<div class="btn-group btn-group-lg" role="group" aria-label="Large button group">');

      const $correctButton = $('<button class="btn btn-success js-correct-button">').text('Correct');
      const $wrongButton = $('<button class="btn btn-danger js-wrong-button">').text('Wrong');

      $buttonsGroup.append($correctButton);
      $buttonsGroup.append($wrongButton);

      $validateAnswerContainer.append($buttonsGroup);

      $columnTwo.append($validateAnswerContainer);

      // buzzer sound selection
      const $buzzerSoundSelect = $('<select class="custom-select">');

      const $buzzerSoundSelectOptionMessageAlert = $('<option value="messagealert" selected="selected">Message Alert</option>');
      const $buzzerSoundSelectOptionBuzzer = $('<option value="buzzer">Buzzer</option>');
      const $buzzerSoundSelectOptionNoSound = $('<option value="none">No sound on press buzzer</option>');

      $buzzerSoundSelect.append($buzzerSoundSelectOptionMessageAlert);
      $buzzerSoundSelect.append($buzzerSoundSelectOptionBuzzer);
      $buzzerSoundSelect.append($buzzerSoundSelectOptionNoSound);

      $columnThree.append($buzzerSoundSelect);

      const onChangeBuzzerSoundSelect = (event: Event) => {
        const $buzzerSoundSelect = $(event.target) as JQuery;
        const value = $buzzerSoundSelect.val();

        this._buzzerSound = value;

        this._socket.emit('buzzerSoundSelectChange', value);
      };

      $buzzerSoundSelect.off('change');
      $buzzerSoundSelect.on('change', onChangeBuzzerSoundSelect);

      // some space
      $columnThree.append($('<br><br>'));

      // answer time select
      const $answerTimeSelect = $('<select class="custom-select">');

      const $answerTimeSelectOptionfifteen = $('<option value="15" selected="selected">15 seconds</option>');
      const $answerTimeSelectOptionthirty = $('<option value="30">30 seconds</option>');
      const $answerTimeSelectOptionfourtyfive = $('<option value="45">45 seconds</option>');

      $answerTimeSelect.append($answerTimeSelectOptionfifteen);
      $answerTimeSelect.append($answerTimeSelectOptionthirty);
      $answerTimeSelect.append($answerTimeSelectOptionfourtyfive);

      $columnThree.append($answerTimeSelect);

      const onChangeAnswerTimeSelect = (event: Event) => {
        const $answerTimeSelect = $(event.target) as JQuery;
        const value = parseInt($answerTimeSelect.val());

        this._answerTimeSelect = value;

        this._socket.emit('answerTimeSelect', value);
      };

      $answerTimeSelect.off('change');
      $answerTimeSelect.on('change', onChangeAnswerTimeSelect);

      // some space
      $columnThree.append($('<br><br>'));

      // end game button
      const $buttonEndGame = $('<button class="btn btn-primary js-end-game-button">');

      $buttonEndGame.text('End the game / show score screen');

      $columnThree.append($buttonEndGame);

      const onClickButtonEndGame = (event: Event) => {
        event.preventDefault();

        // TODO: use a nicely designed overlay instead of the native confirm popup

        if (confirm('End the game (and show score screen)?')) {
          this._endGame();
        }
      };

      this._$container.one('click', '.js-end-game-button', onClickButtonEndGame);

      // add song playing counter
      const $songPlayingCounter = $('<div class="js-playing-countdown hidden countdown mastercountdown playingCountdown">');

      this._$container.append($songPlayingCounter);

      // add answer counter
      const $songAnswerCounter = $('<div class="js-answer-countdown hidden countdown mastercountdown answerCountdown">');

      this._$container.append($songAnswerCounter);
    }

    protected _endGame() {
      // send to server event 'endGame'
      this._socket.emit('endGame');

      this._gameHasStarted = false;
      this._currentPlaylistSongIndex = 0;
      this._playlistsOptions = null;

      // infor arduino to reset all players
      this._socket.emit('resetAllPlayers');

      this._showStartSetUpScreen();
    }

    protected _playSong() {
      // if the progress is null, this means no song got
      // played yet or the previous song has ended
      if (this._songPlayingProgress === null) {
        // get the song data
        const songData = this._getSongData();

        // update the audio player ui
        this._updatePlayerUI(songData);

        // tell the player screen to start the song playback
        this._socket.emit('playSong', this._currentPlaylistSongIndex);

        // update the playlist songs index
        this._currentPlaylistSongIndex++;

        // as it's a new round un-mark all rows of players
        // that got marked as cant play this round
        this._unmarkAllPlayerRows();

        // infor arduino to reset all players
        this._socket.emit('resetAllPlayers');
      } else {
        this._socket.emit('resumeSong');
      }
    }

    protected _getSongData() {
      const songData = this._playlistSongs[this._currentPlaylistSongIndex];

      return songData;
    }

    // TODO: this is exactly the same method as we already have in the player controller => refactoring: abstract class
    protected _startSongPlayingCountdown() {
      const $songPlayingCountdown = this._$container.find('.js-playing-countdown');

      $songPlayingCountdown.removeClass('hidden');

      const onSongPlayingInterval = () => {
        if (this._songPlayingProgress !== null) {
          const count = 30 - Math.round(this._songPlayingProgress);

          // deezer songs seem to be a little bit over 30 seconds
          // as we substract the playtime from 30 seconds we need to
          // exclude some potential negative values
          if (count < 0) {
            return;
          }

          $songPlayingCountdown.text(count);
        }
      };

      this._songPlayingIntervalId = window.setInterval(onSongPlayingInterval, 300);
    }

    // TODO: this is exactly the same method as we already have in the player controller => refactoring: abstract class
    protected _stopSongPlayingCountdown() {
      const $songPlayingCountdown = this._$container.find('.js-playing-countdown');

      $songPlayingCountdown.addClass('hidden');
      $songPlayingCountdown.text('');

      this._songPlayingProgress = null;

      clearInterval(this._songPlayingIntervalId);
    }

    // TODO: this is exactly the same method as we already have in the player controller => refactoring: abstract class
    protected _startAnswerCountdown() {
      const $answerCountdown = this._$container.find('.js-answer-countdown');

      $answerCountdown.removeClass('hidden');

      this._answerTimeDuration = this._answerTimeSelect;

      const onAnswerInterval = () => {
        if (this._answerTimeDuration > 0) {
          $answerCountdown.text(this._answerTimeDuration);

          this._answerTimeDuration--;
        } else {
          this._timeToAnswerRunOut();
        }
      };

      this._answerIntervalId = window.setInterval(onAnswerInterval, 1000);
    }

    protected _stopAnswerCountdown() {
      const $answerCountdown = this._$container.find('.js-answer-countdown');

      $answerCountdown.addClass('hidden');
      $answerCountdown.text('');

      clearInterval(this._answerIntervalId);
    }

    protected _showValidateAnswerContainer(display: boolean) {
      const $validateAnswerContainer = this._$container.find('.js-validate-answer');

      const onClickCorrectButton = (event: Event) => {
        event.preventDefault();

        // inform the player view that the answer was correct
        this._socket.emit('answerIsCorrect');

        // update the player score by one
        this._incrementPlayerScore();

        // re-enable the play button
        const buttonText = 'Play (next song)';
        const actionType = 'correct';

        this._reenablePlayButton(buttonText, actionType);

        // as the answer was correct we can hide the song progress
        this._stopSongPlayingCountdown();

        // hide the validation container
        this._showValidateAnswerContainer(false);

        // stop the answer countdown
        this._stopAnswerCountdown();

        // de-activate the player row
        this._deactivatePlayerRow();
      };

      const onClickWrongButton = (event: Event) => {
        event.preventDefault();

        // inform the player view that the answer was wrong
        this._socket.emit('answerIsWrong');

        // inform arduino to lock player button
        this._socket.emit('lockPlayer', this._latestPlayerId, true);

        // re-enable the play button
        const buttonText = 'Play (resume)';
        const actionType = 'wrong';

        this._reenablePlayButton(buttonText, actionType);

        // hide the validation container
        this._showValidateAnswerContainer(false);

        // stop the answer countdown
        this._stopAnswerCountdown();

        // de-activate the player row
        this._deactivatePlayerRow();

        // mark player row to tell game master that this player
        // had a wrong answer and can't play again this round
        this._markPlayerRowAsCantPlayAgainThisRound();
      };

      $validateAnswerContainer.off('click', '.js-correct-button');
      $validateAnswerContainer.off('click', '.js-wrong-button');

      if (display === true) {
        $validateAnswerContainer.removeClass('hidden');

        $validateAnswerContainer.on('click', '.js-correct-button', onClickCorrectButton);
        $validateAnswerContainer.on('click', '.js-wrong-button', onClickWrongButton);
      } else {
        $validateAnswerContainer.addClass('hidden');
      }
    }

    protected _onSongStarted() {
      // start the song playing countdown
      this._startSongPlayingCountdown();

      // update the playing status
      this._isSongPlaying = true;
    }

    protected _onSongEnded() {
      // stop the song playing countdown
      this._stopSongPlayingCountdown();

      // reactivate the play song button
      const buttonText = 'Play (next song)';
      const actionType = 'ended';

      this._reenablePlayButton(buttonText, actionType, true);

      // update the playing status
      this._isSongPlaying = false;
    }

    protected _reenablePlayButton(buttonText: string, actionType: string, updateProgress = false) {
      const $buttonPlaySong = this._$container.find('.js-play-song-button');

      // check if there are songs left in the playlist
      // if no more songs we don't re-enable the button
      // but only if the song has ended or the answer was wrong, because if
      // the answer was wrong the game can still go on until someone guesses
      // right or the song guess time runs out
      if (((this._currentPlaylistSongIndex + 1) > this._playlistSongs.length)
            && (actionType === 'ended' || actionType === 'correct')) {
        // all the songs of the playlist have been played, game is over
        buttonText = 'playlist end reached / press end the game button';

        $buttonPlaySong.text(buttonText);
      } else {
        // reactivate the play song button
        $buttonPlaySong.prop('disabled', false);

        if (updateProgress) {
          $buttonPlaySong.removeClass('m-progress');
        }

        $buttonPlaySong.text(buttonText);
      }
    }

    protected _onSongPaused(playTimeOffset: number) {
      // update the playing status
      this._isSongPlaying = false;

      this._startAnswerCountdown();
    }

    protected _onSongResumed(playTimeOffset: number) {
      // update the playing status
      this._isSongPlaying = true;
    }

    protected _onSongLoading() {


    }

    protected _onSongProgress(playingProgress: number, maximumValue: number, currentValue: number) {
      this._songPlayingProgress = currentValue;
    }

    protected _updatePlayerUI(songData: any) {
      const $playerInformationContainer = this._$container.find('.js-player-information');

      $playerInformationContainer.removeClass('hidden');

      const $songNameElement = $playerInformationContainer.find('.js-current-song-name');
      const $songArtistNameElement = $playerInformationContainer.find('.js-current-song-artist-name');

      $songNameElement.text(songData.title);
      $songArtistNameElement.text(songData.artist.name);

      const $playlistInformationContainer = this._$container.find('.js-playlist-information');
      const $songNumber = $playlistInformationContainer.find('.js-song-number');

      const currentSongNumber = this._currentPlaylistSongIndex + 1;

      $songNumber.text(currentSongNumber);
    }

    protected _incrementPlayerScore() {
      const $playersTableRow = this._$container.find(`.js-players-table-row-${this._latestPlayerId}`);
      const $playerScoreColumn = $playersTableRow.find('.js-players-table-score-column');

      // console.log(this._playersData);

      const playersData = this._playersData;

      const scoreIndexName = `teamScore${this._latestPlayerId.toString()}`;

      const currentScore = playersData[scoreIndexName] === '' ? 0 : parseInt(playersData[scoreIndexName] as string);

      const newScore = currentScore + 1;

      // update the game master player column
      $playerScoreColumn.text(newScore);

      // update the localstorage
      this._localStorageLibrary.set(scoreIndexName, newScore);

      this._playersData[scoreIndexName] = newScore;
    }

    protected _activatePlayerRow() {
      const $playersTableRow = this._$container.find(`.js-players-table-row-${this._latestPlayerId}`);

      $playersTableRow.addClass('table-info');
    }

    protected _deactivatePlayerRow() {
      const $playersTableRow = this._$container.find(`.js-players-table-row-${this._latestPlayerId}`);

      $playersTableRow.removeClass('table-info');
    }

    protected _markPlayerRowAsCantPlayAgainThisRound() {
      const $playersTableRow = this._$container.find(`.js-players-table-row-${this._latestPlayerId}`);

      $playersTableRow.addClass('table-danger');
    }

    protected _unmarkAllPlayerRows() {
      const $playersTableRows = this._$container.find('.js-players-table-row');

      $playersTableRows.each((index, element) => {
        $(element).removeClass('table-danger');
      });
    }

    protected _timeToAnswerRunOut() {
      // inform the player view that the answer was wrong
      this._socket.emit('timeToAnswerRunOut');

      // re-enable the play button
      const $buttonPlaySong = this._$container.find('.js-play-song-button');

      $buttonPlaySong.text('Play (resume)');
      $buttonPlaySong.prop('disabled', false);

      // hide the validation container
      this._showValidateAnswerContainer(false);

      // stop the time to answer counter
      this._stopAnswerCountdown();

      // de-activate the player row
      this._deactivatePlayerRow();
    }
}
