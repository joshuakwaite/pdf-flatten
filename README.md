# pdf-flatten

A nodejs module for flattening a PDF file. 

This comes in handy when signatures, text, or images aren't sticking to a PDF file after using a tool to copy/convert a pdf like hummus or PDFTK.

## Dependencies
- GraphicsMagick

Note: Windows users, please be sure GraphicsMagick and Ghostscript are installed (see https://stackoverflow.com/questions/18733695/cimg-error-gm-exe-is-not-recognized-as-an-internal-or-external-command/45783910#45783910 for details) - then it works fine on Windows.

#### Ubuntu

    sudo apt-get install graphicsmagick

#### OSX

    brew install graphicsmagick

## Installation
```
  $ [sudo] npm install pdf-flatten
```

## Usage



```javascript
const fs = require('fs');
const flattener = require('pdf-flatten');
 
const inputBuffer = fs.readFileSync(__dirname + '/test.pdf', err => { throw new Error(err) });
 
 // the flatten() method takes a buffer as an input
flattener.flatten(inputBuffer).then(res => {
  console.log(res) // output is the flattened pdf via a buffer as well
  fs.writeFileSync('outputFile.pdf', res, err => { throw new Error(err) });
})
```

#### Options
You can increase the conversion pixel density to your liking, the default is 200 if nothing is provided.
```javascript
flattener.flatten(inputBuffer, {density: 600}).then(res => {
  console.log(res) // output is the flattened pdf via a buffer
  fs.writeFileSync('outputFile.pdf', res, err => { throw new Error(err) });
})
```

## Maintainer
[Josh Waite][0]

## License
MIT

[0]: https://github.com/joshuakwaite
