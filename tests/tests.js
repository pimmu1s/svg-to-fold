const fs = require("fs");
const foldify = require("../foldify");

const sync_tests = [];

const filenames = Array.from(Array(5)).map((_, i) => `test-0${i + 1}`);
// filenames.push("crane-attr");

// test properties of each of the test file's fold objects
const test_vertices_count = [13, 17, 12, 9, null];
const test_edges_count = [11, 16, 16, 13, null];
const test_edges_m_count = [4, 8, 3, 3, null];
const test_edges_v_count = [4, 6, 4, 4, null];
const test_edges_u_count = [3, 2, 9, 6, null];

const int_match = function (one, two, errorString) {
  // pass. cannot test.
  if (one == null || two == null) { return; }
  if (one !== two) { throw new Error(errorString); }
};

filenames.forEach((name, i) => {
  fs.readFile(`./tests/files/${name}.svg`, "utf8", (err, data) => {
    if (err) { throw err; }

    const fold = foldify(data);

    // test components of fold object
    int_match(fold.vertices_coords.length, test_vertices_count[i],
      `${name} vertices length error`);
    int_match(fold.edges_vertices.length, test_edges_count[i],
      `${name} edges length error`);
    int_match(fold.edges_assignment.filter(a => a === "M" || a === "m").length,
      test_edges_m_count[i],
      `${name} edges mountain crease count error`);
    int_match(fold.edges_assignment.filter(a => a === "V" || a === "v").length,
      test_edges_v_count[i],
      `${name} edges valley crease count error`);
    int_match(fold.edges_assignment.filter(a => ["F", "f", "U", "u"].indexOf(a) !== -1).length,
      test_edges_u_count[i],
      `${name} edges unassigned/mark crease count error`);

    // write fold file
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
sync_tests.push(res_01_mountain_test);
sync_tests.push(res_01_valley_test);


const res_02 = foldify.core.fragment({
  vertices_coords: [[0, 0], [0, 1], [1, 1], [0.5, 0.5]],
  edges_vertices: [[0, 2], [1, 3]],
  edges_assignment: ["M", "V"],
});
const res_02_mountain_test = res_02.edges_assignment
  .filter(a => a === "M" || a === "m").length === 2;
const res_02_valley_test = res_02.edges_assignment
  .filter(a => a === "V" || a === "v").length === 1;
sync_tests.push(res_02_mountain_test);
sync_tests.push(res_02_valley_test);


if (sync_tests.reduce((a, b) => a && b, true)) {
  console.log("all synchronous tests passed");
} else {
  throw new Error("synchronous tests failed");
}
