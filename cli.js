#!/usr/bin/env node
var meow = require("meow");
var bemoSprites = require("./index");
var fs = require("fs");

var parseOptions = {
  string: ['sass-path', 'images-dir', 'sprites-dir'],
  alias: {
    'sass-path': ['S', 'sassPath'],
    'sprites-dir': ['s', 'spritesDir'],
    'images-dir': ['i', 'imagesDir'],
  },
};

var description = [
  "Usage",
  "  $ bemo-sprites -i <IMAGES_DIR> -s <SPRITES_DIR> -S <SASS_PATH>",
  "",
  "Options",
  "  -s, --sprites-dir    Directory where PNG images can be found",
  "  -i, --images-dir     Directory where the 1x and 2x sprite files will be generated",
  "  -S, --sass-path      Path where the BEMO SCSS variable file will be generated",
];

var cli = meow(description.join("\n"), parseOptions);
var args = cli.flags;

['imagesDir', 'spritesDir', 'sassPath'].forEach(function(key) {
  if (!args[key]) {
    console.log("Missing --" + key + " argument!");
    process.exit(1);
  }
});

['imagesDir', 'spritesDir'].forEach(function(key) {
  try {
    var stat = fs.statSync(args[key]);
    if (!stat.isDirectory()) {
      console.log(args[key] + " is not a directory!");
      process.exit(1);
    }
  } catch(e) {
    console.log(args[key] + " does not exist!");
    process.exit(1);
  }
});

bemoSprites.generate(args, function(err) {
  if (err) {
    console.log(err.message);
    process.exit(1);
  } else {
    console.log("Done!");
  }
});
