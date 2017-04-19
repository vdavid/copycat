# About

A fork of Gtibo's game on Codepen (https://codepen.io/Gthibaud/pen/ryQRYP).

This was a refactoring project. This version of the game is meant to work 100% like the original one.

## How to use

* Clone the repo
* Issue `npm install`
* Start the app with `./node_modules/.bin/webpack`

## Key differences

 * The original game was vanilla Javascript. It was a single 1400 lines long JS file, written in French.
 * This version consists of 18 JS files written in ES6 with Webpack. Needs NPM to work.
 * This is a more heavy-weight version than the original one, but it's meant to be easier to understand and modify.

## History

When I started this refactoring project last week, I hadn't written a game since I was 15. I had pretty much no understanding of the game loop concept. I had never worked with sprites, Webpack (nor with browserify and similar), ES6 classes and import/exports.

My goal with this project was to understand modern Javascript and to refactor this cool game.

I am at this point satisfied with the refactor.

## Thanks

A big thanks to Gitbo for the original game, it's a great idea and implementation. I hope you find my refactor interesting and/or useful. :)

## Plans

From this point on I might go on and change some behavior and design, and add more levels to the game. Or not. :)
