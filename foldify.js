/* (c) Robby Kraft, MIT License */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.foldify = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  var isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";
  var isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
  var isWebWorker = (typeof self === "undefined" ? "undefined" : _typeof(self)) === "object" && self.constructor && self.constructor.name === "DedicatedWorkerGlobalScope";

  var htmlString = "<!DOCTYPE html><title>a</title>";
  var win = {};

  if (isNode) {
    var _require = require("xmldom"),
        DOMParser = _require.DOMParser,
        XMLSerializer = _require.XMLSerializer;

    win.DOMParser = DOMParser;
    win.XMLSerializer = XMLSerializer;
    win.document = new DOMParser().parseFromString(htmlString, "text/html");
  } else if (isBrowser) {
    win.DOMParser = window.DOMParser;
    win.XMLSerializer = window.XMLSerializer;
    win.document = window.document;
  }

  function _toConsumableArray$1(arr) {
    return _arrayWithoutHoles$1(arr) || _iterableToArray$1(arr) || _nonIterableSpread$1();
  }

  function _arrayWithoutHoles$1(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    }
  }

  function _iterableToArray$1(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread$1() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  var length = {
    a: 7,
    c: 6,
    h: 1,
    l: 2,
    m: 2,
    q: 4,
    s: 4,
    t: 2,
    v: 1,
    z: 0
  };
  var segment = /([astvzqmhlc])([^astvzqmhlc]*)/ig;

  function parse(path) {
    var data = [];
    path.replace(segment, function (_, command, args) {
      var type = command.toLowerCase();
      args = parseValues(args);

      if (type === 'm' && args.length > 2) {
        data.push([command].concat(args.splice(0, 2)));
        type = 'l';
        command = command === 'm' ? 'l' : 'L';
      }

      while (args.length >= 0) {
        if (args.length === length[type]) {
          args.unshift(command);
          return data.push(args);
        }

        if (args.length < length[type]) {
          throw new Error('malformed path data');
        }

        data.push([command].concat(args.splice(0, length[type])));
      }
    });
    return data;
  }

  var number = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/ig;

  function parseValues(args) {
    var numbers = args.match(number);
    return numbers ? numbers.map(Number) : [];
  }

  function Bezier(ax, ay, bx, by, cx, cy, dx, dy) {
    return new Bezier$1(ax, ay, bx, by, cx, cy, dx, dy);
  }

  function Bezier$1(ax, ay, bx, by, cx, cy, dx, dy) {
    this.a = {
      x: ax,
      y: ay
    };
    this.b = {
      x: bx,
      y: by
    };
    this.c = {
      x: cx,
      y: cy
    };
    this.d = {
      x: dx,
      y: dy
    };

    if (dx !== null && dx !== undefined && dy !== null && dy !== undefined) {
      this.getArcLength = getCubicArcLength;
      this.getPoint = cubicPoint;
      this.getDerivative = cubicDerivative;
    } else {
      this.getArcLength = getQuadraticArcLength;
      this.getPoint = quadraticPoint;
      this.getDerivative = quadraticDerivative;
    }

    this.init();
  }

  Bezier$1.prototype = {
    constructor: Bezier$1,
    init: function init() {
      this.length = this.getArcLength([this.a.x, this.b.x, this.c.x, this.d.x], [this.a.y, this.b.y, this.c.y, this.d.y]);
    },
    getTotalLength: function getTotalLength() {
      return this.length;
    },
    getPointAtLength: function getPointAtLength(length) {
      var t = t2length(length, this.length, this.getArcLength, [this.a.x, this.b.x, this.c.x, this.d.x], [this.a.y, this.b.y, this.c.y, this.d.y]);
      return this.getPoint([this.a.x, this.b.x, this.c.x, this.d.x], [this.a.y, this.b.y, this.c.y, this.d.y], t);
    },
    getTangentAtLength: function getTangentAtLength(length) {
      var t = t2length(length, this.length, this.getArcLength, [this.a.x, this.b.x, this.c.x, this.d.x], [this.a.y, this.b.y, this.c.y, this.d.y]);
      var derivative = this.getDerivative([this.a.x, this.b.x, this.c.x, this.d.x], [this.a.y, this.b.y, this.c.y, this.d.y], t);
      var mdl = Math.sqrt(derivative.x * derivative.x + derivative.y * derivative.y);
      var tangent;

      if (mdl > 0) {
        tangent = {
          x: derivative.x / mdl,
          y: derivative.y / mdl
        };
      } else {
        tangent = {
          x: 0,
          y: 0
        };
      }

      return tangent;
    },
    getPropertiesAtLength: function getPropertiesAtLength(length) {
      var t = t2length(length, this.length, this.getArcLength, [this.a.x, this.b.x, this.c.x, this.d.x], [this.a.y, this.b.y, this.c.y, this.d.y]);
      var derivative = this.getDerivative([this.a.x, this.b.x, this.c.x, this.d.x], [this.a.y, this.b.y, this.c.y, this.d.y], t);
      var mdl = Math.sqrt(derivative.x * derivative.x + derivative.y * derivative.y);
      var tangent;

      if (mdl > 0) {
        tangent = {
          x: derivative.x / mdl,
          y: derivative.y / mdl
        };
      } else {
        tangent = {
          x: 0,
          y: 0
        };
      }

      var point = this.getPoint([this.a.x, this.b.x, this.c.x, this.d.x], [this.a.y, this.b.y, this.c.y, this.d.y], t);
      return {
        x: point.x,
        y: point.y,
        tangentX: tangent.x,
        tangentY: tangent.y
      };
    }
  };

  function quadraticDerivative(xs, ys, t) {
    return {
      x: (1 - t) * 2 * (xs[1] - xs[0]) + t * 2 * (xs[2] - xs[1]),
      y: (1 - t) * 2 * (ys[1] - ys[0]) + t * 2 * (ys[2] - ys[1])
    };
  }

  function cubicDerivative(xs, ys, t) {
    var derivative = quadraticPoint([3 * (xs[1] - xs[0]), 3 * (xs[2] - xs[1]), 3 * (xs[3] - xs[2])], [3 * (ys[1] - ys[0]), 3 * (ys[2] - ys[1]), 3 * (ys[3] - ys[2])], t);
    return derivative;
  }

  function t2length(length, total_length, func, xs, ys) {
    var error = 1;
    var t = length / total_length;
    var step = (length - func(xs, ys, t)) / total_length;
    var numIterations = 0;

    while (error > 0.001) {
      var increasedTLength = func(xs, ys, t + step);
      var decreasedTLength = func(xs, ys, t - step);
      var increasedTError = Math.abs(length - increasedTLength) / total_length;
      var decreasedTError = Math.abs(length - decreasedTLength) / total_length;

      if (increasedTError < error) {
        error = increasedTError;
        t += step;
      } else if (decreasedTError < error) {
        error = decreasedTError;
        t -= step;
      } else {
        step /= 2;
      }

      numIterations++;

      if (numIterations > 500) {
        break;
      }
    }

    return t;
  }

  function quadraticPoint(xs, ys, t) {
    var x = (1 - t) * (1 - t) * xs[0] + 2 * (1 - t) * t * xs[1] + t * t * xs[2];
    var y = (1 - t) * (1 - t) * ys[0] + 2 * (1 - t) * t * ys[1] + t * t * ys[2];
    return {
      x: x,
      y: y
    };
  }

  function cubicPoint(xs, ys, t) {
    var x = (1 - t) * (1 - t) * (1 - t) * xs[0] + 3 * (1 - t) * (1 - t) * t * xs[1] + 3 * (1 - t) * t * t * xs[2] + t * t * t * xs[3];
    var y = (1 - t) * (1 - t) * (1 - t) * ys[0] + 3 * (1 - t) * (1 - t) * t * ys[1] + 3 * (1 - t) * t * t * ys[2] + t * t * t * ys[3];
    return {
      x: x,
      y: y
    };
  }

  function getQuadraticArcLength(xs, ys, t) {
    if (t === undefined) {
      t = 1;
    }

    var ax = xs[0] - 2 * xs[1] + xs[2];
    var ay = ys[0] - 2 * ys[1] + ys[2];
    var bx = 2 * xs[1] - 2 * xs[0];
    var by = 2 * ys[1] - 2 * ys[0];
    var A = 4 * (ax * ax + ay * ay);
    var B = 4 * (ax * bx + ay * by);
    var C = bx * bx + by * by;

    if (A === 0) {
      return t * Math.sqrt(Math.pow(xs[2] - xs[0], 2) + Math.pow(ys[2] - ys[0], 2));
    }

    var b = B / (2 * A);
    var c = C / A;
    var u = t + b;
    var k = c - b * b;
    var uuk = u * u + k > 0 ? Math.sqrt(u * u + k) : 0;
    var bbk = b * b + k > 0 ? Math.sqrt(b * b + k) : 0;
    var term = b + Math.sqrt(b * b + k) !== 0 ? k * Math.log(Math.abs((u + uuk) / (b + bbk))) : 0;
    return Math.sqrt(A) / 2 * (u * uuk - b * bbk + term);
  }

  var tValues = [[], [], [-0.5773502691896257, 0.5773502691896257], [0, -0.7745966692414834, 0.7745966692414834], [-0.33998104358485626, 0.33998104358485626, -0.8611363115940526, 0.8611363115940526], [0, -0.5384693101056831, 0.5384693101056831, -0.906179845938664, 0.906179845938664], [0.6612093864662645, -0.6612093864662645, -0.2386191860831969, 0.2386191860831969, -0.932469514203152, 0.932469514203152], [0, 0.4058451513773972, -0.4058451513773972, -0.7415311855993945, 0.7415311855993945, -0.9491079123427585, 0.9491079123427585], [-0.1834346424956498, 0.1834346424956498, -0.525532409916329, 0.525532409916329, -0.7966664774136267, 0.7966664774136267, -0.9602898564975363, 0.9602898564975363], [0, -0.8360311073266358, 0.8360311073266358, -0.9681602395076261, 0.9681602395076261, -0.3242534234038089, 0.3242534234038089, -0.6133714327005904, 0.6133714327005904], [-0.14887433898163122, 0.14887433898163122, -0.4333953941292472, 0.4333953941292472, -0.6794095682990244, 0.6794095682990244, -0.8650633666889845, 0.8650633666889845, -0.9739065285171717, 0.9739065285171717], [0, -0.26954315595234496, 0.26954315595234496, -0.5190961292068118, 0.5190961292068118, -0.7301520055740494, 0.7301520055740494, -0.8870625997680953, 0.8870625997680953, -0.978228658146057, 0.978228658146057], [-0.1252334085114689, 0.1252334085114689, -0.3678314989981802, 0.3678314989981802, -0.5873179542866175, 0.5873179542866175, -0.7699026741943047, 0.7699026741943047, -0.9041172563704749, 0.9041172563704749, -0.9815606342467192, 0.9815606342467192], [0, -0.2304583159551348, 0.2304583159551348, -0.44849275103644687, 0.44849275103644687, -0.6423493394403402, 0.6423493394403402, -0.8015780907333099, 0.8015780907333099, -0.9175983992229779, 0.9175983992229779, -0.9841830547185881, 0.9841830547185881], [-0.10805494870734367, 0.10805494870734367, -0.31911236892788974, 0.31911236892788974, -0.5152486363581541, 0.5152486363581541, -0.6872929048116855, 0.6872929048116855, -0.827201315069765, 0.827201315069765, -0.9284348836635735, 0.9284348836635735, -0.9862838086968123, 0.9862838086968123], [0, -0.20119409399743451, 0.20119409399743451, -0.3941513470775634, 0.3941513470775634, -0.5709721726085388, 0.5709721726085388, -0.7244177313601701, 0.7244177313601701, -0.8482065834104272, 0.8482065834104272, -0.937273392400706, 0.937273392400706, -0.9879925180204854, 0.9879925180204854], [-0.09501250983763744, 0.09501250983763744, -0.2816035507792589, 0.2816035507792589, -0.45801677765722737, 0.45801677765722737, -0.6178762444026438, 0.6178762444026438, -0.755404408355003, 0.755404408355003, -0.8656312023878318, 0.8656312023878318, -0.9445750230732326, 0.9445750230732326, -0.9894009349916499, 0.9894009349916499], [0, -0.17848418149584785, 0.17848418149584785, -0.3512317634538763, 0.3512317634538763, -0.5126905370864769, 0.5126905370864769, -0.6576711592166907, 0.6576711592166907, -0.7815140038968014, 0.7815140038968014, -0.8802391537269859, 0.8802391537269859, -0.9506755217687678, 0.9506755217687678, -0.9905754753144174, 0.9905754753144174], [-0.0847750130417353, 0.0847750130417353, -0.2518862256915055, 0.2518862256915055, -0.41175116146284263, 0.41175116146284263, -0.5597708310739475, 0.5597708310739475, -0.6916870430603532, 0.6916870430603532, -0.8037049589725231, 0.8037049589725231, -0.8926024664975557, 0.8926024664975557, -0.9558239495713977, 0.9558239495713977, -0.9915651684209309, 0.9915651684209309], [0, -0.16035864564022537, 0.16035864564022537, -0.31656409996362983, 0.31656409996362983, -0.46457074137596094, 0.46457074137596094, -0.600545304661681, 0.600545304661681, -0.7209661773352294, 0.7209661773352294, -0.8227146565371428, 0.8227146565371428, -0.9031559036148179, 0.9031559036148179, -0.96020815213483, 0.96020815213483, -0.9924068438435844, 0.9924068438435844], [-0.07652652113349734, 0.07652652113349734, -0.22778585114164507, 0.22778585114164507, -0.37370608871541955, 0.37370608871541955, -0.5108670019508271, 0.5108670019508271, -0.636053680726515, 0.636053680726515, -0.7463319064601508, 0.7463319064601508, -0.8391169718222188, 0.8391169718222188, -0.912234428251326, 0.912234428251326, -0.9639719272779138, 0.9639719272779138, -0.9931285991850949, 0.9931285991850949], [0, -0.1455618541608951, 0.1455618541608951, -0.2880213168024011, 0.2880213168024011, -0.4243421202074388, 0.4243421202074388, -0.5516188358872198, 0.5516188358872198, -0.6671388041974123, 0.6671388041974123, -0.7684399634756779, 0.7684399634756779, -0.8533633645833173, 0.8533633645833173, -0.9200993341504008, 0.9200993341504008, -0.9672268385663063, 0.9672268385663063, -0.9937521706203895, 0.9937521706203895], [-0.06973927331972223, 0.06973927331972223, -0.20786042668822127, 0.20786042668822127, -0.34193582089208424, 0.34193582089208424, -0.469355837986757, 0.469355837986757, -0.5876404035069116, 0.5876404035069116, -0.6944872631866827, 0.6944872631866827, -0.7878168059792081, 0.7878168059792081, -0.8658125777203002, 0.8658125777203002, -0.926956772187174, 0.926956772187174, -0.9700604978354287, 0.9700604978354287, -0.9942945854823992, 0.9942945854823992], [0, -0.1332568242984661, 0.1332568242984661, -0.26413568097034495, 0.26413568097034495, -0.3903010380302908, 0.3903010380302908, -0.5095014778460075, 0.5095014778460075, -0.6196098757636461, 0.6196098757636461, -0.7186613631319502, 0.7186613631319502, -0.8048884016188399, 0.8048884016188399, -0.8767523582704416, 0.8767523582704416, -0.9329710868260161, 0.9329710868260161, -0.9725424712181152, 0.9725424712181152, -0.9947693349975522, 0.9947693349975522], [-0.06405689286260563, 0.06405689286260563, -0.1911188674736163, 0.1911188674736163, -0.3150426796961634, 0.3150426796961634, -0.4337935076260451, 0.4337935076260451, -0.5454214713888396, 0.5454214713888396, -0.6480936519369755, 0.6480936519369755, -0.7401241915785544, 0.7401241915785544, -0.820001985973903, 0.820001985973903, -0.8864155270044011, 0.8864155270044011, -0.9382745520027328, 0.9382745520027328, -0.9747285559713095, 0.9747285559713095, -0.9951872199970213, 0.9951872199970213]];
  var cValues = [[], [], [1, 1], [0.8888888888888888, 0.5555555555555556, 0.5555555555555556], [0.6521451548625461, 0.6521451548625461, 0.34785484513745385, 0.34785484513745385], [0.5688888888888889, 0.47862867049936647, 0.47862867049936647, 0.23692688505618908, 0.23692688505618908], [0.3607615730481386, 0.3607615730481386, 0.46791393457269104, 0.46791393457269104, 0.17132449237917036, 0.17132449237917036], [0.4179591836734694, 0.3818300505051189, 0.3818300505051189, 0.27970539148927664, 0.27970539148927664, 0.1294849661688697, 0.1294849661688697], [0.362683783378362, 0.362683783378362, 0.31370664587788727, 0.31370664587788727, 0.22238103445337448, 0.22238103445337448, 0.10122853629037626, 0.10122853629037626], [0.3302393550012598, 0.1806481606948574, 0.1806481606948574, 0.08127438836157441, 0.08127438836157441, 0.31234707704000286, 0.31234707704000286, 0.26061069640293544, 0.26061069640293544], [0.29552422471475287, 0.29552422471475287, 0.26926671930999635, 0.26926671930999635, 0.21908636251598204, 0.21908636251598204, 0.1494513491505806, 0.1494513491505806, 0.06667134430868814, 0.06667134430868814], [0.2729250867779006, 0.26280454451024665, 0.26280454451024665, 0.23319376459199048, 0.23319376459199048, 0.18629021092773426, 0.18629021092773426, 0.1255803694649046, 0.1255803694649046, 0.05566856711617366, 0.05566856711617366], [0.24914704581340277, 0.24914704581340277, 0.2334925365383548, 0.2334925365383548, 0.20316742672306592, 0.20316742672306592, 0.16007832854334622, 0.16007832854334622, 0.10693932599531843, 0.10693932599531843, 0.04717533638651183, 0.04717533638651183], [0.2325515532308739, 0.22628318026289723, 0.22628318026289723, 0.2078160475368885, 0.2078160475368885, 0.17814598076194574, 0.17814598076194574, 0.13887351021978725, 0.13887351021978725, 0.09212149983772845, 0.09212149983772845, 0.04048400476531588, 0.04048400476531588], [0.2152638534631578, 0.2152638534631578, 0.2051984637212956, 0.2051984637212956, 0.18553839747793782, 0.18553839747793782, 0.15720316715819355, 0.15720316715819355, 0.12151857068790319, 0.12151857068790319, 0.08015808715976021, 0.08015808715976021, 0.03511946033175186, 0.03511946033175186], [0.2025782419255613, 0.19843148532711158, 0.19843148532711158, 0.1861610000155622, 0.1861610000155622, 0.16626920581699392, 0.16626920581699392, 0.13957067792615432, 0.13957067792615432, 0.10715922046717194, 0.10715922046717194, 0.07036604748810812, 0.07036604748810812, 0.03075324199611727, 0.03075324199611727], [0.1894506104550685, 0.1894506104550685, 0.18260341504492358, 0.18260341504492358, 0.16915651939500254, 0.16915651939500254, 0.14959598881657674, 0.14959598881657674, 0.12462897125553388, 0.12462897125553388, 0.09515851168249279, 0.09515851168249279, 0.062253523938647894, 0.062253523938647894, 0.027152459411754096, 0.027152459411754096], [0.17944647035620653, 0.17656270536699264, 0.17656270536699264, 0.16800410215645004, 0.16800410215645004, 0.15404576107681028, 0.15404576107681028, 0.13513636846852548, 0.13513636846852548, 0.11188384719340397, 0.11188384719340397, 0.08503614831717918, 0.08503614831717918, 0.0554595293739872, 0.0554595293739872, 0.02414830286854793, 0.02414830286854793], [0.1691423829631436, 0.1691423829631436, 0.16427648374583273, 0.16427648374583273, 0.15468467512626524, 0.15468467512626524, 0.14064291467065065, 0.14064291467065065, 0.12255520671147846, 0.12255520671147846, 0.10094204410628717, 0.10094204410628717, 0.07642573025488905, 0.07642573025488905, 0.0497145488949698, 0.0497145488949698, 0.02161601352648331, 0.02161601352648331], [0.1610544498487837, 0.15896884339395434, 0.15896884339395434, 0.15276604206585967, 0.15276604206585967, 0.1426067021736066, 0.1426067021736066, 0.12875396253933621, 0.12875396253933621, 0.11156664554733399, 0.11156664554733399, 0.09149002162245, 0.09149002162245, 0.06904454273764123, 0.06904454273764123, 0.0448142267656996, 0.0448142267656996, 0.019461788229726478, 0.019461788229726478], [0.15275338713072584, 0.15275338713072584, 0.14917298647260374, 0.14917298647260374, 0.14209610931838204, 0.14209610931838204, 0.13168863844917664, 0.13168863844917664, 0.11819453196151841, 0.11819453196151841, 0.10193011981724044, 0.10193011981724044, 0.08327674157670475, 0.08327674157670475, 0.06267204833410907, 0.06267204833410907, 0.04060142980038694, 0.04060142980038694, 0.017614007139152118, 0.017614007139152118], [0.14608113364969041, 0.14452440398997005, 0.14452440398997005, 0.13988739479107315, 0.13988739479107315, 0.13226893863333747, 0.13226893863333747, 0.12183141605372853, 0.12183141605372853, 0.10879729916714838, 0.10879729916714838, 0.09344442345603386, 0.09344442345603386, 0.0761001136283793, 0.0761001136283793, 0.057134425426857205, 0.057134425426857205, 0.036953789770852494, 0.036953789770852494, 0.016017228257774335, 0.016017228257774335], [0.13925187285563198, 0.13925187285563198, 0.13654149834601517, 0.13654149834601517, 0.13117350478706238, 0.13117350478706238, 0.12325237681051242, 0.12325237681051242, 0.11293229608053922, 0.11293229608053922, 0.10041414444288096, 0.10041414444288096, 0.08594160621706773, 0.08594160621706773, 0.06979646842452049, 0.06979646842452049, 0.052293335152683286, 0.052293335152683286, 0.03377490158481415, 0.03377490158481415, 0.0146279952982722, 0.0146279952982722], [0.13365457218610619, 0.1324620394046966, 0.1324620394046966, 0.12890572218808216, 0.12890572218808216, 0.12304908430672953, 0.12304908430672953, 0.11499664022241136, 0.11499664022241136, 0.10489209146454141, 0.10489209146454141, 0.09291576606003515, 0.09291576606003515, 0.07928141177671895, 0.07928141177671895, 0.06423242140852585, 0.06423242140852585, 0.04803767173108467, 0.04803767173108467, 0.030988005856979445, 0.030988005856979445, 0.013411859487141771, 0.013411859487141771], [0.12793819534675216, 0.12793819534675216, 0.1258374563468283, 0.1258374563468283, 0.12167047292780339, 0.12167047292780339, 0.1155056680537256, 0.1155056680537256, 0.10744427011596563, 0.10744427011596563, 0.09761865210411388, 0.09761865210411388, 0.08619016153195327, 0.08619016153195327, 0.0733464814110803, 0.0733464814110803, 0.05929858491543678, 0.05929858491543678, 0.04427743881741981, 0.04427743881741981, 0.028531388628933663, 0.028531388628933663, 0.0123412297999872, 0.0123412297999872]];
  var binomialCoefficients = [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]];

  function binomials(n, k) {
    return binomialCoefficients[n][k];
  }

  function getDerivative(derivative, t, vs) {
    var n = vs.length - 1,
        _vs,
        value,
        k;

    if (n === 0) {
      return 0;
    }

    if (derivative === 0) {
      value = 0;

      for (k = 0; k <= n; k++) {
        value += binomials(n, k) * Math.pow(1 - t, n - k) * Math.pow(t, k) * vs[k];
      }

      return value;
    } else {
      _vs = new Array(n);

      for (k = 0; k < n; k++) {
        _vs[k] = n * (vs[k + 1] - vs[k]);
      }

      return getDerivative(derivative - 1, t, _vs);
    }
  }

  function B(xs, ys, t) {
    var xbase = getDerivative(1, t, xs);
    var ybase = getDerivative(1, t, ys);
    var combined = xbase * xbase + ybase * ybase;
    return Math.sqrt(combined);
  }

  function getCubicArcLength(xs, ys, t) {
    var z, sum, i, correctedT;

    if (t === undefined) {
      t = 1;
    }

    var n = 20;
    z = t / 2;
    sum = 0;

    for (i = 0; i < n; i++) {
      correctedT = z * tValues[n][i] + z;
      sum += cValues[n][i] * B(xs, ys, correctedT);
    }

    return z * sum;
  }

  function Arc(x0, y0, rx, ry, xAxisRotate, LargeArcFlag, SweepFlag, x, y) {
    return new Arc$1(x0, y0, rx, ry, xAxisRotate, LargeArcFlag, SweepFlag, x, y);
  }

  function Arc$1(x0, y0, rx, ry, xAxisRotate, LargeArcFlag, SweepFlag, x1, y1) {
    this.x0 = x0;
    this.y0 = y0;
    this.rx = rx;
    this.ry = ry;
    this.xAxisRotate = xAxisRotate;
    this.LargeArcFlag = LargeArcFlag;
    this.SweepFlag = SweepFlag;
    this.x1 = x1;
    this.y1 = y1;
    var lengthProperties = approximateArcLengthOfCurve(300, function (t) {
      return pointOnEllipticalArc({
        x: x0,
        y: y0
      }, rx, ry, xAxisRotate, LargeArcFlag, SweepFlag, {
        x: x1,
        y: y1
      }, t);
    });
    this.length = lengthProperties.arcLength;
  }

  Arc$1.prototype = {
    constructor: Arc$1,
    init: function init() {},
    getTotalLength: function getTotalLength() {
      return this.length;
    },
    getPointAtLength: function getPointAtLength(fractionLength) {
      if (fractionLength < 0) {
        fractionLength = 0;
      } else if (fractionLength > this.length) {
        fractionLength = this.length;
      }

      var position = pointOnEllipticalArc({
        x: this.x0,
        y: this.y0
      }, this.rx, this.ry, this.xAxisRotate, this.LargeArcFlag, this.SweepFlag, {
        x: this.x1,
        y: this.y1
      }, fractionLength / this.length);
      return {
        x: position.x,
        y: position.y
      };
    },
    getTangentAtLength: function getTangentAtLength(fractionLength) {
      if (fractionLength < 0) {
        fractionLength = 0;
      } else if (fractionLength > this.length) {
        fractionLength = this.length;
      }

      var position = pointOnEllipticalArc({
        x: this.x0,
        y: this.y0
      }, this.rx, this.ry, this.xAxisRotate, this.LargeArcFlag, this.SweepFlag, {
        x: this.x1,
        y: this.y1
      }, fractionLength / this.length);
      return {
        x: position.x,
        y: position.y
      };
    },
    getPropertiesAtLength: function getPropertiesAtLength(fractionLength) {
      var tangent = this.getTangentAtLength(fractionLength);
      var point = this.getPointAtLength(fractionLength);
      return {
        x: point.x,
        y: point.y,
        tangentX: tangent.x,
        tangentY: tangent.y
      };
    }
  };

  function pointOnEllipticalArc(p0, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, p1, t) {
    rx = Math.abs(rx);
    ry = Math.abs(ry);
    xAxisRotation = mod(xAxisRotation, 360);
    var xAxisRotationRadians = toRadians(xAxisRotation);

    if (p0.x === p1.x && p0.y === p1.y) {
      return p0;
    }

    if (rx === 0 || ry === 0) {
      return this.pointOnLine(p0, p1, t);
    }

    var dx = (p0.x - p1.x) / 2;
    var dy = (p0.y - p1.y) / 2;
    var transformedPoint = {
      x: Math.cos(xAxisRotationRadians) * dx + Math.sin(xAxisRotationRadians) * dy,
      y: -Math.sin(xAxisRotationRadians) * dx + Math.cos(xAxisRotationRadians) * dy
    };
    var radiiCheck = Math.pow(transformedPoint.x, 2) / Math.pow(rx, 2) + Math.pow(transformedPoint.y, 2) / Math.pow(ry, 2);

    if (radiiCheck > 1) {
      rx = Math.sqrt(radiiCheck) * rx;
      ry = Math.sqrt(radiiCheck) * ry;
    }

    var cSquareNumerator = Math.pow(rx, 2) * Math.pow(ry, 2) - Math.pow(rx, 2) * Math.pow(transformedPoint.y, 2) - Math.pow(ry, 2) * Math.pow(transformedPoint.x, 2);
    var cSquareRootDenom = Math.pow(rx, 2) * Math.pow(transformedPoint.y, 2) + Math.pow(ry, 2) * Math.pow(transformedPoint.x, 2);
    var cRadicand = cSquareNumerator / cSquareRootDenom;
    cRadicand = cRadicand < 0 ? 0 : cRadicand;
    var cCoef = (largeArcFlag !== sweepFlag ? 1 : -1) * Math.sqrt(cRadicand);
    var transformedCenter = {
      x: cCoef * (rx * transformedPoint.y / ry),
      y: cCoef * (-(ry * transformedPoint.x) / rx)
    };
    var center = {
      x: Math.cos(xAxisRotationRadians) * transformedCenter.x - Math.sin(xAxisRotationRadians) * transformedCenter.y + (p0.x + p1.x) / 2,
      y: Math.sin(xAxisRotationRadians) * transformedCenter.x + Math.cos(xAxisRotationRadians) * transformedCenter.y + (p0.y + p1.y) / 2
    };
    var startVector = {
      x: (transformedPoint.x - transformedCenter.x) / rx,
      y: (transformedPoint.y - transformedCenter.y) / ry
    };
    var startAngle = angleBetween({
      x: 1,
      y: 0
    }, startVector);
    var endVector = {
      x: (-transformedPoint.x - transformedCenter.x) / rx,
      y: (-transformedPoint.y - transformedCenter.y) / ry
    };
    var sweepAngle = angleBetween(startVector, endVector);

    if (!sweepFlag && sweepAngle > 0) {
      sweepAngle -= 2 * Math.PI;
    } else if (sweepFlag && sweepAngle < 0) {
      sweepAngle += 2 * Math.PI;
    }

    sweepAngle %= 2 * Math.PI;
    var angle = startAngle + sweepAngle * t;
    var ellipseComponentX = rx * Math.cos(angle);
    var ellipseComponentY = ry * Math.sin(angle);
    var point = {
      x: Math.cos(xAxisRotationRadians) * ellipseComponentX - Math.sin(xAxisRotationRadians) * ellipseComponentY + center.x,
      y: Math.sin(xAxisRotationRadians) * ellipseComponentX + Math.cos(xAxisRotationRadians) * ellipseComponentY + center.y
    };
    point.ellipticalArcStartAngle = startAngle;
    point.ellipticalArcEndAngle = startAngle + sweepAngle;
    point.ellipticalArcAngle = angle;
    point.ellipticalArcCenter = center;
    point.resultantRx = rx;
    point.resultantRy = ry;
    return point;
  }

  function approximateArcLengthOfCurve(resolution, pointOnCurveFunc) {
    resolution = resolution ? resolution : 500;
    var resultantArcLength = 0;
    var arcLengthMap = [];
    var approximationLines = [];
    var prevPoint = pointOnCurveFunc(0);
    var nextPoint;

    for (var i = 0; i < resolution; i++) {
      var t = clamp(i * (1 / resolution), 0, 1);
      nextPoint = pointOnCurveFunc(t);
      resultantArcLength += distance(prevPoint, nextPoint);
      approximationLines.push([prevPoint, nextPoint]);
      arcLengthMap.push({
        t: t,
        arcLength: resultantArcLength
      });
      prevPoint = nextPoint;
    }

    nextPoint = pointOnCurveFunc(1);
    approximationLines.push([prevPoint, nextPoint]);
    resultantArcLength += distance(prevPoint, nextPoint);
    arcLengthMap.push({
      t: 1,
      arcLength: resultantArcLength
    });
    return {
      arcLength: resultantArcLength,
      arcLengthMap: arcLengthMap,
      approximationLines: approximationLines
    };
  }

  function mod(x, m) {
    return (x % m + m) % m;
  }

  function toRadians(angle) {
    return angle * (Math.PI / 180);
  }

  function distance(p0, p1) {
    return Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
  }

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  function angleBetween(v0, v1) {
    var p = v0.x * v1.x + v0.y * v1.y;
    var n = Math.sqrt((Math.pow(v0.x, 2) + Math.pow(v0.y, 2)) * (Math.pow(v1.x, 2) + Math.pow(v1.y, 2)));
    var sign = v0.x * v1.y - v0.y * v1.x < 0 ? -1 : 1;
    var angle = sign * Math.acos(p / n);
    return angle;
  }

  function LinearPosition(x0, x1, y0, y1) {
    return new LinearPosition$1(x0, x1, y0, y1);
  }

  function LinearPosition$1(x0, x1, y0, y1) {
    this.x0 = x0;
    this.x1 = x1;
    this.y0 = y0;
    this.y1 = y1;
  }

  LinearPosition$1.prototype.getTotalLength = function () {
    return Math.sqrt(Math.pow(this.x0 - this.x1, 2) + Math.pow(this.y0 - this.y1, 2));
  };

  LinearPosition$1.prototype.getPointAtLength = function (pos) {
    var fraction = pos / Math.sqrt(Math.pow(this.x0 - this.x1, 2) + Math.pow(this.y0 - this.y1, 2));
    var newDeltaX = (this.x1 - this.x0) * fraction;
    var newDeltaY = (this.y1 - this.y0) * fraction;
    return {
      x: this.x0 + newDeltaX,
      y: this.y0 + newDeltaY
    };
  };

  LinearPosition$1.prototype.getTangentAtLength = function () {
    var module = Math.sqrt((this.x1 - this.x0) * (this.x1 - this.x0) + (this.y1 - this.y0) * (this.y1 - this.y0));
    return {
      x: (this.x1 - this.x0) / module,
      y: (this.y1 - this.y0) / module
    };
  };

  LinearPosition$1.prototype.getPropertiesAtLength = function (pos) {
    var point = this.getPointAtLength(pos);
    var tangent = this.getTangentAtLength();
    return {
      x: point.x,
      y: point.y,
      tangentX: tangent.x,
      tangentY: tangent.y
    };
  };

  function PathProperties(svgString) {
    var length = 0;
    var partial_lengths = [];
    var functions = [];

    function svgProperties(string) {
      if (!string) {
        return null;
      }

      var parsed = parse(string);
      var cur = [0, 0];
      var prev_point = [0, 0];
      var curve;
      var ringStart;

      for (var i = 0; i < parsed.length; i++) {
        if (parsed[i][0] === "M") {
          cur = [parsed[i][1], parsed[i][2]];
          ringStart = [cur[0], cur[1]];
          functions.push(null);
        } else if (parsed[i][0] === "m") {
          cur = [parsed[i][1] + cur[0], parsed[i][2] + cur[1]];
          ringStart = [cur[0], cur[1]];
          functions.push(null);
        } else if (parsed[i][0] === "L") {
          length = length + Math.sqrt(Math.pow(cur[0] - parsed[i][1], 2) + Math.pow(cur[1] - parsed[i][2], 2));
          functions.push(new LinearPosition(cur[0], parsed[i][1], cur[1], parsed[i][2]));
          cur = [parsed[i][1], parsed[i][2]];
        } else if (parsed[i][0] === "l") {
          length = length + Math.sqrt(Math.pow(parsed[i][1], 2) + Math.pow(parsed[i][2], 2));
          functions.push(new LinearPosition(cur[0], parsed[i][1] + cur[0], cur[1], parsed[i][2] + cur[1]));
          cur = [parsed[i][1] + cur[0], parsed[i][2] + cur[1]];
        } else if (parsed[i][0] === "H") {
          length = length + Math.abs(cur[0] - parsed[i][1]);
          functions.push(new LinearPosition(cur[0], parsed[i][1], cur[1], cur[1]));
          cur[0] = parsed[i][1];
        } else if (parsed[i][0] === "h") {
          length = length + Math.abs(parsed[i][1]);
          functions.push(new LinearPosition(cur[0], cur[0] + parsed[i][1], cur[1], cur[1]));
          cur[0] = parsed[i][1] + cur[0];
        } else if (parsed[i][0] === "V") {
          length = length + Math.abs(cur[1] - parsed[i][1]);
          functions.push(new LinearPosition(cur[0], cur[0], cur[1], parsed[i][1]));
          cur[1] = parsed[i][1];
        } else if (parsed[i][0] === "v") {
          length = length + Math.abs(parsed[i][1]);
          functions.push(new LinearPosition(cur[0], cur[0], cur[1], cur[1] + parsed[i][1]));
          cur[1] = parsed[i][1] + cur[1];
        } else if (parsed[i][0] === "z" || parsed[i][0] === "Z") {
          length = length + Math.sqrt(Math.pow(ringStart[0] - cur[0], 2) + Math.pow(ringStart[1] - cur[1], 2));
          functions.push(new LinearPosition(cur[0], ringStart[0], cur[1], ringStart[1]));
          cur = [ringStart[0], ringStart[1]];
        } else if (parsed[i][0] === "C") {
          curve = new Bezier(cur[0], cur[1], parsed[i][1], parsed[i][2], parsed[i][3], parsed[i][4], parsed[i][5], parsed[i][6]);
          length = length + curve.getTotalLength();
          cur = [parsed[i][5], parsed[i][6]];
          functions.push(curve);
        } else if (parsed[i][0] === "c") {
          curve = new Bezier(cur[0], cur[1], cur[0] + parsed[i][1], cur[1] + parsed[i][2], cur[0] + parsed[i][3], cur[1] + parsed[i][4], cur[0] + parsed[i][5], cur[1] + parsed[i][6]);

          if (curve.getTotalLength() > 0) {
            length = length + curve.getTotalLength();
            functions.push(curve);
            cur = [parsed[i][5] + cur[0], parsed[i][6] + cur[1]];
          } else {
            functions.push(new LinearPosition(cur[0], cur[0], cur[1], cur[1]));
          }
        } else if (parsed[i][0] === "S") {
          if (i > 0 && ["C", "c", "S", "s"].indexOf(parsed[i - 1][0]) > -1) {
            curve = new Bezier(cur[0], cur[1], 2 * cur[0] - parsed[i - 1][parsed[i - 1].length - 4], 2 * cur[1] - parsed[i - 1][parsed[i - 1].length - 3], parsed[i][1], parsed[i][2], parsed[i][3], parsed[i][4]);
          } else {
            curve = new Bezier(cur[0], cur[1], cur[0], cur[1], parsed[i][1], parsed[i][2], parsed[i][3], parsed[i][4]);
          }

          length = length + curve.getTotalLength();
          cur = [parsed[i][3], parsed[i][4]];
          functions.push(curve);
        } else if (parsed[i][0] === "s") {
          if (i > 0 && ["C", "c", "S", "s"].indexOf(parsed[i - 1][0]) > -1) {
            curve = new Bezier(cur[0], cur[1], cur[0] + curve.d.x - curve.c.x, cur[1] + curve.d.y - curve.c.y, cur[0] + parsed[i][1], cur[1] + parsed[i][2], cur[0] + parsed[i][3], cur[1] + parsed[i][4]);
          } else {
            curve = new Bezier(cur[0], cur[1], cur[0], cur[1], cur[0] + parsed[i][1], cur[1] + parsed[i][2], cur[0] + parsed[i][3], cur[1] + parsed[i][4]);
          }

          length = length + curve.getTotalLength();
          cur = [parsed[i][3] + cur[0], parsed[i][4] + cur[1]];
          functions.push(curve);
        } else if (parsed[i][0] === "Q") {
          if (cur[0] == parsed[i][1] && cur[1] == parsed[i][2]) {
            curve = new LinearPosition(parsed[i][1], parsed[i][3], parsed[i][2], parsed[i][4]);
          } else {
            curve = new Bezier(cur[0], cur[1], parsed[i][1], parsed[i][2], parsed[i][3], parsed[i][4]);
          }

          length = length + curve.getTotalLength();
          functions.push(curve);
          cur = [parsed[i][3], parsed[i][4]];
          prev_point = [parsed[i][1], parsed[i][2]];
        } else if (parsed[i][0] === "q") {
          if (!(parsed[i][1] == 0 && parsed[i][2] == 0)) {
            curve = new Bezier(cur[0], cur[1], cur[0] + parsed[i][1], cur[1] + parsed[i][2], cur[0] + parsed[i][3], cur[1] + parsed[i][4]);
          } else {
            curve = new LinearPosition(cur[0] + parsed[i][1], cur[0] + parsed[i][3], cur[1] + parsed[i][2], cur[1] + parsed[i][4]);
          }

          length = length + curve.getTotalLength();
          prev_point = [cur[0] + parsed[i][1], cur[1] + parsed[i][2]];
          cur = [parsed[i][3] + cur[0], parsed[i][4] + cur[1]];
          functions.push(curve);
        } else if (parsed[i][0] === "T") {
          if (i > 0 && ["Q", "q", "T", "t"].indexOf(parsed[i - 1][0]) > -1) {
            curve = new Bezier(cur[0], cur[1], 2 * cur[0] - prev_point[0], 2 * cur[1] - prev_point[1], parsed[i][1], parsed[i][2]);
          } else {
            curve = new LinearPosition(cur[0], parsed[i][1], cur[1], parsed[i][2]);
          }

          functions.push(curve);
          length = length + curve.getTotalLength();
          prev_point = [2 * cur[0] - prev_point[0], 2 * cur[1] - prev_point[1]];
          cur = [parsed[i][1], parsed[i][2]];
        } else if (parsed[i][0] === "t") {
          if (i > 0 && ["Q", "q", "T", "t"].indexOf(parsed[i - 1][0]) > -1) {
            curve = new Bezier(cur[0], cur[1], 2 * cur[0] - prev_point[0], 2 * cur[1] - prev_point[1], cur[0] + parsed[i][1], cur[1] + parsed[i][2]);
          } else {
            curve = new LinearPosition(cur[0], cur[0] + parsed[i][1], cur[1], cur[1] + parsed[i][2]);
          }

          length = length + curve.getTotalLength();
          prev_point = [2 * cur[0] - prev_point[0], 2 * cur[1] - prev_point[1]];
          cur = [parsed[i][1] + cur[0], parsed[i][2] + cur[0]];
          functions.push(curve);
        } else if (parsed[i][0] === "A") {
          curve = new Arc(cur[0], cur[1], parsed[i][1], parsed[i][2], parsed[i][3], parsed[i][4], parsed[i][5], parsed[i][6], parsed[i][7]);
          length = length + curve.getTotalLength();
          cur = [parsed[i][6], parsed[i][7]];
          functions.push(curve);
        } else if (parsed[i][0] === "a") {
          curve = new Arc(cur[0], cur[1], parsed[i][1], parsed[i][2], parsed[i][3], parsed[i][4], parsed[i][5], cur[0] + parsed[i][6], cur[1] + parsed[i][7]);
          length = length + curve.getTotalLength();
          cur = [cur[0] + parsed[i][6], cur[1] + parsed[i][7]];
          functions.push(curve);
        }

        partial_lengths.push(length);
      }

      return svgProperties;
    }

    svgProperties.getTotalLength = function () {
      return length;
    };

    svgProperties.getPointAtLength = function (fractionLength) {
      var fractionPart = getPartAtLength(fractionLength);
      return functions[fractionPart.i].getPointAtLength(fractionPart.fraction);
    };

    svgProperties.getTangentAtLength = function (fractionLength) {
      var fractionPart = getPartAtLength(fractionLength);
      return functions[fractionPart.i].getTangentAtLength(fractionPart.fraction);
    };

    svgProperties.getPropertiesAtLength = function (fractionLength) {
      var fractionPart = getPartAtLength(fractionLength);
      return functions[fractionPart.i].getPropertiesAtLength(fractionPart.fraction);
    };

    svgProperties.getParts = function () {
      var parts = [];

      for (var i = 0; i < functions.length; i++) {
        if (functions[i] != null) {
          var properties = {};
          properties['start'] = functions[i].getPointAtLength(0);
          properties['end'] = functions[i].getPointAtLength(partial_lengths[i] - partial_lengths[i - 1]);
          properties['length'] = partial_lengths[i] - partial_lengths[i - 1];

          (function (func) {
            properties['getPointAtLength'] = function (d) {
              return func.getPointAtLength(d);
            };

            properties['getTangentAtLength'] = function (d) {
              return func.getTangentAtLength(d);
            };

            properties['getPropertiesAtLength'] = function (d) {
              return func.getPropertiesAtLength(d);
            };
          })(functions[i]);

          parts.push(properties);
        }
      }

      return parts;
    };

    var getPartAtLength = function getPartAtLength(fractionLength) {
      if (fractionLength < 0) {
        fractionLength = 0;
      } else if (fractionLength > length) {
        fractionLength = length;
      }

      var i = partial_lengths.length - 1;

      while (partial_lengths[i] >= fractionLength && partial_lengths[i] > 0) {
        i--;
      }

      i++;
      return {
        fraction: fractionLength - partial_lengths[i - 1],
        i: i
      };
    };

    return svgProperties(svgString);
  }

  var RES_CIRCLE = 64;
  var RES_PATH = 128;
  var emptyValue = {
    value: 0
  };

  var pointStringToArray = function pointStringToArray(str) {
    return str.split(" ").filter(function (s) {
      return s !== "";
    }).map(function (p) {
      return p.split(",").map(function (n) {
        return parseFloat(n);
      });
    });
  };

  var getAttributes = function getAttributes(element, attributeList) {
    var indices = attributeList.map(function (attr) {
      for (var i = 0; i < element.attributes.length; i += 1) {
        if (element.attributes[i].nodeName === attr) {
          return i;
        }
      }

      return undefined;
    });
    return indices.map(function (i) {
      return i === undefined ? emptyValue : element.attributes[i];
    }).map(function (attr) {
      return attr.value !== undefined ? attr.value : attr.baseVal.value;
    });
  };

  var svg_line_to_segments = function svg_line_to_segments(line) {
    return [getAttributes(line, ["x1", "y1", "x2", "y2"])];
  };

  var svg_rect_to_segments = function svg_rect_to_segments(rect) {
    var attrs = getAttributes(rect, ["x", "y", "width", "height"]);
    var x = parseFloat(attrs[0]);
    var y = parseFloat(attrs[1]);
    var width = parseFloat(attrs[2]);
    var height = parseFloat(attrs[3]);
    return [[x, y, x + width, y], [x + width, y, x + width, y + height], [x + width, y + height, x, y + height], [x, y + height, x, y]];
  };

  var svg_circle_to_segments = function svg_circle_to_segments(circle) {
    var attrs = getAttributes(circle, ["cx", "cy", "r"]);
    var cx = parseFloat(attrs[0]);
    var cy = parseFloat(attrs[1]);
    var r = parseFloat(attrs[2]);
    return Array.from(Array(RES_CIRCLE)).map(function (_, i) {
      return [cx + r * Math.cos(i / RES_CIRCLE * Math.PI * 2), cy + r * Math.sin(i / RES_CIRCLE * Math.PI * 2)];
    }).map(function (_, i, arr) {
      return [arr[i][0], arr[i][1], arr[(i + 1) % arr.length][0], arr[(i + 1) % arr.length][1]];
    });
  };

  var svg_ellipse_to_segments = function svg_ellipse_to_segments(ellipse) {
    var attrs = getAttributes(ellipse, ["cx", "cy", "rx", "ry"]);
    var cx = parseFloat(attrs[0]);
    var cy = parseFloat(attrs[1]);
    var rx = parseFloat(attrs[2]);
    var ry = parseFloat(attrs[3]);
    return Array.from(Array(RES_CIRCLE)).map(function (_, i) {
      return [cx + rx * Math.cos(i / RES_CIRCLE * Math.PI * 2), cy + ry * Math.sin(i / RES_CIRCLE * Math.PI * 2)];
    }).map(function (_, i, arr) {
      return [arr[i][0], arr[i][1], arr[(i + 1) % arr.length][0], arr[(i + 1) % arr.length][1]];
    });
  };

  var svg_polygon_to_segments = function svg_polygon_to_segments(polygon) {
    var points = "";

    for (var i = 0; i < polygon.attributes.length; i += 1) {
      if (polygon.attributes[i].nodeName === "points") {
        points = polygon.attributes[i].value;
        break;
      }
    }

    return pointStringToArray(points).map(function (_, i, a) {
      return [a[i][0], a[i][1], a[(i + 1) % a.length][0], a[(i + 1) % a.length][1]];
    });
  };

  var svg_polyline_to_segments = function svg_polyline_to_segments(polyline) {
    var circularPath = svg_polygon_to_segments(polyline);
    circularPath.pop();
    return circularPath;
  };

  var svg_path_to_segments = function svg_path_to_segments(path) {
    var d = path.getAttribute("d");
    var prop = PathProperties(d);
    var length = prop.getTotalLength();
    var isClosed = d[d.length - 1] === "Z" || d[d.length - 1] === "z";
    var segmentLength = isClosed ? length / RES_PATH : length / (RES_PATH - 1);
    var pathsPoints = Array.from(Array(RES_PATH)).map(function (_, i) {
      return prop.getPointAtLength(i * segmentLength);
    }).map(function (p) {
      return [p.x, p.y];
    });
    var segments = pathsPoints.map(function (_, i, a) {
      return [a[i][0], a[i][1], a[(i + 1) % a.length][0], a[(i + 1) % a.length][1]];
    });

    if (!isClosed) {
      segments.pop();
    }

    return segments;
  };

  var parsers = {
    line: svg_line_to_segments,
    rect: svg_rect_to_segments,
    circle: svg_circle_to_segments,
    ellipse: svg_ellipse_to_segments,
    polygon: svg_polygon_to_segments,
    polyline: svg_polyline_to_segments,
    path: svg_path_to_segments
  };

  function vkXML(text, step) {
    var ar = text.replace(/>\s{0,}</g, "><").replace(/</g, "~::~<").replace(/\s*xmlns\:/g, "~::~xmlns:").split("~::~");
    var len = ar.length;
    var inComment = false;
    var deep = 0;
    var str = "";
    var space = step != null && typeof step === "string" ? step : "\t";
    var shift = ["\n"];

    for (var si = 0; si < 100; si += 1) {
      shift.push(shift[si] + space);
    }

    for (var ix = 0; ix < len; ix += 1) {
      if (ar[ix].search(/<!/) > -1) {
        str += shift[deep] + ar[ix];
        inComment = true;

        if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1) {
          inComment = false;
        }
      } else if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
        str += ar[ix];
        inComment = false;
      } else if (/^<\w/.exec(ar[ix - 1]) && /^<\/\w/.exec(ar[ix]) && /^<[\w:\-\.\,]+/.exec(ar[ix - 1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace("/", "")) {
        str += ar[ix];

        if (!inComment) {
          deep -= 1;
        }
      } else if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) === -1 && ar[ix].search(/\/>/) === -1) {
        str = !inComment ? str += shift[deep++] + ar[ix] : str += ar[ix];
      } else if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
        str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix];
      } else if (ar[ix].search(/<\//) > -1) {
        str = !inComment ? str += shift[--deep] + ar[ix] : str += ar[ix];
      } else if (ar[ix].search(/\/>/) > -1) {
        str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix];
      } else if (ar[ix].search(/<\?/) > -1) {
        str += shift[deep] + ar[ix];
      } else if (ar[ix].search(/xmlns\:/) > -1 || ar[ix].search(/xmlns\=/) > -1) {
        str += shift[deep] + ar[ix];
      } else {
        str += ar[ix];
      }
    }

    return str[0] === "\n" ? str.slice(1) : str;
  }

  var isBrowser$1 = function isBrowser() {
    return typeof window !== "undefined";
  };

  var isNode$1 = function isNode() {
    return typeof window === "undefined" && typeof process !== "undefined";
  };

  var htmlString$1 = "<!DOCTYPE html><title> </title>";
  var win$1 = {};

  if (isNode$1()) {
    var _require$1 = require("xmldom"),
        DOMParser$1 = _require$1.DOMParser,
        XMLSerializer$1 = _require$1.XMLSerializer;

    win$1.DOMParser = DOMParser$1;
    win$1.XMLSerializer = XMLSerializer$1;
    win$1.document = new DOMParser$1().parseFromString(htmlString$1, "text/html");
  } else if (isBrowser$1()) {
    win$1.DOMParser = window.DOMParser;
    win$1.XMLSerializer = window.XMLSerializer;
    win$1.document = window.document;
  }

  var parseTransform = function parseTransform(transform) {
    var parsed = transform.match(/(\w+\((\-?\d+\.?\d*e?\-?\d*,?\s*)+\))+/g);
    var listForm = parsed.map(function (a) {
      return a.match(/[\w\.\-]+/g);
    });
    return listForm.map(function (a) {
      return {
        transform: a.shift(),
        parameters: a.map(function (p) {
          return parseFloat(p);
        })
      };
    });
  };

  var multiply_line_matrix2 = function multiply_line_matrix2(line, matrix) {
    return [line[0] * matrix[0] + line[1] * matrix[2] + matrix[4], line[0] * matrix[1] + line[1] * matrix[3] + matrix[5], line[2] * matrix[0] + line[3] * matrix[2] + matrix[4], line[2] * matrix[1] + line[3] * matrix[3] + matrix[5]];
  };

  var multiply_matrices2 = function multiply_matrices2(m1, m2) {
    return [m1[0] * m2[0] + m1[2] * m2[1], m1[1] * m2[0] + m1[3] * m2[1], m1[0] * m2[2] + m1[2] * m2[3], m1[1] * m2[2] + m1[3] * m2[3], m1[0] * m2[4] + m1[2] * m2[5] + m1[4], m1[1] * m2[4] + m1[3] * m2[5] + m1[5]];
  };

  var matrixFormTranslate = function matrixFormTranslate(params) {
    switch (params.length) {
      case 1:
        return [1, 0, 0, 1, params[0], 0];

      case 2:
        return [1, 0, 0, 1, params[0], params[1]];

      default:
        console.warn("improper translate, ".concat(params));
    }

    return undefined;
  };

  var matrixFormRotate = function matrixFormRotate(params) {
    var cos_p = Math.cos(params[0] / 180 * Math.PI);
    var sin_p = Math.sin(params[0] / 180 * Math.PI);

    switch (params.length) {
      case 1:
        return [cos_p, sin_p, -sin_p, cos_p, 0, 0];

      case 3:
        return [cos_p, sin_p, -sin_p, cos_p, -params[1] * cos_p + params[2] * sin_p + params[1], -params[1] * sin_p - params[2] * cos_p + params[2]];

      default:
        console.warn("improper rotate, ".concat(params));
    }

    return undefined;
  };

  var matrixFormScale = function matrixFormScale(params) {
    switch (params.length) {
      case 1:
        return [params[0], 0, 0, params[0], 0, 0];

      case 2:
        return [params[0], 0, 0, params[1], 0, 0];

      default:
        console.warn("improper scale, ".concat(params));
    }

    return undefined;
  };

  var matrixFormSkewX = function matrixFormSkewX(params) {
    return [1, 0, Math.tan(params[0] / 180 * Math.PI), 1, 0, 0];
  };

  var matrixFormSkewY = function matrixFormSkewY(params) {
    return [1, Math.tan(params[0] / 180 * Math.PI), 0, 1, 0, 0];
  };

  var matrixForm = function matrixForm(transformType, params) {
    switch (transformType) {
      case "translate":
        return matrixFormTranslate(params);

      case "rotate":
        return matrixFormRotate(params);

      case "scale":
        return matrixFormScale(params);

      case "skewX":
        return matrixFormSkewX(params);

      case "skewY":
        return matrixFormSkewY(params);

      case "matrix":
        return params;

      default:
        console.warn("unknown transform type ".concat(transformType));
    }

    return undefined;
  };

  var transformIntoMatrix = function transformIntoMatrix(string) {
    return parseTransform(string).map(function (el) {
      return matrixForm(el.transform, el.parameters);
    }).filter(function (a) {
      return a !== undefined;
    }).reduce(function (a, b) {
      return multiply_matrices2(a, b);
    }, [1, 0, 0, 1, 0, 0]);
  };

  var getElementsTransform = function getElementsTransform(element) {
    if (typeof element.getAttribute !== "function") {
      return [1, 0, 0, 1, 0, 0];
    }

    var transformAttr = element.getAttribute("transform");

    if (transformAttr != null && transformAttr !== "") {
      return transformIntoMatrix(transformAttr);
    }

    return [1, 0, 0, 1, 0, 0];
  };

  var apply_nested_transforms = function apply_nested_transforms(element) {
    var stack = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [1, 0, 0, 1, 0, 0];
    var local = multiply_matrices2(stack, getElementsTransform(element));
    element.matrix = local;

    if (element.tagName === "g" || element.tagName === "svg") {
      if (element.childNodes == null) {
        return;
      }

      Array.from(element.childNodes).forEach(function (child) {
        return apply_nested_transforms(child, local);
      });
    }
  };

  var parseable = Object.keys(parsers);
  var svgNS = "http://www.w3.org/2000/svg";
  var DEFAULTS = {
    string: true,
    svg: false
  };
  var svgAttributes = ["version", "xmlns", "contentScriptType", "contentStyleType", "baseProfile", "class", "externalResourcesRequired", "x", "y", "width", "height", "viewBox", "preserveAspectRatio", "zoomAndPan", "style"];
  var shape_attr = {
    line: ["x1", "y1", "x2", "y2"],
    rect: ["x", "y", "width", "height"],
    circle: ["cx", "cy", "r"],
    ellipse: ["cx", "cy", "rx", "ry"],
    polygon: ["points"],
    polyline: ["points"],
    path: ["d"]
  };

  var stringToDomTree = function stringToDomTree(input) {
    return typeof input === "string" || input instanceof String ? new win$1.DOMParser().parseFromString(input, "text/xml").documentElement : input;
  };

  var flatten_tree = function flatten_tree(element) {
    if (element.tagName === "g" || element.tagName === "svg") {
      if (element.childNodes == null) {
        return [];
      }

      return Array.from(element.childNodes).map(function (child) {
        return flatten_tree(child);
      }).reduce(function (a, b) {
        return a.concat(b);
      }, []);
    }

    return [element];
  };

  var attribute_list = function attribute_list(element) {
    return Array.from(element.attributes).filter(function (a) {
      return shape_attr[element.tagName].indexOf(a.name) === -1;
    });
  };

  var objectifyAttributeList = function objectifyAttributeList(list) {
    var obj = {};
    list.forEach(function (a) {
      obj[a.nodeName] = a.value;
    });
    return obj;
  };

  var Segmentize = function Segmentize(input, options) {
    var inputSVG = stringToDomTree(input);
    apply_nested_transforms(inputSVG);
    var elements = flatten_tree(inputSVG);
    var lineSegments = elements.filter(function (e) {
      return parseable.indexOf(e.tagName) !== -1;
    }).map(function (e) {
      return parsers[e.tagName](e).map(function (unit) {
        return multiply_line_matrix2(unit, e.matrix);
      }).map(function (unit) {
        return [].concat(_toConsumableArray$1(unit), [attribute_list(e)]);
      });
    }).reduce(function (a, b) {
      return a.concat(b);
    }, []);
    lineSegments.filter(function (a) {
      return a[4] !== undefined;
    }).forEach(function (seg) {
      var noTransforms = seg[4].filter(function (a) {
        return a.nodeName !== "transform";
      });
      seg[4] = objectifyAttributeList(noTransforms);
    });
    var o = Object.assign(Object.assign({}, DEFAULTS), options);

    if (o.svg) {
      var newSVG = win$1.document.createElementNS(svgNS, "svg");
      svgAttributes.map(function (a) {
        return {
          attribute: a,
          value: inputSVG.getAttribute(a)
        };
      }).filter(function (obj) {
        return obj.value != null && obj.value !== "";
      }).forEach(function (obj) {
        return newSVG.setAttribute(obj.attribute, obj.value);
      });

      if (newSVG.getAttribute("xmlns") === null) {
        newSVG.setAttribute("xmlns", svgNS);
      }

      var styles = elements.filter(function (e) {
        return e.tagName === "style" || e.tagName === "defs";
      });

      if (styles.length > 0) {
        styles.map(function (style) {
          return style.cloneNode(true);
        }).forEach(function (style) {
          return newSVG.appendChild(style);
        });
      }

      lineSegments.forEach(function (s) {
        var line = win$1.document.createElementNS(svgNS, "line");
        line.setAttributeNS(null, "x1", s[0]);
        line.setAttributeNS(null, "y1", s[1]);
        line.setAttributeNS(null, "x2", s[2]);
        line.setAttributeNS(null, "y2", s[3]);

        if (s[4] != null) {
          Object.keys(s[4]).forEach(function (key) {
            return line.setAttribute(key, s[4][key]);
          });
        }

        newSVG.appendChild(line);
      });

      if (o.string === false) {
        return newSVG;
      }

      var stringified = new win$1.XMLSerializer().serializeToString(newSVG);
      var beautified = vkXML(stringified);
      return beautified;
    }

    return lineSegments;
  };

  var css_colors = {
    "black": "#000000",
    "silver": "#c0c0c0",
    "gray": "#808080",
    "white": "#ffffff",
    "maroon": "#800000",
    "red": "#ff0000",
    "purple": "#800080",
    "fuchsia": "#ff00ff",
    "green": "#008000",
    "lime": "#00ff00",
    "olive": "#808000",
    "yellow": "#ffff00",
    "navy": "#000080",
    "blue": "#0000ff",
    "teal": "#008080",
    "aqua": "#00ffff",
    "orange": "#ffa500",
    "aliceblue": "#f0f8ff",
    "antiquewhite": "#faebd7",
    "aquamarine": "#7fffd4",
    "azure": "#f0ffff",
    "beige": "#f5f5dc",
    "bisque": "#ffe4c4",
    "blanchedalmond": "#ffebcd",
    "blueviolet": "#8a2be2",
    "brown": "#a52a2a",
    "burlywood": "#deb887",
    "cadetblue": "#5f9ea0",
    "chartreuse": "#7fff00",
    "chocolate": "#d2691e",
    "coral": "#ff7f50",
    "cornflowerblue": "#6495ed",
    "cornsilk": "#fff8dc",
    "crimson": "#dc143c",
    "cyan": "#00ffff",
    "darkblue": "#00008b",
    "darkcyan": "#008b8b",
    "darkgoldenrod": "#b8860b",
    "darkgray": "#a9a9a9",
    "darkgreen": "#006400",
    "darkgrey": "#a9a9a9",
    "darkkhaki": "#bdb76b",
    "darkmagenta": "#8b008b",
    "darkolivegreen": "#556b2f",
    "darkorange": "#ff8c00",
    "darkorchid": "#9932cc",
    "darkred": "#8b0000",
    "darksalmon": "#e9967a",
    "darkseagreen": "#8fbc8f",
    "darkslateblue": "#483d8b",
    "darkslategray": "#2f4f4f",
    "darkslategrey": "#2f4f4f",
    "darkturquoise": "#00ced1",
    "darkviolet": "#9400d3",
    "deeppink": "#ff1493",
    "deepskyblue": "#00bfff",
    "dimgray": "#696969",
    "dimgrey": "#696969",
    "dodgerblue": "#1e90ff",
    "firebrick": "#b22222",
    "floralwhite": "#fffaf0",
    "forestgreen": "#228b22",
    "gainsboro": "#dcdcdc",
    "ghostwhite": "#f8f8ff",
    "gold": "#ffd700",
    "goldenrod": "#daa520",
    "greenyellow": "#adff2f",
    "grey": "#808080",
    "honeydew": "#f0fff0",
    "hotpink": "#ff69b4",
    "indianred": "#cd5c5c",
    "indigo": "#4b0082",
    "ivory": "#fffff0",
    "khaki": "#f0e68c",
    "lavender": "#e6e6fa",
    "lavenderblush": "#fff0f5",
    "lawngreen": "#7cfc00",
    "lemonchiffon": "#fffacd",
    "lightblue": "#add8e6",
    "lightcoral": "#f08080",
    "lightcyan": "#e0ffff",
    "lightgoldenrodyellow": "#fafad2",
    "lightgray": "#d3d3d3",
    "lightgreen": "#90ee90",
    "lightgrey": "#d3d3d3",
    "lightpink": "#ffb6c1",
    "lightsalmon": "#ffa07a",
    "lightseagreen": "#20b2aa",
    "lightskyblue": "#87cefa",
    "lightslategray": "#778899",
    "lightslategrey": "#778899",
    "lightsteelblue": "#b0c4de",
    "lightyellow": "#ffffe0",
    "limegreen": "#32cd32",
    "linen": "#faf0e6",
    "magenta": "#ff00ff",
    "mediumaquamarine": "#66cdaa",
    "mediumblue": "#0000cd",
    "mediumorchid": "#ba55d3",
    "mediumpurple": "#9370db",
    "mediumseagreen": "#3cb371",
    "mediumslateblue": "#7b68ee",
    "mediumspringgreen": "#00fa9a",
    "mediumturquoise": "#48d1cc",
    "mediumvioletred": "#c71585",
    "midnightblue": "#191970",
    "mintcream": "#f5fffa",
    "mistyrose": "#ffe4e1",
    "moccasin": "#ffe4b5",
    "navajowhite": "#ffdead",
    "oldlace": "#fdf5e6",
    "olivedrab": "#6b8e23",
    "orangered": "#ff4500",
    "orchid": "#da70d6",
    "palegoldenrod": "#eee8aa",
    "palegreen": "#98fb98",
    "paleturquoise": "#afeeee",
    "palevioletred": "#db7093",
    "papayawhip": "#ffefd5",
    "peachpuff": "#ffdab9",
    "peru": "#cd853f",
    "pink": "#ffc0cb",
    "plum": "#dda0dd",
    "powderblue": "#b0e0e6",
    "rosybrown": "#bc8f8f",
    "royalblue": "#4169e1",
    "saddlebrown": "#8b4513",
    "salmon": "#fa8072",
    "sandybrown": "#f4a460",
    "seagreen": "#2e8b57",
    "seashell": "#fff5ee",
    "sienna": "#a0522d",
    "skyblue": "#87ceeb",
    "slateblue": "#6a5acd",
    "slategray": "#708090",
    "slategrey": "#708090",
    "snow": "#fffafa",
    "springgreen": "#00ff7f",
    "steelblue": "#4682b4",
    "tan": "#d2b48c",
    "thistle": "#d8bfd8",
    "tomato": "#ff6347",
    "turquoise": "#40e0d0",
    "violet": "#ee82ee",
    "wheat": "#f5deb3",
    "whitesmoke": "#f5f5f5",
    "yellowgreen": "#9acd32"
  };

  var css_color_names = Object.keys(css_colors);

  var hexToComponents = function hexToComponents(h) {
    var r = 0;
    var g = 0;
    var b = 0;
    var a = 255;

    if (h.length === 4) {
      r = "0x".concat(h[1]).concat(h[1]);
      g = "0x".concat(h[2]).concat(h[2]);
      b = "0x".concat(h[3]).concat(h[3]);
    } else if (h.length === 7) {
      r = "0x".concat(h[1]).concat(h[2]);
      g = "0x".concat(h[3]).concat(h[4]);
      b = "0x".concat(h[5]).concat(h[6]);
    } else if (h.length === 5) {
      r = "0x".concat(h[1]).concat(h[1]);
      g = "0x".concat(h[2]).concat(h[2]);
      b = "0x".concat(h[3]).concat(h[3]);
      a = "0x".concat(h[4]).concat(h[4]);
    } else if (h.length === 9) {
      r = "0x".concat(h[1]).concat(h[2]);
      g = "0x".concat(h[3]).concat(h[4]);
      b = "0x".concat(h[5]).concat(h[6]);
      a = "0x".concat(h[7]).concat(h[8]);
    }

    return [+(r / 255), +(g / 255), +(b / 255), +(a / 255)];
  };

  var color_to_assignment = function color_to_assignment(string) {
    if (string == null || typeof string !== "string") {
      return "U";
    }

    var c = [0, 0, 0, 1];

    if (string[0] === "#") {
      c = hexToComponents(string);
    } else if (css_color_names.indexOf(string) !== -1) {
      c = hexToComponents(css_colors[string]);
    }

    var ep = 0.05;

    if (c[0] < ep && c[1] < ep && c[2] < ep) {
      return "U";
    }

    if (c[0] > c[1] && c[0] - c[2] > ep) {
      return "M";
    }

    if (c[2] > c[1] && c[2] - c[0] > ep) {
      return "V";
    }

    return "U";
  };

  var EPSILON = 1e-6;

  var equivalent = function equivalent(a, b) {
    var epsilon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EPSILON;

    for (var i = 0; i < a.length; i += 1) {
      if (Math.abs(a[i] - b[i]) > epsilon) {
        return false;
      }
    }

    return true;
  };

  var edge_edge_comp_exclusive = function edge_edge_comp_exclusive(t0, t1) {
    return t0 > EPSILON && t0 < 1 - EPSILON && t1 > EPSILON && t1 < 1 - EPSILON;
  };

  var intersection_function = function intersection_function(aPt, aVec, bPt, bVec, compFunc) {
    var epsilon = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : EPSILON;

    function det(a, b) {
      return a[0] * b[1] - b[0] * a[1];
    }

    var denominator0 = det(aVec, bVec);

    if (Math.abs(denominator0) < epsilon) {
      return undefined;
    }

    var denominator1 = -denominator0;
    var numerator0 = det([bPt[0] - aPt[0], bPt[1] - aPt[1]], bVec);
    var numerator1 = det([aPt[0] - bPt[0], aPt[1] - bPt[1]], aVec);
    var t0 = numerator0 / denominator0;
    var t1 = numerator1 / denominator1;

    if (compFunc(t0, t1, epsilon)) {
      return [aPt[0] + aVec[0] * t0, aPt[1] + aVec[1] * t0];
    }

    return undefined;
  };

  var edge_edge_exclusive = function edge_edge_exclusive(a0, a1, b0, b1, epsilon) {
    var aVec = [a1[0] - a0[0], a1[1] - a0[1]];
    var bVec = [b1[0] - b0[0], b1[1] - b0[1]];
    return intersection_function(a0, aVec, b0, bVec, edge_edge_comp_exclusive, epsilon);
  };

  var point_on_edge_exclusive = function point_on_edge_exclusive(point, edge0, edge1) {
    var epsilon = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : EPSILON;
    var edge0_1 = [edge0[0] - edge1[0], edge0[1] - edge1[1]];
    var edge0_p = [edge0[0] - point[0], edge0[1] - point[1]];
    var edge1_p = [edge1[0] - point[0], edge1[1] - point[1]];
    var dEdge = Math.sqrt(edge0_1[0] * edge0_1[0] + edge0_1[1] * edge0_1[1]);
    var dP0 = Math.sqrt(edge0_p[0] * edge0_p[0] + edge0_p[1] * edge0_p[1]);
    var dP1 = Math.sqrt(edge1_p[0] * edge1_p[0] + edge1_p[1] * edge1_p[1]);
    return Math.abs(dEdge - dP0 - dP1) < epsilon;
  };

  var math = {
    core: {
      EPSILON: EPSILON,
      equivalent: equivalent,
      point_on_edge_exclusive: point_on_edge_exclusive,
      intersection: {
        edge_edge_exclusive: edge_edge_exclusive
      }
    }
  };

  var max_array_length = function max_array_length() {
    for (var _len = arguments.length, arrays = new Array(_len), _key = 0; _key < _len; _key++) {
      arrays[_key] = arguments[_key];
    }

    return Math.max.apply(Math, _toConsumableArray(arrays.filter(function (el) {
      return el !== undefined;
    }).map(function (el) {
      return el.length;
    })));
  };

  var vertices_count = function vertices_count(_ref) {
    var vertices_coords = _ref.vertices_coords,
        vertices_faces = _ref.vertices_faces,
        vertices_vertices = _ref.vertices_vertices;
    return max_array_length([], vertices_coords, vertices_faces, vertices_vertices);
  };

  var edges_count = function edges_count(_ref2) {
    var edges_vertices = _ref2.edges_vertices,
        edges_faces = _ref2.edges_faces;
    return max_array_length([], edges_vertices, edges_faces);
  };

  var faces_count = function faces_count(_ref3) {
    var faces_vertices = _ref3.faces_vertices,
        faces_edges = _ref3.faces_edges;
    return max_array_length([], faces_vertices, faces_edges);
  };

  var get_geometry_length = {
    vertices: vertices_count,
    edges: edges_count,
    faces: faces_count
  };

  var remove_geometry_key_indices = function remove_geometry_key_indices(graph, key, removeIndices) {
    var geometry_array_size = get_geometry_length[key](graph);
    var removes = Array(geometry_array_size).fill(false);
    removeIndices.forEach(function (v) {
      removes[v] = true;
    });
    var s = 0;
    var index_map = removes.map(function (remove) {
      return remove ? --s : s;
    });

    if (removeIndices.length === 0) {
      return index_map;
    }

    var prefix = "".concat(key, "_");
    var suffix = "_".concat(key);
    var graph_keys = Object.keys(graph);
    var prefixKeys = graph_keys.map(function (str) {
      return str.substring(0, prefix.length) === prefix ? str : undefined;
    }).filter(function (str) {
      return str !== undefined;
    });
    var suffixKeys = graph_keys.map(function (str) {
      return str.substring(str.length - suffix.length, str.length) === suffix ? str : undefined;
    }).filter(function (str) {
      return str !== undefined;
    });
    suffixKeys.forEach(function (sKey) {
      return graph[sKey].forEach(function (_, i) {
        return graph[sKey][i].forEach(function (v, j) {
          graph[sKey][i][j] += index_map[v];
        });
      });
    });
    prefixKeys.forEach(function (pKey) {
      graph[pKey] = graph[pKey].filter(function (_, i) {
        return !removes[i];
      });
    });
    return index_map;
  };

  var edges_vertices_equivalent = function edges_vertices_equivalent(a, b) {
    return a[0] === b[0] && a[1] === b[1] || a[0] === b[1] && a[1] === b[0];
  };

  var make_edges_collinearVertices = function make_edges_collinearVertices(_ref) {
    var vertices_coords = _ref.vertices_coords,
        edges_vertices = _ref.edges_vertices;
    var epsilon = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : math.core.EPSILON;
    var edges = edges_vertices.map(function (ev) {
      return ev.map(function (v) {
        return vertices_coords[v];
      });
    });
    return edges.map(function (e) {
      return vertices_coords.filter(function (v) {
        return math.core.point_on_edge_exclusive(v, e[0], e[1], epsilon);
      });
    });
  };

  var make_edges_alignment = function make_edges_alignment(_ref2) {
    var vertices_coords = _ref2.vertices_coords,
        edges_vertices = _ref2.edges_vertices;
    var edges = edges_vertices.map(function (ev) {
      return ev.map(function (v) {
        return vertices_coords[v];
      });
    });
    var edges_vector = edges.map(function (e) {
      return [e[1][0] - e[0][0], e[1][1] - e[0][1]];
    });
    var edges_magnitude = edges_vector.map(function (e) {
      return Math.sqrt(e[0] * e[0] + e[1] * e[1]);
    });
    var edges_normalized = edges_vector.map(function (e, i) {
      return [e[0] / edges_magnitude[i], e[1] / edges_magnitude[i]];
    });
    return edges_normalized.map(function (e) {
      return Math.abs(e[0]) > 0.707;
    });
  };

  var make_edges_intersections = function make_edges_intersections(_ref3) {
    var vertices_coords = _ref3.vertices_coords,
        edges_vertices = _ref3.edges_vertices;
    var epsilon = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : math.core.EPSILON;
    var edge_count = edges_vertices.length;
    var edges = edges_vertices.map(function (ev) {
      return ev.map(function (v) {
        return vertices_coords[v];
      });
    });
    var crossings = Array.from(Array(edge_count - 1)).map(function () {
      return [];
    });

    for (var i = 0; i < edges.length - 1; i += 1) {
      for (var j = i + 1; j < edges.length; j += 1) {
        crossings[i][j] = math.core.intersection.edge_edge_exclusive(edges[i][0], edges[i][1], edges[j][0], edges[j][1], epsilon);
      }
    }

    var edges_intersections = Array.from(Array(edge_count)).map(function () {
      return [];
    });

    for (var _i = 0; _i < edges.length - 1; _i += 1) {
      for (var _j = _i + 1; _j < edges.length; _j += 1) {
        if (crossings[_i][_j] != null) {
          edges_intersections[_i].push(crossings[_i][_j]);

          edges_intersections[_j].push(crossings[_i][_j]);
        }
      }
    }

    return edges_intersections;
  };

  var fragment = function fragment(graph) {
    var epsilon = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : math.core.EPSILON;

    var horizSort = function horizSort(a, b) {
      return a[0] - b[0];
    };

    var vertSort = function vertSort(a, b) {
      return a[1] - b[1];
    };

    var edges_alignment = make_edges_alignment(graph);
    var edges = graph.edges_vertices.map(function (ev) {
      return ev.map(function (v) {
        return graph.vertices_coords[v];
      });
    });
    edges.forEach(function (e, i) {
      return e.sort(edges_alignment[i] ? horizSort : vertSort);
    });
    var edges_intersections = make_edges_intersections(graph, epsilon);
    var edges_collinearVertices = make_edges_collinearVertices(graph, epsilon);
    var new_edges_vertices = edges_intersections.map(function (a, i) {
      return a.concat(edges_collinearVertices[i]);
    });
    new_edges_vertices.forEach(function (e, i) {
      return e.sort(edges_alignment[i] ? horizSort : vertSort);
    });
    var new_edges = new_edges_vertices.map(function (ev) {
      return Array.from(Array(ev.length - 1)).map(function (_, i) {
        return [ev[i], ev[i + 1]];
      });
    });
    new_edges = new_edges.map(function (edgeGroup) {
      return edgeGroup.filter(function (e) {
        return false === e.map(function (_, i) {
          return Math.abs(e[0][i] - e[1][i]) < epsilon;
        }).reduce(function (a, b) {
          return a && b;
        }, true);
      });
    });
    var edge_map = new_edges.map(function (edge, i) {
      return edge.map(function () {
        return i;
      });
    }).reduce(function (a, b) {
      return a.concat(b);
    }, []);
    var vertices_coords = new_edges.map(function (edge) {
      return edge.reduce(function (a, b) {
        return a.concat(b);
      }, []);
    }).reduce(function (a, b) {
      return a.concat(b);
    }, []);
    var counter = 0;
    var edges_vertices = new_edges.map(function (edge) {
      return edge.map(function () {
        return [counter++, counter++];
      });
    }).reduce(function (a, b) {
      return a.concat(b);
    }, []);
    var vertices_equivalent = Array.from(Array(vertices_coords.length)).map(function () {
      return [];
    });

    for (var i = 0; i < vertices_coords.length - 1; i += 1) {
      for (var j = i + 1; j < vertices_coords.length; j += 1) {
        vertices_equivalent[i][j] = math.core.equivalent(vertices_coords[i], vertices_coords[j], epsilon);
      }
    }

    var vertices_map = vertices_coords.map(function () {
      return undefined;
    });
    vertices_equivalent.forEach(function (row, i) {
      return row.forEach(function (eq, j) {
        if (eq) {
          vertices_map[j] = vertices_map[i] === undefined ? i : vertices_map[i];
        }
      });
    });
    var vertices_remove = vertices_map.map(function (m) {
      return m !== undefined;
    });
    vertices_map.forEach(function (map, i) {
      if (map === undefined) {
        vertices_map[i] = i;
      }
    });
    edges_vertices.forEach(function (edge, i) {
      return edge.forEach(function (v, j) {
        edges_vertices[i][j] = vertices_map[v];
      });
    });
    var edges_equivalent = Array.from(Array(edges_vertices.length)).map(function () {
      return [];
    });

    for (var _i2 = 0; _i2 < edges_vertices.length - 1; _i2 += 1) {
      for (var _j2 = _i2 + 1; _j2 < edges_vertices.length; _j2 += 1) {
        edges_equivalent[_i2][_j2] = edges_vertices_equivalent(edges_vertices[_i2], edges_vertices[_j2]);
      }
    }

    var edges_map = edges_vertices.map(function () {
      return undefined;
    });
    edges_equivalent.forEach(function (row, i) {
      return row.forEach(function (eq, j) {
        if (eq) {
          edges_map[i] = edges_map[j] === undefined ? j : edges_map[j];
        }
      });
    });
    var edges_dont_remove = edges_map.map(function (m) {
      return m === undefined;
    });
    edges_map.forEach(function (map, i) {
      if (map === undefined) {
        edges_map[i] = i;
      }
    });
    var edges_vertices_cl = edges_vertices.filter(function (_, i) {
      return edges_dont_remove[i];
    });
    var edge_map_cl = edge_map.filter(function (_, i) {
      return edges_dont_remove[i];
    });
    var flat = {
      vertices_coords: vertices_coords,
      edges_vertices: edges_vertices_cl
    };

    if ("edges_assignment" in graph === true) {
      flat.edges_assignment = edge_map_cl.map(function (i) {
        return graph.edges_assignment[i];
      });
    }

    if ("edges_foldAngle" in graph === true) {
      flat.edges_foldAngle = edge_map_cl.map(function (i) {
        return graph.edges_foldAngle[i];
      });
    }

    var vertices_remove_indices = vertices_remove.map(function (rm, i) {
      return rm ? i : undefined;
    }).filter(function (i) {
      return i !== undefined;
    });
    remove_geometry_key_indices(flat, "vertices", vertices_remove_indices);
    return flat;
  };

  var geom = {},
      modulo = function modulo(a, b) {
    return (+a % (b = +b) + b) % b;
  };

  geom.EPS = 0.000001;

  geom.sum = function (a, b) {
    return a + b;
  };

  geom.min = function (a, b) {
    if (a < b) {
      return a;
    } else {
      return b;
    }
  };

  geom.max = function (a, b) {
    if (a > b) {
      return a;
    } else {
      return b;
    }
  };

  geom.all = function (a, b) {
    return a && b;
  };

  geom.next = function (start, n, i) {
    if (i == null) {
      i = 1;
    }

    return modulo(start + i, n);
  };

  geom.rangesDisjoint = function (arg, arg1) {
    var a1, a2, b1, b2, ref, ref1;
    a1 = arg[0], a2 = arg[1];
    b1 = arg1[0], b2 = arg1[1];
    return b1 < (ref = Math.min(a1, a2)) && ref > b2 || b1 > (ref1 = Math.max(a1, a2)) && ref1 < b2;
  };

  geom.topologicalSort = function (vs) {
    var k, l, len, len1, list, ref, v;

    for (k = 0, len = vs.length; k < len; k++) {
      v = vs[k];
      ref = [false, null], v.visited = ref[0], v.parent = ref[1];
    }

    list = [];

    for (l = 0, len1 = vs.length; l < len1; l++) {
      v = vs[l];

      if (!v.visited) {
        list = geom.visit(v, list);
      }
    }

    return list;
  };

  geom.visit = function (v, list) {
    var k, len, ref, u;
    v.visited = true;
    ref = v.children;

    for (k = 0, len = ref.length; k < len; k++) {
      u = ref[k];

      if (!!u.visited) {
        continue;
      }

      u.parent = v;
      list = geom.visit(u, list);
    }

    return list.concat([v]);
  };

  geom.magsq = function (a) {
    return geom.dot(a, a);
  };

  geom.mag = function (a) {
    return Math.sqrt(geom.magsq(a));
  };

  geom.unit = function (a, eps) {
    var length;

    if (eps == null) {
      eps = geom.EPS;
    }

    length = geom.magsq(a);

    if (length < eps) {
      return null;
    }

    return geom.mul(a, 1 / geom.mag(a));
  };

  geom.ang2D = function (a, eps) {
    if (eps == null) {
      eps = geom.EPS;
    }

    if (geom.magsq(a) < eps) {
      return null;
    }

    return Math.atan2(a[1], a[0]);
  };

  geom.mul = function (a, s) {
    var i, k, len, results;
    results = [];

    for (k = 0, len = a.length; k < len; k++) {
      i = a[k];
      results.push(i * s);
    }

    return results;
  };

  geom.linearInterpolate = function (t, a, b) {
    return geom.plus(geom.mul(a, 1 - t), geom.mul(b, t));
  };

  geom.plus = function (a, b) {
    var ai, i, k, len, results;
    results = [];

    for (i = k = 0, len = a.length; k < len; i = ++k) {
      ai = a[i];
      results.push(ai + b[i]);
    }

    return results;
  };

  geom.sub = function (a, b) {
    return geom.plus(a, geom.mul(b, -1));
  };

  geom.dot = function (a, b) {
    var ai, i;
    return function () {
      var k, len, results;
      results = [];

      for (i = k = 0, len = a.length; k < len; i = ++k) {
        ai = a[i];
        results.push(ai * b[i]);
      }

      return results;
    }().reduce(geom.sum);
  };

  geom.distsq = function (a, b) {
    return geom.magsq(geom.sub(a, b));
  };

  geom.dist = function (a, b) {
    return Math.sqrt(geom.distsq(a, b));
  };

  geom.closestIndex = function (a, bs) {
    var b, dist, i, k, len, minDist, minI;
    minDist = 2e308;

    for (i = k = 0, len = bs.length; k < len; i = ++k) {
      b = bs[i];

      if (minDist > (dist = geom.dist(a, b))) {
        minDist = dist;
        minI = i;
      }
    }

    return minI;
  };

  geom.dir = function (a, b) {
    return geom.unit(geom.sub(b, a));
  };

  geom.ang = function (a, b) {
    var ref, ua, ub, v;
    ref = function () {
      var k, len, ref, results;
      ref = [a, b];
      results = [];

      for (k = 0, len = ref.length; k < len; k++) {
        v = ref[k];
        results.push(geom.unit(v));
      }

      return results;
    }(), ua = ref[0], ub = ref[1];

    if (!(ua != null && ub != null)) {
      return null;
    }

    return Math.acos(geom.dot(ua, ub));
  };

  geom.cross = function (a, b) {
    var i, j, ref, ref1;

    if (a.length === (ref = b.length) && ref === 2) {
      return a[0] * b[1] - a[1] * b[0];
    }

    if (a.length === (ref1 = b.length) && ref1 === 3) {
      return function () {
        var k, len, ref2, ref3, results;
        ref2 = [[1, 2], [2, 0], [0, 1]];
        results = [];

        for (k = 0, len = ref2.length; k < len; k++) {
          ref3 = ref2[k], i = ref3[0], j = ref3[1];
          results.push(a[i] * b[j] - a[j] * b[i]);
        }

        return results;
      }();
    }

    return null;
  };

  geom.parallel = function (a, b, eps) {
    var ref, ua, ub, v;

    if (eps == null) {
      eps = geom.EPS;
    }

    ref = function () {
      var k, len, ref, results;
      ref = [a, b];
      results = [];

      for (k = 0, len = ref.length; k < len; k++) {
        v = ref[k];
        results.push(geom.unit(v));
      }

      return results;
    }(), ua = ref[0], ub = ref[1];

    if (!(ua != null && ub != null)) {
      return null;
    }

    return 1 - Math.abs(geom.dot(ua, ub)) < eps;
  };

  geom.rotate = function (a, u, t) {
    var ct, i, k, len, p, q, ref, ref1, results, st;
    u = geom.unit(u);

    if (u == null) {
      return null;
    }

    ref = [Math.cos(t), Math.sin(t)], ct = ref[0], st = ref[1];
    ref1 = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
    results = [];

    for (k = 0, len = ref1.length; k < len; k++) {
      p = ref1[k];
      results.push(function () {
        var l, len1, ref2, results1;
        ref2 = [ct, -st * u[p[2]], st * u[p[1]]];
        results1 = [];

        for (i = l = 0, len1 = ref2.length; l < len1; i = ++l) {
          q = ref2[i];
          results1.push(a[p[i]] * (u[p[0]] * u[p[i]] * (1 - ct) + q));
        }

        return results1;
      }().reduce(geom.sum));
    }

    return results;
  };

  geom.interiorAngle = function (a, b, c) {
    var ang;
    ang = geom.ang2D(geom.sub(a, b)) - geom.ang2D(geom.sub(c, b));
    return ang + (ang < 0 ? 2 * Math.PI : 0);
  };

  geom.turnAngle = function (a, b, c) {
    return Math.PI - geom.interiorAngle(a, b, c);
  };

  geom.triangleNormal = function (a, b, c) {
    return geom.unit(geom.cross(geom.sub(b, a), geom.sub(c, b)));
  };

  geom.polygonNormal = function (points, eps) {
    var i, p;

    if (eps == null) {
      eps = geom.EPS;
    }

    return geom.unit(function () {
      var k, len, results;
      results = [];

      for (i = k = 0, len = points.length; k < len; i = ++k) {
        p = points[i];
        results.push(geom.cross(p, points[geom.next(i, points.length)]));
      }

      return results;
    }().reduce(geom.plus), eps);
  };

  geom.twiceSignedArea = function (points) {
    var i, v0, v1;
    return function () {
      var k, len, results;
      results = [];

      for (i = k = 0, len = points.length; k < len; i = ++k) {
        v0 = points[i];
        v1 = points[geom.next(i, points.length)];
        results.push(v0[0] * v1[1] - v1[0] * v0[1]);
      }

      return results;
    }().reduce(geom.sum);
  };

  geom.polygonOrientation = function (points) {
    return Math.sign(geom.twiceSignedArea(points));
  };

  geom.sortByAngle = function (points, origin, mapping) {
    if (origin == null) {
      origin = [0, 0];
    }

    if (mapping == null) {
      mapping = function mapping(x) {
        return x;
      };
    }

    origin = mapping(origin);
    return points.sort(function (p, q) {
      var pa, qa;
      pa = geom.ang2D(geom.sub(mapping(p), origin));
      qa = geom.ang2D(geom.sub(mapping(q), origin));
      return pa - qa;
    });
  };

  geom.segmentsCross = function (arg, arg1) {
    var p0, p1, q0, q1;
    p0 = arg[0], q0 = arg[1];
    p1 = arg1[0], q1 = arg1[1];

    if (geom.rangesDisjoint([p0[0], q0[0]], [p1[0], q1[0]]) || geom.rangesDisjoint([p0[1], q0[1]], [p1[1], q1[1]])) {
      return false;
    }

    return geom.polygonOrientation([p0, q0, p1]) !== geom.polygonOrientation([p0, q0, q1]) && geom.polygonOrientation([p1, q1, p0]) !== geom.polygonOrientation([p1, q1, q0]);
  };

  geom.parametricLineIntersect = function (arg, arg1) {
    var denom, p1, p2, q1, q2;
    p1 = arg[0], p2 = arg[1];
    q1 = arg1[0], q2 = arg1[1];
    denom = (q2[1] - q1[1]) * (p2[0] - p1[0]) + (q1[0] - q2[0]) * (p2[1] - p1[1]);

    if (denom === 0) {
      return [null, null];
    } else {
      return [(q2[0] * (p1[1] - q1[1]) + q2[1] * (q1[0] - p1[0]) + q1[1] * p1[0] - p1[1] * q1[0]) / denom, (q1[0] * (p2[1] - p1[1]) + q1[1] * (p1[0] - p2[0]) + p1[1] * p2[0] - p2[1] * p1[0]) / denom];
    }
  };

  geom.segmentIntersectSegment = function (s1, s2) {
    var ref, s, t;
    ref = geom.parametricLineIntersect(s1, s2), s = ref[0], t = ref[1];

    if (s != null && 0 <= s && s <= 1 && 0 <= t && t <= 1) {
      return geom.linearInterpolate(s, s1[0], s1[1]);
    } else {
      return null;
    }
  };

  geom.lineIntersectLine = function (l1, l2) {
    var ref, s, t;
    ref = geom.parametricLineIntersect(l1, l2), s = ref[0], t = ref[1];

    if (s != null) {
      return geom.linearInterpolate(s, l1[0], l1[1]);
    } else {
      return null;
    }
  };

  geom.pointStrictlyInSegment = function (p, s, eps) {
    var v0, v1;

    if (eps == null) {
      eps = geom.EPS;
    }

    v0 = geom.sub(p, s[0]);
    v1 = geom.sub(p, s[1]);
    return geom.parallel(v0, v1, eps) && geom.dot(v0, v1) < 0;
  };

  geom.centroid = function (points) {
    return geom.mul(points.reduce(geom.plus), 1.0 / points.length);
  };

  geom.basis = function (ps, eps) {
    var d, ds, n, ns, p, x, y, z;

    if (eps == null) {
      eps = geom.EPS;
    }

    if (function () {
      var k, len, results;
      results = [];

      for (k = 0, len = ps.length; k < len; k++) {
        p = ps[k];
        results.push(p.length !== 3);
      }

      return results;
    }().reduce(geom.all)) {
      return null;
    }

    ds = function () {
      var k, len, results;
      results = [];

      for (k = 0, len = ps.length; k < len; k++) {
        p = ps[k];

        if (geom.distsq(p, ps[0]) > eps) {
          results.push(geom.dir(p, ps[0]));
        }
      }

      return results;
    }();

    if (ds.length === 0) {
      return [];
    }

    x = ds[0];

    if (function () {
      var k, len, results;
      results = [];

      for (k = 0, len = ds.length; k < len; k++) {
        d = ds[k];
        results.push(geom.parallel(d, x, eps));
      }

      return results;
    }().reduce(geom.all)) {
      return [x];
    }

    ns = function () {
      var k, len, results;
      results = [];

      for (k = 0, len = ds.length; k < len; k++) {
        d = ds[k];
        results.push(geom.unit(geom.cross(d, x)));
      }

      return results;
    }();

    ns = function () {
      var k, len, results;
      results = [];

      for (k = 0, len = ns.length; k < len; k++) {
        n = ns[k];

        if (n != null) {
          results.push(n);
        }
      }

      return results;
    }();

    z = ns[0];
    y = geom.cross(z, x);

    if (function () {
      var k, len, results;
      results = [];

      for (k = 0, len = ns.length; k < len; k++) {
        n = ns[k];
        results.push(geom.parallel(n, z, eps));
      }

      return results;
    }().reduce(geom.all)) {
      return [x, y];
    }

    return [x, y, z];
  };

  geom.above = function (ps, qs, n, eps) {
    var pn, qn, ref, v, vs;

    if (eps == null) {
      eps = geom.EPS;
    }

    ref = function () {
      var k, len, ref, results;
      ref = [ps, qs];
      results = [];

      for (k = 0, len = ref.length; k < len; k++) {
        vs = ref[k];
        results.push(function () {
          var l, len1, results1;
          results1 = [];

          for (l = 0, len1 = vs.length; l < len1; l++) {
            v = vs[l];
            results1.push(geom.dot(v, n));
          }

          return results1;
        }());
      }

      return results;
    }(), pn = ref[0], qn = ref[1];

    if (qn.reduce(geom.max) - pn.reduce(geom.min) < eps) {
      return 1;
    }

    if (pn.reduce(geom.max) - qn.reduce(geom.min) < eps) {
      return -1;
    }

    return 0;
  };

  geom.separatingDirection2D = function (t1, t2, n, eps) {
    var i, j, k, l, len, len1, len2, m, o, p, q, ref, sign, t;

    if (eps == null) {
      eps = geom.EPS;
    }

    ref = [t1, t2];

    for (k = 0, len = ref.length; k < len; k++) {
      t = ref[k];

      for (i = l = 0, len1 = t.length; l < len1; i = ++l) {
        p = t[i];

        for (j = o = 0, len2 = t.length; o < len2; j = ++o) {
          q = t[j];

          if (!(i < j)) {
            continue;
          }

          m = geom.unit(geom.cross(geom.sub(p, q), n));

          if (m != null) {
            sign = geom.above(t1, t2, m, eps);

            if (sign !== 0) {
              return geom.mul(m, sign);
            }
          }
        }
      }
    }

    return null;
  };

  geom.separatingDirection3D = function (t1, t2, eps) {
    var i, j, k, l, len, len1, len2, len3, m, o, p, q1, q2, r, ref, ref1, sign, x1, x2;

    if (eps == null) {
      eps = geom.EPS;
    }

    ref = [[t1, t2], [t2, t1]];

    for (k = 0, len = ref.length; k < len; k++) {
      ref1 = ref[k], x1 = ref1[0], x2 = ref1[1];

      for (l = 0, len1 = x1.length; l < len1; l++) {
        p = x1[l];

        for (i = o = 0, len2 = x2.length; o < len2; i = ++o) {
          q1 = x2[i];

          for (j = r = 0, len3 = x2.length; r < len3; j = ++r) {
            q2 = x2[j];

            if (!(i < j)) {
              continue;
            }

            m = geom.unit(geom.cross(geom.sub(p, q1), geom.sub(p, q2)));

            if (m != null) {
              sign = geom.above(t1, t2, m, eps);

              if (sign !== 0) {
                return geom.mul(m, sign);
              }
            }
          }
        }
      }
    }

    return null;
  };

  geom.circleCross = function (d, r1, r2) {
    var x, y;
    x = (d * d - r2 * r2 + r1 * r1) / d / 2;
    y = Math.sqrt(r1 * r1 - x * x);
    return [x, y];
  };

  geom.creaseDir = function (u1, u2, a, b, eps) {
    var b1, b2, x, y, z, zmag;

    if (eps == null) {
      eps = geom.EPS;
    }

    b1 = Math.cos(a) + Math.cos(b);
    b2 = Math.cos(a) - Math.cos(b);
    x = geom.plus(u1, u2);
    y = geom.sub(u1, u2);
    z = geom.unit(geom.cross(y, x));
    x = geom.mul(x, b1 / geom.magsq(x));
    y = geom.mul(y, geom.magsq(y) < eps ? 0 : b2 / geom.magsq(y));
    zmag = Math.sqrt(1 - geom.magsq(x) - geom.magsq(y));
    z = geom.mul(z, zmag);
    return [x, y, z].reduce(geom.plus);
  };

  geom.quadSplit = function (u, p, d, t) {
    if (geom.magsq(p) > d * d) {
      throw new Error("STOP! Trying to split expansive quad.");
    }

    return geom.mul(u, (d * d - geom.magsq(p)) / 2 / (d * Math.cos(t) - geom.dot(u, p)));
  };

  var filter = {};

  var indexOf = [].indexOf || function (item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (i in this && this[i] === item) return i;
    }

    return -1;
  };

  filter.edgesAssigned = function (fold, target) {
    var assignment, i, k, len, ref, results;
    ref = fold.edges_assignment;
    results = [];

    for (i = k = 0, len = ref.length; k < len; i = ++k) {
      assignment = ref[i];

      if (assignment === target) {
        results.push(i);
      }
    }

    return results;
  };

  filter.mountainEdges = function (fold) {
    return filter.edgesAssigned(fold, 'M');
  };

  filter.valleyEdges = function (fold) {
    return filter.edgesAssigned(fold, 'V');
  };

  filter.flatEdges = function (fold) {
    return filter.edgesAssigned(fold, 'F');
  };

  filter.boundaryEdges = function (fold) {
    return filter.edgesAssigned(fold, 'B');
  };

  filter.unassignedEdges = function (fold) {
    return filter.edgesAssigned(fold, 'U');
  };

  filter.keysStartingWith = function (fold, prefix) {
    var key, results;
    results = [];

    for (key in fold) {
      if (key.slice(0, prefix.length) === prefix) {
        results.push(key);
      }
    }

    return results;
  };

  filter.keysEndingWith = function (fold, suffix) {
    var key, results;
    results = [];

    for (key in fold) {
      if (key.slice(-suffix.length) === suffix) {
        results.push(key);
      }
    }

    return results;
  };

  filter.remapField = function (fold, field, old2new) {
    var array, i, j, k, key, l, len, len1, len2, m, new2old, old, ref, ref1;
    new2old = [];

    for (i = k = 0, len = old2new.length; k < len; i = ++k) {
      j = old2new[i];

      if (j != null) {
        new2old[j] = i;
      }
    }

    ref = filter.keysStartingWith(fold, field + "_");

    for (l = 0, len1 = ref.length; l < len1; l++) {
      key = ref[l];

      fold[key] = function () {
        var len2, m, results;
        results = [];

        for (m = 0, len2 = new2old.length; m < len2; m++) {
          old = new2old[m];
          results.push(fold[key][old]);
        }

        return results;
      }();
    }

    ref1 = filter.keysEndingWith(fold, "_" + field);

    for (m = 0, len2 = ref1.length; m < len2; m++) {
      key = ref1[m];

      fold[key] = function () {
        var len3, n, ref2, results;
        ref2 = fold[key];
        results = [];

        for (n = 0, len3 = ref2.length; n < len3; n++) {
          array = ref2[n];
          results.push(function () {
            var len4, o, results1;
            results1 = [];

            for (o = 0, len4 = array.length; o < len4; o++) {
              old = array[o];
              results1.push(old2new[old]);
            }

            return results1;
          }());
        }

        return results;
      }();
    }

    return fold;
  };

  filter.remapFieldSubset = function (fold, field, keep) {
    var id, old2new, value;
    id = 0;

    old2new = function () {
      var k, len, results;
      results = [];

      for (k = 0, len = keep.length; k < len; k++) {
        value = keep[k];

        if (value) {
          results.push(id++);
        } else {
          results.push(null);
        }
      }

      return results;
    }();

    filter.remapField(fold, field, old2new);
    return old2new;
  };

  filter.numType = function (fold, type) {
    var counts, key, value;

    counts = function () {
      var k, len, ref, results;
      ref = filter.keysStartingWith(fold, type + "_");
      results = [];

      for (k = 0, len = ref.length; k < len; k++) {
        key = ref[k];
        value = fold[key];

        if (value.length == null) {
          continue;
        }

        results.push(value.length);
      }

      return results;
    }();

    if (!counts.length) {
      counts = function () {
        var k, len, ref, results;
        ref = filter.keysEndingWith(fold, "_" + type);
        results = [];

        for (k = 0, len = ref.length; k < len; k++) {
          key = ref[k];
          results.push(1 + Math.max.apply(Math, fold[key]));
        }

        return results;
      }();
    }

    if (counts.length) {
      return Math.max.apply(Math, counts);
    } else {
      return 0;
    }
  };

  filter.numVertices = function (fold) {
    return filter.numType(fold, 'vertices');
  };

  filter.numEdges = function (fold) {
    return filter.numType(fold, 'edges');
  };

  filter.numFaces = function (fold) {
    return filter.numType(fold, 'faces');
  };

  filter.removeDuplicateEdges_vertices = function (fold) {
    var edge, id, key, old2new, seen, v, w;
    seen = {};
    id = 0;

    old2new = function () {
      var k, len, ref, results;
      ref = fold.edges_vertices;
      results = [];

      for (k = 0, len = ref.length; k < len; k++) {
        edge = ref[k];
        v = edge[0], w = edge[1];

        if (v < w) {
          key = v + "," + w;
        } else {
          key = w + "," + v;
        }

        if (!(key in seen)) {
          seen[key] = id;
          id += 1;
        }

        results.push(seen[key]);
      }

      return results;
    }();

    filter.remapField(fold, 'edges', old2new);
    return old2new;
  };

  filter.edges_verticesIncident = function (e1, e2) {
    var k, len, v;

    for (k = 0, len = e1.length; k < len; k++) {
      v = e1[k];

      if (indexOf.call(e2, v) >= 0) {
        return v;
      }
    }

    return null;
  };

  var RepeatedPointsDS = function () {
    function RepeatedPointsDS(vertices_coords, epsilon1) {
      var base, coord, k, len, name, ref, v;
      this.vertices_coords = vertices_coords;
      this.epsilon = epsilon1;
      this.hash = {};
      ref = this.vertices_coords;

      for (v = k = 0, len = ref.length; k < len; v = ++k) {
        coord = ref[v];
        ((base = this.hash)[name = this.key(coord)] != null ? base[name] : base[name] = []).push(v);
      }
    }

    RepeatedPointsDS.prototype.lookup = function (coord) {
      var k, key, l, len, len1, len2, m, ref, ref1, ref2, ref3, v, x, xr, xt, y, yr, yt;
      x = coord[0], y = coord[1];
      xr = Math.round(x / this.epsilon);
      yr = Math.round(y / this.epsilon);
      ref = [xr, xr - 1, xr + 1];

      for (k = 0, len = ref.length; k < len; k++) {
        xt = ref[k];
        ref1 = [yr, yr - 1, yr + 1];

        for (l = 0, len1 = ref1.length; l < len1; l++) {
          yt = ref1[l];
          key = xt + "," + yt;
          ref3 = (ref2 = this.hash[key]) != null ? ref2 : [];

          for (m = 0, len2 = ref3.length; m < len2; m++) {
            v = ref3[m];

            if (this.epsilon > geom.dist(this.vertices_coords[v], coord)) {
              return v;
            }
          }
        }
      }

      return null;
    };

    RepeatedPointsDS.prototype.key = function (coord) {
      var key, x, xr, y, yr;
      x = coord[0], y = coord[1];
      xr = Math.round(x / this.epsilon);
      yr = Math.round(y / this.epsilon);
      return key = xr + "," + yr;
    };

    RepeatedPointsDS.prototype.insert = function (coord) {
      var base, name, v;
      v = this.lookup(coord);

      if (v != null) {
        return v;
      }

      ((base = this.hash)[name = this.key(coord)] != null ? base[name] : base[name] = []).push(v = this.vertices_coords.length);
      this.vertices_coords.push(coord);
      return v;
    };

    return RepeatedPointsDS;
  }();

  filter.collapseNearbyVertices = function (fold, epsilon) {
    var coords, old2new, vertices;
    vertices = new RepeatedPointsDS([], epsilon);

    old2new = function () {
      var k, len, ref, results;
      ref = fold.vertices_coords;
      results = [];

      for (k = 0, len = ref.length; k < len; k++) {
        coords = ref[k];
        results.push(vertices.insert(coords));
      }

      return results;
    }();

    return filter.remapField(fold, 'vertices', old2new);
  };

  filter.maybeAddVertex = function (fold, coords, epsilon) {
    var i;
    i = geom.closestIndex(coords, fold.vertices_coords);

    if (i != null && epsilon >= geom.dist(coords, fold.vertices_coords[i])) {
      return i;
    } else {
      return fold.vertices_coords.push(coords) - 1;
    }
  };

  filter.addVertexLike = function (fold, oldVertexIndex) {
    var k, key, len, ref, vNew;
    vNew = filter.numVertices(fold);
    ref = filter.keysStartingWith(fold, 'vertices_');

    for (k = 0, len = ref.length; k < len; k++) {
      key = ref[k];

      switch (key.slice(6)) {
        case 'vertices':
          break;

        default:
          fold[key][vNew] = fold[key][oldVertexIndex];
      }
    }

    return vNew;
  };

  filter.addEdgeLike = function (fold, oldEdgeIndex, v1, v2) {
    var eNew, k, key, len, ref;
    eNew = fold.edges_vertices.length;
    ref = filter.keysStartingWith(fold, 'edges_');

    for (k = 0, len = ref.length; k < len; k++) {
      key = ref[k];

      switch (key.slice(6)) {
        case 'vertices':
          fold.edges_vertices.push([v1 != null ? v1 : fold.edges_vertices[oldEdgeIndex][0], v2 != null ? v2 : fold.edges_vertices[oldEdgeIndex][1]]);
          break;

        case 'edges':
          break;

        default:
          fold[key][eNew] = fold[key][oldEdgeIndex];
      }
    }

    return eNew;
  };

  filter.addVertexAndSubdivide = function (fold, coords, epsilon) {
    var changedEdges, e, i, iNew, k, len, ref, s, u, v;
    v = filter.maybeAddVertex(fold, coords, epsilon);
    changedEdges = [];

    if (v === fold.vertices_coords.length - 1) {
      ref = fold.edges_vertices;

      for (i = k = 0, len = ref.length; k < len; i = ++k) {
        e = ref[i];

        if (indexOf.call(e, v) >= 0) {
          continue;
        }

        s = function () {
          var l, len1, results;
          results = [];

          for (l = 0, len1 = e.length; l < len1; l++) {
            u = e[l];
            results.push(fold.vertices_coords[u]);
          }

          return results;
        }();

        if (geom.pointStrictlyInSegment(coords, s)) {
          iNew = filter.addEdgeLike(fold, i, v, e[1]);
          changedEdges.push(i, iNew);
          e[1] = v;
        }
      }
    }

    return [v, changedEdges];
  };

  filter.removeLoopEdges = function (fold) {
    var edge;
    return filter.remapFieldSubset(fold, 'edges', function () {
      var k, len, ref, results;
      ref = fold.edges_vertices;
      results = [];

      for (k = 0, len = ref.length; k < len; k++) {
        edge = ref[k];
        results.push(edge[0] !== edge[1]);
      }

      return results;
    }());
  };

  filter.subdivideCrossingEdges_vertices = function (fold, epsilon, involvingEdgesFrom) {
    var addEdge, changedEdges, cross, crossI, e, e1, e2, i, i1, i2, k, l, len, len1, len2, len3, m, n, old2new, p, ref, ref1, ref2, ref3, s, s1, s2, u, v, vertices;
    changedEdges = [[], []];

    addEdge = function addEdge(v1, v2, oldEdgeIndex, which) {
      var eNew;
      eNew = filter.addEdgeLike(fold, oldEdgeIndex, v1, v2);
      return changedEdges[which].push(oldEdgeIndex, eNew);
    };

    i = involvingEdgesFrom != null ? involvingEdgesFrom : 0;

    while (i < fold.edges_vertices.length) {
      e = fold.edges_vertices[i];

      s = function () {
        var k, len, results;
        results = [];

        for (k = 0, len = e.length; k < len; k++) {
          u = e[k];
          results.push(fold.vertices_coords[u]);
        }

        return results;
      }();

      ref = fold.vertices_coords;

      for (v = k = 0, len = ref.length; k < len; v = ++k) {
        p = ref[v];

        if (indexOf.call(e, v) >= 0) {
          continue;
        }

        if (geom.pointStrictlyInSegment(p, s)) {
          addEdge(v, e[1], i, 0);
          e[1] = v;
        }
      }

      i++;
    }

    vertices = new RepeatedPointsDS(fold.vertices_coords, epsilon);
    i1 = involvingEdgesFrom != null ? involvingEdgesFrom : 0;

    while (i1 < fold.edges_vertices.length) {
      e1 = fold.edges_vertices[i1];

      s1 = function () {
        var l, len1, results;
        results = [];

        for (l = 0, len1 = e1.length; l < len1; l++) {
          v = e1[l];
          results.push(fold.vertices_coords[v]);
        }

        return results;
      }();

      ref1 = fold.edges_vertices.slice(0, i1);

      for (i2 = l = 0, len1 = ref1.length; l < len1; i2 = ++l) {
        e2 = ref1[i2];

        s2 = function () {
          var len2, m, results;
          results = [];

          for (m = 0, len2 = e2.length; m < len2; m++) {
            v = e2[m];
            results.push(fold.vertices_coords[v]);
          }

          return results;
        }();

        if (!filter.edges_verticesIncident(e1, e2) && geom.segmentsCross(s1, s2)) {
          cross = geom.lineIntersectLine(s1, s2);

          if (cross == null) {
            continue;
          }

          crossI = vertices.insert(cross);

          if (!(indexOf.call(e1, crossI) >= 0 && indexOf.call(e2, crossI) >= 0)) {
            if (indexOf.call(e1, crossI) < 0) {
              addEdge(crossI, e1[1], i1, 0);
              e1[1] = crossI;
              s1[1] = fold.vertices_coords[crossI];
            }

            if (indexOf.call(e2, crossI) < 0) {
              addEdge(crossI, e2[1], i2, 1);
              e2[1] = crossI;
            }
          }
        }
      }

      i1++;
    }

    old2new = filter.removeDuplicateEdges_vertices(fold);
    ref2 = [0, 1];

    for (m = 0, len2 = ref2.length; m < len2; m++) {
      i = ref2[m];

      changedEdges[i] = function () {
        var len3, n, ref3, results;
        ref3 = changedEdges[i];
        results = [];

        for (n = 0, len3 = ref3.length; n < len3; n++) {
          e = ref3[n];
          results.push(old2new[e]);
        }

        return results;
      }();
    }

    old2new = filter.removeLoopEdges(fold);
    ref3 = [0, 1];

    for (n = 0, len3 = ref3.length; n < len3; n++) {
      i = ref3[n];

      changedEdges[i] = function () {
        var len4, o, ref4, results;
        ref4 = changedEdges[i];
        results = [];

        for (o = 0, len4 = ref4.length; o < len4; o++) {
          e = ref4[o];
          results.push(old2new[e]);
        }

        return results;
      }();
    }

    if (involvingEdgesFrom != null) {
      return changedEdges;
    } else {
      return changedEdges[0].concat(changedEdges[1]);
    }
  };

  filter.addEdgeAndSubdivide = function (fold, v1, v2, epsilon) {
    var changedEdges, changedEdges1, changedEdges2, e, i, iNew, k, len, ref, ref1, ref2, ref3, ref4;

    if (v1.length != null) {
      ref = filter.addVertexAndSubdivide(fold, v1, epsilon), v1 = ref[0], changedEdges1 = ref[1];
    }

    if (v2.length != null) {
      ref1 = filter.addVertexAndSubdivide(fold, v2, epsilon), v2 = ref1[0], changedEdges2 = ref1[1];
    }

    if (v1 === v2) {
      return [[], []];
    }

    ref2 = fold.edges_vertices;

    for (i = k = 0, len = ref2.length; k < len; i = ++k) {
      e = ref2[i];

      if (e[0] === v1 && e[1] === v2 || e[0] === v2 && e[1] === v1) {
        return [[i], []];
      }
    }

    iNew = fold.edges_vertices.push([v1, v2]) - 1;

    if (iNew) {
      changedEdges = filter.subdivideCrossingEdges_vertices(fold, epsilon, iNew);

      if (indexOf.call(changedEdges[0], iNew) < 0) {
        changedEdges[0].push(iNew);
      }
    } else {
      changedEdges = [[iNew], []];
    }

    if (changedEdges1 != null) {
      (ref3 = changedEdges[1]).push.apply(ref3, changedEdges1);
    }

    if (changedEdges2 != null) {
      (ref4 = changedEdges[1]).push.apply(ref4, changedEdges2);
    }

    return changedEdges;
  };

  filter.cutEdges = function (fold, es) {
    var b1, b2, boundaries, e, e1, e2, ev, i, i1, i2, ie, ie1, ie2, k, l, len, len1, len2, len3, len4, len5, len6, len7, m, n, neighbor, neighbors, o, q, r, ref, ref1, ref10, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, t, u1, u2, v, v1, v2, ve, vertices_boundaries;
    vertices_boundaries = [];
    ref = filter.boundaryEdges(fold);

    for (k = 0, len = ref.length; k < len; k++) {
      e = ref[k];
      ref1 = fold.edges_vertices[e];

      for (l = 0, len1 = ref1.length; l < len1; l++) {
        v = ref1[l];
        (vertices_boundaries[v] != null ? vertices_boundaries[v] : vertices_boundaries[v] = []).push(e);
      }
    }

    for (m = 0, len2 = es.length; m < len2; m++) {
      e1 = es[m];
      e2 = filter.addEdgeLike(fold, e1);
      ref2 = fold.edges_vertices[e1];

      for (i = n = 0, len3 = ref2.length; n < len3; i = ++n) {
        v = ref2[i];
        ve = fold.vertices_edges[v];
        ve.splice(ve.indexOf(e1) + i, 0, e2);
      }

      ref3 = fold.edges_vertices[e1];

      for (i = o = 0, len4 = ref3.length; o < len4; i = ++o) {
        v1 = ref3[i];
        u1 = fold.edges_vertices[e1][1 - i];
        u2 = fold.edges_vertices[e2][1 - i];
        boundaries = (ref4 = vertices_boundaries[v1]) != null ? ref4.length : void 0;

        if (boundaries >= 2) {
          if (boundaries > 2) {
            throw new Error(vertices_boundaries[v1].length + " boundary edges at vertex " + v1);
          }

          ref5 = vertices_boundaries[v1], b1 = ref5[0], b2 = ref5[1];
          neighbors = fold.vertices_edges[v1];
          i1 = neighbors.indexOf(b1);
          i2 = neighbors.indexOf(b2);

          if (i2 === (i1 + 1) % neighbors.length) {
            if (i2 !== 0) {
              neighbors = neighbors.slice(i2).concat(neighbors.slice(0, +i1 + 1 || 9e9));
            }
          } else if (i1 === (i2 + 1) % neighbors.length) {
            if (i1 !== 0) {
              neighbors = neighbors.slice(i1).concat(neighbors.slice(0, +i2 + 1 || 9e9));
            }
          } else {
            throw new Error("Nonadjacent boundary edges at vertex " + v1);
          }

          ie1 = neighbors.indexOf(e1);
          ie2 = neighbors.indexOf(e2);
          ie = Math.min(ie1, ie2);
          fold.vertices_edges[v1] = neighbors.slice(0, +ie + 1 || 9e9);
          v2 = filter.addVertexLike(fold, v1);
          fold.vertices_edges[v2] = neighbors.slice(1 + ie);
          ref6 = fold.vertices_edges[v2];

          for (q = 0, len5 = ref6.length; q < len5; q++) {
            neighbor = ref6[q];
            ev = fold.edges_vertices[neighbor];
            ev[ev.indexOf(v1)] = v2;
          }
        }
      }

      if ((ref7 = fold.edges_assignment) != null) {
        ref7[e1] = 'B';
      }

      if ((ref8 = fold.edges_assignment) != null) {
        ref8[e2] = 'B';
      }

      ref9 = fold.edges_vertices[e1];

      for (i = r = 0, len6 = ref9.length; r < len6; i = ++r) {
        v = ref9[i];
        (vertices_boundaries[v] != null ? vertices_boundaries[v] : vertices_boundaries[v] = []).push(e1);
      }

      ref10 = fold.edges_vertices[e2];

      for (i = t = 0, len7 = ref10.length; t < len7; i = ++t) {
        v = ref10[i];
        (vertices_boundaries[v] != null ? vertices_boundaries[v] : vertices_boundaries[v] = []).push(e2);
      }
    }

    delete fold.vertices_vertices;
    return fold;
  };

  filter.edges_vertices_to_vertices_vertices = function (fold) {
    var edge, k, len, numVertices, ref, v, vertices_vertices, w;
    numVertices = filter.numVertices(fold);

    vertices_vertices = function () {
      var k, ref, results;
      results = [];

      for (v = k = 0, ref = numVertices; 0 <= ref ? k < ref : k > ref; v = 0 <= ref ? ++k : --k) {
        results.push([]);
      }

      return results;
    }();

    ref = fold.edges_vertices;

    for (k = 0, len = ref.length; k < len; k++) {
      edge = ref[k];
      v = edge[0], w = edge[1];

      while (v >= vertices_vertices.length) {
        vertices_vertices.push([]);
      }

      while (w >= vertices_vertices.length) {
        vertices_vertices.push([]);
      }

      vertices_vertices[v].push(w);
      vertices_vertices[w].push(v);
    }

    return vertices_vertices;
  };

  var convert = {},
      modulo$1 = function modulo(a, b) {
    return (+a % (b = +b) + b) % b;
  },
      hasProp = {}.hasOwnProperty;

  convert.edges_vertices_to_vertices_vertices_unsorted = function (fold) {
    fold.vertices_vertices = filter.edges_vertices_to_vertices_vertices(fold);
    return fold;
  };

  convert.edges_vertices_to_vertices_vertices_sorted = function (fold) {
    convert.edges_vertices_to_vertices_vertices_unsorted(fold);
    return convert.sort_vertices_vertices(fold);
  };

  convert.edges_vertices_to_vertices_edges_sorted = function (fold) {
    convert.edges_vertices_to_vertices_vertices_sorted(fold);
    return convert.vertices_vertices_to_vertices_edges(fold);
  };

  convert.sort_vertices_vertices = function (fold) {
    var neighbors, ref, ref1, ref2, v;

    if (((ref = fold.vertices_coords) != null ? (ref1 = ref[0]) != null ? ref1.length : void 0 : void 0) !== 2) {
      throw new Error("sort_vertices_vertices: Vertex coordinates missing or not two dimensional");
    }

    if (fold.vertices_vertices == null) {
      convert.edges_vertices_to_vertices_vertices(fold);
    }

    ref2 = fold.vertices_vertices;

    for (v in ref2) {
      neighbors = ref2[v];
      geom.sortByAngle(neighbors, v, function (x) {
        return fold.vertices_coords[x];
      });
    }

    return fold;
  };

  convert.vertices_vertices_to_faces_vertices = function (fold) {
    var face, i, j, k, key, l, len, len1, len2, neighbors, next, ref, ref1, ref2, ref3, u, uv, v, w, x;
    next = {};
    ref = fold.vertices_vertices;

    for (v = j = 0, len = ref.length; j < len; v = ++j) {
      neighbors = ref[v];

      for (i = k = 0, len1 = neighbors.length; k < len1; i = ++k) {
        u = neighbors[i];
        next[u + "," + v] = neighbors[modulo$1(i - 1, neighbors.length)];
      }
    }

    fold.faces_vertices = [];

    ref1 = function () {
      var results;
      results = [];

      for (key in next) {
        results.push(key);
      }

      return results;
    }();

    for (l = 0, len2 = ref1.length; l < len2; l++) {
      uv = ref1[l];
      w = next[uv];

      if (w == null) {
        continue;
      }

      next[uv] = null;
      ref2 = uv.split(','), u = ref2[0], v = ref2[1];
      u = parseInt(u);
      v = parseInt(v);
      face = [u, v];

      while (w !== face[0]) {
        if (w == null) {
          console.warn("Confusion with face " + face);
          break;
        }

        face.push(w);
        ref3 = [v, w], u = ref3[0], v = ref3[1];
        w = next[u + "," + v];
        next[u + "," + v] = null;
      }

      next[face[face.length - 1] + "," + face[0]] = null;

      if (w != null && geom.polygonOrientation(function () {
        var len3, m, results;
        results = [];

        for (m = 0, len3 = face.length; m < len3; m++) {
          x = face[m];
          results.push(fold.vertices_coords[x]);
        }

        return results;
      }()) > 0) {
        fold.faces_vertices.push(face);
      }
    }

    return fold;
  };

  convert.vertices_edges_to_faces_vertices_edges = function (fold) {
    var e, e1, e2, edges, i, j, k, l, len, len1, len2, len3, m, neighbors, next, nexts, ref, ref1, v, vertex, vertices, x;
    next = [];
    ref = fold.vertices_edges;

    for (v = j = 0, len = ref.length; j < len; v = ++j) {
      neighbors = ref[v];
      next[v] = {};

      for (i = k = 0, len1 = neighbors.length; k < len1; i = ++k) {
        e = neighbors[i];
        next[v][e] = neighbors[modulo$1(i - 1, neighbors.length)];
      }
    }

    fold.faces_vertices = [];
    fold.faces_edges = [];

    for (vertex = l = 0, len2 = next.length; l < len2; vertex = ++l) {
      nexts = next[vertex];

      for (e1 in nexts) {
        e2 = nexts[e1];

        if (e2 == null) {
          continue;
        }

        e1 = parseInt(e1);
        nexts[e1] = null;
        edges = [e1];
        vertices = [filter.edges_verticesIncident(fold.edges_vertices[e1], fold.edges_vertices[e2])];

        if (vertices[0] == null) {
          throw new Error("Confusion at edges " + e1 + " and " + e2);
        }

        while (e2 !== edges[0]) {
          if (e2 == null) {
            console.warn("Confusion with face containing edges " + edges);
            break;
          }

          edges.push(e2);
          ref1 = fold.edges_vertices[e2];

          for (m = 0, len3 = ref1.length; m < len3; m++) {
            v = ref1[m];

            if (v !== vertices[vertices.length - 1]) {
              vertices.push(v);
              break;
            }
          }

          e1 = e2;
          e2 = next[v][e1];
          next[v][e1] = null;
        }

        if (e2 != null && geom.polygonOrientation(function () {
          var len4, n, results;
          results = [];

          for (n = 0, len4 = vertices.length; n < len4; n++) {
            x = vertices[n];
            results.push(fold.vertices_coords[x]);
          }

          return results;
        }()) > 0) {
          fold.faces_vertices.push(vertices);
          fold.faces_edges.push(edges);
        }
      }
    }

    return fold;
  };

  convert.edges_vertices_to_faces_vertices = function (fold) {
    convert.edges_vertices_to_vertices_vertices_sorted(fold);
    return convert.vertices_vertices_to_faces_vertices(fold);
  };

  convert.edges_vertices_to_faces_vertices_edges = function (fold) {
    convert.edges_vertices_to_vertices_edges_sorted(fold);
    return convert.vertices_edges_to_faces_vertices_edges(fold);
  };

  convert.vertices_vertices_to_vertices_edges = function (fold) {
    var edge, edgeMap, i, j, len, ref, ref1, v1, v2, vertex, vertices;
    edgeMap = {};
    ref = fold.edges_vertices;

    for (edge = j = 0, len = ref.length; j < len; edge = ++j) {
      ref1 = ref[edge], v1 = ref1[0], v2 = ref1[1];
      edgeMap[v1 + "," + v2] = edge;
      edgeMap[v2 + "," + v1] = edge;
    }

    return fold.vertices_edges = function () {
      var k, len1, ref2, results;
      ref2 = fold.vertices_vertices;
      results = [];

      for (vertex = k = 0, len1 = ref2.length; k < len1; vertex = ++k) {
        vertices = ref2[vertex];
        results.push(function () {
          var l, ref3, results1;
          results1 = [];

          for (i = l = 0, ref3 = vertices.length; 0 <= ref3 ? l < ref3 : l > ref3; i = 0 <= ref3 ? ++l : --l) {
            results1.push(edgeMap[vertex + "," + vertices[i]]);
          }

          return results1;
        }());
      }

      return results;
    }();
  };

  convert.faces_vertices_to_faces_edges = function (fold) {
    var edge, edgeMap, face, i, j, len, ref, ref1, v1, v2, vertices;
    edgeMap = {};
    ref = fold.edges_vertices;

    for (edge = j = 0, len = ref.length; j < len; edge = ++j) {
      ref1 = ref[edge], v1 = ref1[0], v2 = ref1[1];
      edgeMap[v1 + "," + v2] = edge;
      edgeMap[v2 + "," + v1] = edge;
    }

    return fold.faces_edges = function () {
      var k, len1, ref2, results;
      ref2 = fold.faces_vertices;
      results = [];

      for (face = k = 0, len1 = ref2.length; k < len1; face = ++k) {
        vertices = ref2[face];
        results.push(function () {
          var l, ref3, results1;
          results1 = [];

          for (i = l = 0, ref3 = vertices.length; 0 <= ref3 ? l < ref3 : l > ref3; i = 0 <= ref3 ? ++l : --l) {
            results1.push(edgeMap[vertices[i] + "," + vertices[(i + 1) % vertices.length]]);
          }

          return results1;
        }());
      }

      return results;
    }();
  };

  convert.faces_vertices_to_edges = function (mesh) {
    var edge, edgeMap, face, i, key, ref, v1, v2, vertices;
    mesh.edges_vertices = [];
    mesh.edges_faces = [];
    mesh.faces_edges = [];
    mesh.edges_assignment = [];
    edgeMap = {};
    ref = mesh.faces_vertices;

    for (face in ref) {
      vertices = ref[face];
      face = parseInt(face);
      mesh.faces_edges.push(function () {
        var j, len, results;
        results = [];

        for (i = j = 0, len = vertices.length; j < len; i = ++j) {
          v1 = vertices[i];
          v1 = parseInt(v1);
          v2 = vertices[(i + 1) % vertices.length];

          if (v1 <= v2) {
            key = v1 + "," + v2;
          } else {
            key = v2 + "," + v1;
          }

          if (key in edgeMap) {
            edge = edgeMap[key];
          } else {
            edge = edgeMap[key] = mesh.edges_vertices.length;

            if (v1 <= v2) {
              mesh.edges_vertices.push([v1, v2]);
            } else {
              mesh.edges_vertices.push([v2, v1]);
            }

            mesh.edges_faces.push([null, null]);
            mesh.edges_assignment.push('B');
          }

          if (v1 <= v2) {
            mesh.edges_faces[edge][0] = face;
          } else {
            mesh.edges_faces[edge][1] = face;
          }

          results.push(edge);
        }

        return results;
      }());
    }

    return mesh;
  };

  convert.deepCopy = function (fold) {
    var copy, item, j, key, len, ref, results, value;

    if ((ref = _typeof(fold)) === 'number' || ref === 'string' || ref === 'boolean') {
      return fold;
    } else if (Array.isArray(fold)) {
      results = [];

      for (j = 0, len = fold.length; j < len; j++) {
        item = fold[j];
        results.push(convert.deepCopy(item));
      }

      return results;
    } else {
      copy = {};

      for (key in fold) {
        if (!hasProp.call(fold, key)) continue;
        value = fold[key];
        copy[key] = convert.deepCopy(value);
      }

      return copy;
    }
  };

  convert.toJSON = function (fold) {
    var key, obj, value;
    return "{\n" + function () {
      var results;
      results = [];
      var keys = Object.keys(fold);

      for (var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
        key = keys[keyIndex];
        value = fold[key];
        results.push("  " + JSON.stringify(key) + ": " + (Array.isArray(value) ? "[\n" + function () {
          var j, len, results1;
          results1 = [];

          for (j = 0, len = value.length; j < len; j++) {
            obj = value[j];
            results1.push("    " + JSON.stringify(obj));
          }

          return results1;
        }().join(',\n') + "\n  ]" : JSON.stringify(value)));
      }

      return results;
    }().join(',\n') + "\n}\n";
  };

  convert.extensions = {};
  convert.converters = {};

  convert.getConverter = function (fromExt, toExt) {
    if (fromExt === toExt) {
      return function (x) {
        return x;
      };
    } else {
      return convert.converters["" + fromExt + toExt];
    }
  };

  convert.setConverter = function (fromExt, toExt, converter) {
    convert.extensions[fromExt] = true;
    convert.extensions[toExt] = true;
    return convert.converters["" + fromExt + toExt] = converter;
  };

  convert.convertFromTo = function (data, fromExt, toExt) {
    var converter;

    if (fromExt[0] !== '.') {
      fromExt = "." + fromExt;
    }

    if (toExt[0] !== '.') {
      toExt = "." + toExt;
    }

    converter = convert.getConverter(fromExt, toExt);

    if (converter == null) {
      if (fromExt === toExt) {
        return data;
      }

      throw new Error("No converter from " + fromExt + " to " + toExt);
    }

    return converter(data);
  };

  convert.convertFrom = function (data, fromExt) {
    return convert.convertFromTo(data, fromExt, '.fold');
  };

  convert.convertTo = function (data, toExt) {
    return convert.convertFromTo(data, '.fold', toExt);
  };

  var assignment_foldAngle = {
    V: 180,
    v: 180,
    M: -180,
    m: -180
  };

  var assignment_to_foldAngle = function assignment_to_foldAngle(assignment) {
    return assignment_foldAngle[assignment] || 0;
  };

  var emptyFOLD = function emptyFOLD() {
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
      faces_edges: []
    };
  };

  var svg_to_fold = function svg_to_fold(svg, options) {
    var pre_frag = emptyFOLD();
    var v0 = pre_frag.vertices_coords.length;
    var segments = Segmentize(svg);
    pre_frag.vertices_coords = segments.map(function (s) {
      return [[s[0], s[1]], [s[2], s[3]]];
    }).reduce(function (a, b) {
      return a.concat(b);
    }, pre_frag.vertices_coords);
    pre_frag.edges_vertices = segments.map(function (_, i) {
      return [v0 + i * 2, v0 + i * 2 + 1];
    });
    pre_frag.edges_assignment = segments.map(function (a) {
      return a[4];
    }).map(function (attrs) {
      return attrs != null ? color_to_assignment(attrs.stroke) : "U";
    });
    var graph = fragment(pre_frag, options.epsilon);
    convert.edges_vertices_to_vertices_vertices_sorted(graph);
    convert.vertices_vertices_to_faces_vertices(graph);
    convert.faces_vertices_to_faces_edges(graph);
    graph.edges_foldAngle = graph.edges_assignment.map(function (a) {
      return assignment_to_foldAngle(a);
    });
    return graph;
  };

  var SVGtoFOLD = function SVGtoFOLD(input) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (typeof input === "string") {
      var svg = new win.DOMParser().parseFromString(input, "text/xml").documentElement;
      return svg_to_fold(svg, options);
    }

    return svg_to_fold(input, options);
  };

  SVGtoFOLD.core = {
    segmentize: function segmentize() {},
    fragment: fragment
  };

  return SVGtoFOLD;

})));
