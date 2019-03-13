"use strict";

var fs = require("fs");
var path = require("path");
var expect = require("chai").expect();
var should = require("chai").should();
var Flattener = require("../index.js");

describe("Split and convert pdf into images", function() {
  it("Create jpg files", function(done) {

    const fileBuf = fs.readFileSync(__dirname + '/test.pdf', err => console.log(err))
    
    Flattener.flatten(fileBuf).then(res => {
      fs.writeFile("output.pdf", res, err => {
        if (err) console.log(err);
        isFileExists("output.pdf").should.to.be.true;
      });
      done();
    }).catch(err => {
      if (err) console.log(err);
      done();
    })

  });

});

var isFileExists = function(path) {
  try {
    return fs.statSync(path).isFile();
  } catch (e) {
    return false;
  }
};
