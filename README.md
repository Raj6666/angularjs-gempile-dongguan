# Gemstack Frontend

### Introduction
This is a AngularJS frontend project built by Gulp, Webpack2 and Babel.

### Code Style
It's highly recommended to use an IDE or tool to restrict the code style by `.editorconfig` and `.eslintrc.json`.

### Build & Run

> Note : It's time to use [Yarn](https://yarnpkg.com/) instead of npm to manage the dependencies.

1. Change directory to `gemstack-core-fe`
2. Run `npm i -g yarn webpack eslint gulp serve`
3. Run `yarn` to install dependencies of project
4. Run `npm start` to begin development on [`localhost:8081`](http:\\localhost:8081) with live-reload
5. Run `npm run build` to build the project into `/gemstack-core-fe`
6. Run `serve -p 9000` to start a simple serve in `build/app` on [`localhost:9000`](http:\\localhost:9000)

### Example in server 192.168.6.97:
http://192.168.6.97:8080/gempile-fe-web-dgjk/