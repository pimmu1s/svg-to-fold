import Segmentize from "../include/svg-segmentize";
import color_to_assignment from "./color_to_assignment";

// edge assignment to fold angle
const assignment_foldAngle = {
  V: 180,
  v: 180,
  M: -180,
  m: -180,
};

const ea_to_fa = function (assignment) {
  return assignment_foldAngle[assignment] || 0;
};

const emptyFOLD = function () {
  return {
    file_spec: 1.1,
    file_creator: "Rabbit Ear",
    file_classes: ["singleModel"],
    frame_title: "",
    frame_classes: ["creasePattern"],
    frame_attributes: ["2D"],
    vertices_coords: [],
    vertices_vertices: [],
    vertices_faces: [],
    edges_vertices: [],
    edges_faces: [],
    edges_assignment: [],
    edges_foldAngle: [],
    edges_length: [],
    faces_vertices: [],
    faces_edges: [],
  };
};

const getSegmentAssignment = function (segment) {
  if (segment[4] != null) {
    const strokeColor = segment[4].stroke;
    if (strokeColor != null) {
      return color_to_assignment(strokeColor);
    }
  }
  return "U";
};

export const svg_to_fold = function (svg) {
  const graph = emptyFOLD();
  const v0 = graph.vertices_coords.length;
  const segments = Segmentize(svg);

  graph.vertices_coords = segments
    .map(s => [[s[0], s[1]], [s[2], s[3]]])
    .reduce((a, b) => a.concat(b), []);

  // return graph;

  graph.edges_vertices = segments.map((_, i) => [v0 + i * 2, v0 + i * 2 + 1]);
  graph.edges_assignment = segments.map(l => getSegmentAssignment(l));
  graph.edges_foldAngle = graph.edges_assignment.map(a => ea_to_fa(a));

  // console.log(fragment(graph));
  // console.log("svg_to_fold");
  // todo: import semgents into a planar graph, handle edge crossings

  // Graph.makeComplete(graph);
  return graph;
};

export default svg_to_fold;
