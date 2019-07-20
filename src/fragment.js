import math from "../include/math";
// import filter from "../include/fold/filter";
// import {
//   remove_vertices,
//   remove_edges,
//   remove_faces
// } from "./remove";
const point_on_edge_exclusive = function (point, edge0, edge1, epsilon = math.core.EPSILON) {
  const edge0_1 = [edge0[0] - edge1[0], edge0[1] - edge1[1]];
  const edge0_p = [edge0[0] - point[0], edge0[1] - point[1]];
  const edge1_p = [edge1[0] - point[0], edge1[1] - point[1]];
  const dEdge = Math.sqrt(edge0_1[0] * edge0_1[0] + edge0_1[1] * edge0_1[1]);
  const dP0 = Math.sqrt(edge0_p[0] * edge0_p[0] + edge0_p[1] * edge0_p[1]);
  const dP1 = Math.sqrt(edge1_p[0] * edge1_p[0] + edge1_p[1] * edge1_p[1]);
  return Math.abs(dEdge - dP0 - dP1) < epsilon;
};

/**
 * provide arrays as arguments, this will filter out anything undefined
 * @returns {number} length of the longest array
 */
const max_array_length = function (...arrays) {
  return Math.max(...(arrays
    .filter(el => el !== undefined)
    .map(el => el.length)));
};

/* Get the number of vertices, edges, faces in the graph sourcing only their
 * primary key arrays. in the case of abstract graphs, use "implied" functions
 * @returns {number} number of geometry elements
 */
const vertices_count = function ({
  vertices_coords, vertices_faces, vertices_vertices
}) {
  return max_array_length([], vertices_coords,
    vertices_faces, vertices_vertices);
};

const edges_count = function ({
  edges_vertices, edges_faces
}) {
  return max_array_length([], edges_vertices, edges_faces);
};

const faces_count = function ({
  faces_vertices, faces_edges
}) {
  return max_array_length([], faces_vertices, faces_edges);
};

const get_geometry_length = {
  vertices: vertices_count,
  edges: edges_count,
  faces: faces_count
};

/**
 * the generalized method for removing vertices, edges, faces.
 * updates both suffix and prefix arrays (vertices_... and ..._vertices).
 * array indices shift after removal, this updates all relevant arrays.
 *
 * @param key is a string, like "vertices"
 * @param removeIndices, array of numbers, like [1,9,25]
 */
const remove_geometry_key_indices = function (graph, key, removeIndices) {
  const geometry_array_size = get_geometry_length[key](graph);
  const removes = Array(geometry_array_size).fill(false);
  removeIndices.forEach((v) => { removes[v] = true; });
  let s = 0;
  // index_map length is the original length of the geometry (vertices_faces)
  const index_map = removes.map(remove => (remove ? --s : s));
  if (removeIndices.length === 0) { return index_map; }

  // these comments are written as if "vertices" was provided as the key
  const prefix = `${key}_`;
  const suffix = `_${key}`;
  // get all keys like vertices_coords
  const graph_keys = Object.keys(graph);
  const prefixKeys = graph_keys
    .map(str => (str.substring(0, prefix.length) === prefix ? str : undefined))
    .filter(str => str !== undefined);
  // keys like faces_vertices, vertices_vertices (that one counts in both)
  const suffixKeys = graph_keys
    .map(str => (str.substring(str.length - suffix.length, str.length) === suffix
      ? str
      : undefined))
    .filter(str => str !== undefined);
  // update every component that points to vertices_coords
  // these arrays do not change their size, only their contents
  suffixKeys
    .forEach(sKey => graph[sKey]
      .forEach((_, i) => graph[sKey][i]
        .forEach((v, j) => { graph[sKey][i][j] += index_map[v]; })));
  // update every array with a 1:1 relationship to vertices_ arrays
  // these arrays change their size, their contents are untouched
  prefixKeys.forEach((pKey) => {
    graph[pKey] = graph[pKey]
      .filter((_, i) => !removes[i]);
  });
  return index_map;
};

/** Removes vertices, updates all relevant array indices
 *
 * @param {vertices} an array of vertex indices
 * @example remove_vertices(fold_file, [2,6,11,15]);
 */
const remove_vertices = function (graph, vertices) {
  return remove_geometry_key_indices(graph, "vertices", vertices);
  // todo: do the same with frames in file_frames where inherit=true
};

const equivalent = function (a, b, epsilon = math.core.EPSILON) {
  for (let i = 0; i < a.length; i += 1) {
    if (Math.abs(a[i] - b[i]) > epsilon) {
      return false;
    }
  }
  return true;
};

const make_edges_alignment = function ({ vertices_coords, edges_vertices }) {
  const edges = edges_vertices
    .map(ev => ev.map(v => vertices_coords[v]));
  const edges_vector = edges.map(e => [e[1][0] - e[0][0], e[1][1] - e[0][1]]);
  const edges_magnitude = edges_vector
    .map(e => Math.sqrt(e[0] * e[0] + e[1] * e[1]));
  const edges_normalized = edges_vector
    .map((e, i) => [e[0] / edges_magnitude[i], e[1] / edges_magnitude[i]]);
  return edges_normalized.map(e => Math.abs(e[0]) > 0.707);
};

const make_edges_intersections = function ({
  vertices_coords, edges_vertices
}, epsilon = math.core.EPSILON) {
  const edge_count = edges_vertices.length;
  const edges = edges_vertices
    .map(ev => ev.map(v => vertices_coords[v]));
  // build an NxN matrix of edge crossings
  //     0  1  2  3
  // 0 [  , x,  ,  ]
  // 1 [ x,  ,  , x]
  // 2 [  ,  ,  ,  ]
  // 3 [  , x,  ,  ]
  //
  // this example has crossings between 0 and 1, and 1 and 3.
  // because the lower triangle is duplicate info, we only store one half
  //
  // if two edges end at the same endpoint this DOES NOT consider them touching
  const crossings = Array.from(Array(edge_count - 1)).map(() => []);
  for (let i = 0; i < edges.length - 1; i += 1) {
    for (let j = i + 1; j < edges.length; j += 1) {
      crossings[i][j] = math.core.intersection.edge_edge_exclusive(
        edges[i][0], edges[i][1],
        edges[j][0], edges[j][1],
        epsilon
      );
    }
  }
  // build a list for each edge containing the intersection points
  //
  // 0 [ [0.25, 0.125] ]
  // 1 [ [0.25, 0.125], [0.99, 0.88] ]
  // 2 [ ]
  // 3 [ [0.99, 0.88] ]
  //
  const edges_intersections = Array.from(Array(edge_count)).map(() => []);
  for (let i = 0; i < edges.length - 1; i += 1) {
    for (let j = i + 1; j < edges.length; j += 1) {
      if (crossings[i][j] != null) {
        // keep in mind - these are shallow pointers
        edges_intersections[i].push(crossings[i][j]);
        edges_intersections[j].push(crossings[i][j]);
      }
    }
  }
  return edges_intersections;
  // let edges_intersections2 = Array.from(Array(edge_count)).map(_ => []);
  // for (let i = 0; i < edges.length-1; i++) {
  //  for (let j = i+1; j < edges.length; j++) {
  //    if (crossings[i][j] != null) {
  //      // warning - these are shallow pointers
  //      edges_intersections2[i].push({edge:j, intersection:crossings[i][j]});
  //      edges_intersections2[j].push({edge:i, intersection:crossings[i][j]});
  //    }
  //  }
  // }
};

const make_edges_collinearVertices = function ({
  vertices_coords, edges_vertices
}, epsilon = math.core.EPSILON) {
  const edges = edges_vertices
    .map(ev => ev.map(v => vertices_coords[v]));
  return edges.map(e => vertices_coords
    .filter(v => point_on_edge_exclusive(v, e[0], e[1], epsilon)));
};

/**
 * fragment splits overlapping edges at their intersections
 * and joins new edges at a new shared vertex.
 * this destroys and rebuilds all face data with face walking
 */
const fragment = function (graph, epsilon = math.core.EPSILON) {
  const horizSort = function (a, b) { return a[0] - b[0]; };
  const vertSort = function (a, b) { return a[1] - b[1]; };
  // const horizSort2 = function (a,b){
  //  return a.intersection[0] - b.intersection[0]; }
  // const vertSort2 = function (a,b){
  //  return a.intersection[1] - b.intersection[1]; }

  // when we rebuild an edge we need the intersection points sorted so we can
  // walk down it and rebuild one by one. should the walk proceed
  // horizontally or vertically?
  const edges_alignment = make_edges_alignment(graph);

  const edges = graph.edges_vertices
    .map(ev => ev.map(v => graph.vertices_coords[v]));

  edges.forEach((e, i) => e.sort(edges_alignment[i] ? horizSort : vertSort));

  // for each edge, get all the intersection points
  const edges_intersections = make_edges_intersections(graph, epsilon);

  // this does 2 very important things
  // 1) gather all the intersection points (that don't count as crossings)
  //    where an edge ends somewhere along the middle of this edge.
  // 2) get the edges endpoints. needed for when we re-build the edge.
  const edges_collinearVertices = make_edges_collinearVertices(graph, epsilon);

  const new_edges_vertices = edges_intersections
    .map((a, i) => a.concat(edges_collinearVertices[i]));

  new_edges_vertices.forEach((e, i) => e
    .sort(edges_alignment[i] ? horizSort : vertSort));
  // edges_intersections2.forEach((e,i) =>
  //  e.sort(edges_alignment[i] ? horizSort2 : vertSort2)
  // )

  let new_edges = new_edges_vertices
    // .map((e, i) => [edges[i][0], ...e, edges[i][1]])
    .map(ev => Array.from(Array(ev.length - 1))
      .map((_, i) => [ev[i], ev[(i + 1)]]));

  // remove degenerate edges
  new_edges = new_edges
    .map(edgeGroup => edgeGroup
      .filter(e => false === e
        .map((_, i) => Math.abs(e[0][i] - e[1][i]) < epsilon)
        .reduce((a, b) => a && b, true)));

  // let edge_map = new_edges.map(edge => edge.map(_ => counter++));
  const edge_map = new_edges
    .map((edge, i) => edge.map(() => i))
    .reduce((a, b) => a.concat(b), []);

  // console.log("edge_map", edge_map);

  const vertices_coords = new_edges
    .map(edge => edge.reduce((a, b) => a.concat(b), []))
    .reduce((a, b) => a.concat(b), []);
  let counter = 0;
  const edges_vertices = new_edges
    .map(edge => edge.map(() => [counter++, counter++]))
    .reduce((a, b) => a.concat(b), []);

  const vertices_equivalent = Array
    .from(Array(vertices_coords.length)).map(() => []);
  for (let i = 0; i < vertices_coords.length - 1; i += 1) {
    for (let j = i + 1; j < vertices_coords.length; j += 1) {
      vertices_equivalent[i][j] = equivalent(
        vertices_coords[i],
        vertices_coords[j],
        epsilon
      );
    }
  }

  // console.log(vertices_equivalent);

  const vertices_map = vertices_coords.map(() => undefined);
  vertices_equivalent
    .forEach((row, i) => row
      .forEach((eq, j) => {
        if (eq) {
          vertices_map[j] = vertices_map[i] === undefined
            ? i
            : vertices_map[i];
        }
      }));

  const vertices_remove = vertices_map.map(m => m !== undefined);
  vertices_map.forEach((map, i) => {
    if (map === undefined) { vertices_map[i] = i; }
  });

  // console.log("vertices_map", vertices_map);

  edges_vertices
    .forEach((edge, i) => edge
      .forEach((v, j) => {
        edges_vertices[i][j] = vertices_map[v];
      }));

  const flat = {
    vertices_coords,
    edges_vertices
  };

  if ("edges_assignment" in graph === true) {
    flat.edges_assignment = edge_map.map(i => graph.edges_assignment[i]);
  }
  if ("edges_foldAngle" in graph === true) {
    flat.edges_foldAngle = edge_map.map(i => graph.edges_foldAngle[i]);
  }

  // console.log("edges_vertices", edges_vertices);
  // console.log("vertices_remove", vertices_remove);
  const vertices_remove_indices = vertices_remove
    .map((rm, i) => (rm ? i : undefined))
    .filter(i => i !== undefined);
  remove_vertices(flat, vertices_remove_indices);

  // console.log(flat);

  // convert.edges_vertices_to_vertices_vertices_sorted(flat);
  // convert.vertices_vertices_to_faces_vertices(flat);
  // convert.faces_vertices_to_faces_edges(flat);

  return flat;
};

export default fragment;
