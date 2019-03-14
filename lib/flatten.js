const hummus = require("hummus");
const fs = require("fs");
const pdf2img = require("./pdf2img");
const util = require("util");
const convertPDF = util.promisify(pdf2img.convert);

fs.mkdirSync(__dirname + "/docs");

const Flattener = function() {};

Flattener.prototype.flatten = async function(buffer, options = {}) {

  pdf2img.setOptions({
    type: options.type || "jpg", // JPG, PNG
    density: options.density|| 200,
    outputdir: __dirname + "/split",
    outputname: "split",
    page: null
  });

  fs.writeFileSync(__dirname + "/docs/originalFile.pdf", buffer, err => {
    if (err) console.log(err);
  });

  return convertPDF(__dirname + "/docs/originalFile.pdf")
    .then(res => {
      const splitFiles = fs
        .readdirSync(__dirname + "/split", err => console.log(err))
        .map(images => __dirname + "/split/" + images)
        .sort(function(a, b) {
          return (
            fs.statSync(a).mtime.getTime() - fs.statSync(b).mtime.getTime()
          );
        });
      const buffer = imagesToPdf(
        splitFiles,
        __dirname + "/docs/combined.pdf"
      );
      return buffer;
    })
    .catch(err => console.log("error: ", err));
};

async function imagesToPdf(paths, resultPath) {
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

  await fs
    .readdirSync(__dirname + "/split/", err => console.log(err))
    .forEach(x =>
      fs.unlink(__dirname + "/split/" + x, err => {
        if (err) throw new Error(err);
      })
    );

  await fs
    .readdirSync(__dirname + "/docs/", err => console.log(err))
    .forEach(x =>
      fs.unlink(__dirname + "/docs/" + x, err => {
        if (err) throw new Error(err);
      })
    );

  return resultBuffer;
}

module.exports = new Flattener();
