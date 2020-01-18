# nextjs prototype

## install

create a default next.js app  

`npx create-next-app`  

give the project a name  

when done go into the project folder:  

`cd PROJECT_NAME`  

adding typescript:  

official documentation: [nextjs typescript](https://nextjs.org/docs#typescript)  

`npm install --save-dev @types/react @types/node`  

first create an empty tsconfig.json file in the root folder of the project  

install typescript:  

`npm install --save-dev --save-exact typescript`  

now enter the npm command that you would also use to launch the dev server (this time however it will also populate the blank tsconfig.json you created earlier with default values)

now you already have an up and running nextjs server, type 127.0.0.1:3000 to view the result in your browser

change the extension of the example page in the pages folder: pages/index.js to pages/index.tsx, then change any value in the html of that file and finally save the file

now go back to the browser and you will see that the typescript compilation and the reloading of the page in the browser happend automatically

now lets also add the airbnb eslint rules package and eslint itself to our project, with the following command:

`npx install-peerdeps --dev eslint-config-airbnb`

you might also want to check out the [airbnb javascript / react style guide](https://airbnb.io/javascript/react/)

now create an .eslintrc.json file and add the following to it (or create a custom one using this command `./node_modules/.bin/eslint --init`):

```json
{
    "env": {
        "browser": true,
        "node": true,
        "es6": true
    },
    "extends": [
        "airbnb",
        "airbnb/hooks"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
    }
}
```

now lets add two dependcies (the eslint typeScript plugin and the eslint typeScript parser) that are useful for typescript:

`npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser`

and add the following to the .eslintrc.json file:

```json
{
    "parser": "@typescript-eslint/parser",
    "plugins": [
        "react",
        "@typescript-eslint"
    ],
    "extends": [
        "airbnb",
        "airbnb/hooks",
        "plugin:@typescript-eslint/recommended"
    ]
}
```

if you use vscode, vscode will use your eslint rules, you just need to install the eslint extension, to do so press Ctrl+Shift+X and then search for "eslint" and finally add this to your vscode settings:

```json
{
    "eslint.alwaysShowStatus": true,
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact"
    ]
}
```

if you also want to have an npm command to lint your files, in your package.json add the following command to the "scripts" section:

```json
{
  "scripts": {
    "lint": "./node_modules/.bin/eslint pages/*"
  }
}
```