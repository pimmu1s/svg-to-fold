const fs = require("fs");
const foldify = require("../foldify");

fs.readFile("./tests/files/crane-attr.svg", "utf8", (err, data) => {
  if (err) { throw err; }
  // console.log(data);
  const fold = foldify.SVGtoFOLD(data);
  // console.log(result);
  const json = JSON.stringify(fold);

  fs.writeFile("./tests/output/crane.fold", json, (err2) => {
    if (err2) { throw err2; }
    console.log("SVG -> FOLD result at output/crane.fold");
  });

});
