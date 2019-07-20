const fs = require("fs");
const foldify = require("../foldify");

const tests = [];

const filenames = Array.from(Array(5)).map((_, i) => `test-0${i + 1}`);

filenames.forEach((name) => {
  fs.readFile(`./tests/files/${name}.svg`, "utf8", (err, data) => {
    if (err) { throw err; }
    const fold = foldify(data);
    const json = JSON.stringify(fold, null, 2);
    fs.writeFile(`./tests/output/${name}.fold`, json, (err2) => {
      if (err2) { throw err2; }
      console.log(`SVG -> FOLD result at output/${name}.fold`);
    });
  });
});

const res_01 = foldify.core.fragment({
  vertices_coords: [[0, 0], [0, 1], [1, 1], [1, 0]],
  edges_vertices: [[0, 2], [1, 3]],
  edges_assignment: ["M", "V"],
});
const res_01_mountain_test = res_01.edges_assignment
  .filter(a => a === "M" || a === "m").length === 2;
const res_01_valley_test = res_01.edges_assignment
  .filter(a => a === "V" || a === "v").length === 2;
tests.push(res_01_mountain_test);
tests.push(res_01_valley_test);


// const res_02 = foldify.core.fragment({
//   vertices_coords: [[0, 0], [0, 1], [1, 1], [0.5, 0.5]],
//   edges_vertices: [[0, 2], [1, 3]],
//   edges_assignment: ["M", "V"],
// });
// console.log("res_02", res_02);
// const res_02_mountain_test = res_02.edges_assignment
//   .filter(a => a === "M" || a === "m").length === 2;
// const res_02_valley_test = res_02.edges_assignment
//   .filter(a => a === "V" || a === "v").length === 1;
// tests.push(res_02_mountain_test);
// tests.push(res_02_valley_test);

// fs.readFile("./tests/files/crane-attr.svg", "utf8", (err, data) => {
//   if (err) { throw err; }
//   // console.log(data);
//   const fold = foldify.SVGtoFOLD(data);
//   // console.log(result);
//   const json = JSON.stringify(fold);

//   fs.writeFile("./tests/output/crane.fold", json, (err2) => {
//     if (err2) { throw err2; }
//     console.log("SVG -> FOLD result at output/crane.fold");
//   });
// });

if (tests.reduce((a, b) => a && b, true)) {
  console.log("all tests passed");
} else {
  throw new Error("test failed");
}
