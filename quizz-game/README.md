# Arduino NodeJS Quizz Game

A game using an arduino that sends button input to a nodejs game server  

## start development

### install git  

if you haven't already installed git, do this first  

http://git-scm.com/download  

### project checkout  

if you are reading this you maybe already have a local copy of the project, if not then you can should use git to clone the latest master branch  

to do this you need open your command line tool and use the following command to clone (http://git-scm.com/docs/git-clone) this project into one of your directories (PROJECT_DIRECTORY_PATH)  

```
cd /PROJECT_DIRECTORY_PATH
```  

now clone the project into that directory  

```
git@github.com:chrisweb/nodejs-arduino-game.git
```  

if you are on windows you can also use the github desktop (https://desktop.github.com/) or if your use visual studio as IDE you can use the github for visual studio extension (https://visualstudio.github.com/)  

install github desktop or the visual studio extension, then go to the github open the project main page and click the green "clone or download" button  

### install Nodejs

if you haven't done this already, install nodejs from https://nodejs.org (which includes npm, the nodejs package manager)  

### update npm

to ensure you have the latest version of npm, update npm (https://docs.npmjs.com/getting-started/installing-node), open your command line tool and use the following command  

```
npm install npm@latest -g
```  

to check if you have the latest version type  

```
npm -v
```  

what the latest npm version is can be seen in their package.json https://github.com/npm/npm/blob/latest/package.json  

~~### install yarn~~  

get yarn https://yarnpkg.com/  

or check if it the latest version is already installed  

```
yarn --version
```  

### open project directory  

go into the project directoy if you haven't already and then into the quizz-game directory  

```
cd /PROJECT_DIRECTORY_PATH/quizz-game
```  

~~### install the development dependencies using yarn~~  

use yarn to fetch all the dependencies and put them into the node_modules directory  

```
yarn install
```  

!!! don't use yarn, it has problems dealing with the typescript type definition files  

https://github.com/yarnpkg/yarn/issues/825  
https://github.com/yarnpkg/yarn/issues/656  

### install the development dependencies using npm

use npm to fetch all the dependencies  

```
npm install
```  

This will fetch all the dependencies from https://www.npmjs.org/ that are listed in the project package.json and put them into a directory called node_modules  

!!! If you want to install the dependencies from within a Virtual Machine with a Linux operating system, but your shared folder is in windows then user "npm install --no-bin-link" (as windows does not support symlinks)  

### build the project  

to build the project (create js files from ts source files, copies files, ...), type  

```
gulp build
```  

### start development

while developing I recommend you enable gulp watch to ensure typescript files get compiled on each save

```
gulp watch
```