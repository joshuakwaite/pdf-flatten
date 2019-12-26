const hummus = require("hummus");
const fs = require("fs");
const _pdf2img = require("./pdf2img");
const rimraf = require("rimraf");

const Flattener = function() {};

Flattener.prototype.flatten = async function(buffer, options = {}) {
  
	var path = options.path || __dirname;
	// Make the path relatively unique to better support concurrent processing
	var timestamp = Date.now() + Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);
	path = path + "/" + timestamp;

	if (!isDirExists(path)) {
		fs.mkdirSync(path);
	}
  if (!isDirExists(path + "/docs")) {
    fs.mkdirSync(path + "/docs");
  }

  var pdf2img = new _pdf2img();

  pdf2img.setOptions({
    type: options.type || "jpg", // JPG, PNG
    density: options.density || 200,
    outputdir: path + "/split",
    outputname: "split",
    page: null
  });

  fs.writeFileSync(path + "/docs/originalFile.pdf", buffer, err => {
    if (err) console.log(err);
  });

  return pdf2img.convert(path + "/docs/originalFile.pdf")
    .then(res => {
      const splitFiles = fs
        .readdirSync(path + "/split", err => console.log(err))
        .map(images => path + "/split/" + images)
        .sort(function(a, b) {
          return (
            fs.statSync(a).mtime.getTime() - fs.statSync(b).mtime.getTime()
          );
        });
      const buffer = imagesToPdf(splitFiles, path, path + "/docs/combined.pdf");
      return buffer;
    })
    .catch(err => console.log("error: ", err));
};

async function imagesToPdf(paths, directoryPath, resultPath) {
  if (!Array.isArray(paths) || paths.length === 0) {
    throw new Error("Must have at least one path in array");
  }
  const pdfWriter = hummus.createWriter(resultPath);
  paths.forEach(path => {
    const { width, height } = pdfWriter.getImageDimensions(path);
    const page = pdfWriter.createPage(0, 0, width, height);
    pdfWriter.startPageContentContext(page).drawImage(0, 0, path);
    pdfWriter.writePage(page);
  });
  pdfWriter.end();

  const resultBuffer = fs.readFileSync(resultPath, err => {
    if (err) throw new Error(err);
  });

  rimraf.sync(directoryPath);

  return resultBuffer;
}

// Check if directory is exists
var isDirExists = function(path) {
  try {
    return fs.statSync(path).isDirectory();
  } catch (e) {
    return false;
  }
};

module.exports = new Flattener();
