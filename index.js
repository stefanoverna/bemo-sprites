var fs = require("fs");
var path = require("path");
var glob = require("glob");
var async = require("async");
var ejs = require("ejs");
var Spritesmith = require('spritesmith');
var lwip = require('lwip');

module.exports = {
  generate: function(options, cb) {
    async.waterfall([
      this.generateImagePaths.bind(
        this,
        options.spritesDir
      ),
      this.generateRetinaSprite.bind(
        this,
        path.join(options.imagesDir, "sprites-2x.png")
      ),
      this.generateSass.bind(
        this,
        options.sassPath
      ),
      this.generateSprite.bind(
        this,
        path.join(options.imagesDir, "sprites-2x.png"),
        path.join(options.imagesDir, "sprites-1x.png")
      ),
    ], cb);
  },
  generateImagePaths(imagesDir, cb) {
    glob(path.join(imagesDir, "*.png"), function (err, files) {
      if (err) {
        return cb(err);
      }

      if (files.length === 0) {
        return cb(new Error("no images found at " + imagesDir));
      }

      cb(null, files);
    });
  },
  generateRetinaSprite: function(spritePath, paths, cb) {
    Spritesmith.run({ src: paths }, function(err, result) {
      fs.writeFile(
        spritePath,
        result.image,
        function(err) {
          if (err) {
            cb(err);
          } else {
            cb(null, result);
          }
        }
      );
    });
  },
  generateSass: function(sassPath, result, cb) {
    var template = ejs.compile(
      fs.readFileSync(
        path.join(__dirname, '_sprites.scss.ejs'),
        'utf-8'
      )
    );

    var sprites = [];
    for (var imagePath in result.coordinates) {
      result.coordinates[imagePath].name = path.basename(imagePath, ".png");
      sprites.push(result.coordinates[imagePath]);
    }

    fs.writeFile(
      sassPath,
      template({ image: result.properties, sprites: sprites } ),
      function(err) {
        if (err) {
          cb(err);
        } else {
          cb(null, sprites);
        }
      }
    );
  },
  generateSprite: function(sourcePath, destPath, sprites, cb) {
    lwip.open(sourcePath, function(err, image) {
      image.batch()
      .scale(0.5)
      .writeFile(destPath, cb);
    });
  }
}
