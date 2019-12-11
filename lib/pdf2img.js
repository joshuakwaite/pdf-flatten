"use strict";

var fs = require('fs');
var gm = require('gm');
var path = require('path');
var async = require('async');

class Pdf2Img {
	options = {
		type: 'jpg',
		// size: 1024,
		density: 600,
		outputdir: null,
		outputname: null,
		page: null
	  };
	
	setOptions(opts) {
	  this.options.type = opts.type || this.options.type;
	  this.options.size = opts.size || this.options.size;
	  this.options.density = opts.density || this.options.density;
	  this.options.outputdir = opts.outputdir || this.options.outputdir;
	  this.options.outputname = opts.outputname || this.options.outputname;
	  this.options.page = opts.page || this.options.page;
	};
	
	getOptions() {
		return this.options;
	};
	
	convert(input) {
		var self = this
		return new Promise (function (resolve, reject) {
			// Make sure it has correct extension
			if (path.extname(path.basename(input)) != '.pdf') {
				return reject({
				result: 'error',
				message: 'Unsupported file type.'
				});
			}

			// Check if input file exists
			if (!self.isFileExists(input)) {
				return reject({
				result: 'error',
				message: 'Input file not found.'
				});
			}

			var stdout = [];
			var output = path.basename(input, path.extname(path.basename(input)));

			// Set output dir
			if (self.options.outputdir) {
				self.options.outputdir = self.options.outputdir + path.sep;
			} else {
				self.options.outputdir = output + path.sep;
			}

			// Create output dir if it doesn't exists
			if (!self.isDirExists(self.options.outputdir)) {
				fs.mkdirSync(self.options.outputdir);
			}

			// Set output name
			if (self.options.outputname) {
				self.options.outputname = self.options.outputname;
			} else {
				self.options.outputname = output;
			}

			async.waterfall([
				// Get pages count
				function(callback) {
				var cmd = 'gm identify -format "%p " "' + input + '"';
				var execSync = require('child_process').execSync;
				var pageCount = execSync(cmd).toString().match(/[0-9]+/g);

				if (!pageCount.length) {
					return callback({
					result: 'error',
					message: 'Invalid page number.'
					}, null);
				}

				// Convert selected page
				if (self.options.page !== null) {
					if (self.options.page < pageCount.length) {
					return callback(null, [self.options.page]);
					} else {
					return callback({
						result: 'error',
						message: 'Invalid page number.'
					}, null);
					}
				}

				return callback(null, pageCount);
				},

				// Convert pdf file
				function(pages, callback) {
				// Use eachSeries to make sure that conversion has done page by page
				async.eachSeries(pages, function(page, callbackmap) {
					var inputStream = fs.createReadStream(input);
					var outputFile = self.options.outputdir + self.options.outputname + '_' + page + '.' + self.options.type;

					self.convertPdf2Img(inputStream, outputFile, parseInt(page), function(error, result) {
					if (error) {
						return callbackmap(error);
					}

					stdout.push(result);
					return callbackmap(error, result);
					});
				}, function(e) {
					if (e) {
					return callback(e);
					}

					return callback(null, {
					result: 'success',
					message: stdout
					});
				});
				}
			], resolve);
		});
	};
	
	convertPdf2Img(input, output, page, callback) {
		var self = this
	  if (input.path) {
		var filepath = input.path;
	  } else {
		return callback({
		  result: 'error',
		  message: 'Invalid input file path.'
		}, null);
	  }
	
	  var filename = filepath + '[' + (page - 1) + ']';
	
	  gm(input, filename)
		.density(self.options.density, self.options.density)
		// .resize(options.size)
		.quality(100)
		.write(output, function(err) {
		  if (err) {
			return callback({
			  result: 'error',
			  message: 'Can not write output file.'
			}, null);
		  }
	
		  if (!(fs.statSync(output)['size'] / 1000)) {
			return callback({
			  result: 'error',
			  message: 'Zero sized output image detected.'
			}, null);
		  }
	
		  var results = {
			page: page,
			name: path.basename(output),
			size: fs.statSync(output)['size'] / 1000.0,
			path: output
		  };
	
		  return callback(null, results);
		});
	};
	
	// Check if directory is exists
	isDirExists(path) {
	  try {
		return fs.statSync(path).isDirectory();
	  } catch (e) {
		return false;
	  }
	}
	
	// Check if file is exists
	isFileExists(path) {
	  try {
		return fs.statSync(path).isFile();
	  } catch (e) {
		return false;
	  }
	}
	
}

module.exports = Pdf2Img;
