// import { fragment } from "./graph";
// import * as SVG from "../../include/svg";
// import { bounding_rect, fragment } from "../fold/planargraph";
// import * as FoldToSVG from "../draw/toSVG";

/** parser error to check against */
// let pErr = (new DOMParser())
//  .parseFromString("INVALID", "text/xml")
//  .getElementsByTagName("parsererror")[0]
//  .namespaceURI;
// if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
//  console.warn("Firefox users, ignore XML Parsing Error on page load");
// }

// const parseAsXML = function (input) {
//   let xml = (new DOMParser()).parseFromString(input, "text/xml");
//   // let parserErrors = xml.getElementsByTagNameNS(pErr, "parsererror");
//   let parserErrors = xml.getElementsByTagName("parsererror");
//   // let svg = xml.documentElement;
//   let svgs = xml.getElementsByTagName("svg");
//   if (parserErrors.length > 0) {
//     throw "error parsing XML";
//   }
//   if (svgs == null || svgs.length === 0) {
//     throw "error, valid XML found, but no SVG element";
//   }
//   if (svgs.length > 1) {
//     console.warn("found multiple <svg> in one file. using first only");
//   }
//   return svgs[0];
// };

