/* (c) Robby Kraft, MIT License */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.foldify = factory());
}(this, (function () { 'use strict';

  const isBrowser = typeof window !== "undefined"
    && typeof window.document !== "undefined";
  const isNode = typeof process !== "undefined"
    && process.versions != null
    && process.versions.node != null;
  const isWebWorker = typeof self === "object"
    && self.constructor
    && self.constructor.name === "DedicatedWorkerGlobalScope";

  const htmlString = "<!DOCTYPE html><title>a</title>";
  const win = {};
  if (isNode) {
    const { DOMParser, XMLSerializer } = require("xmldom");
    win.DOMParser = DOMParser;
    win.XMLSerializer = XMLSerializer;
    win.document = new DOMParser().parseFromString(htmlString, "text/html");
  } else if (isBrowser) {
    win.DOMParser = window.DOMParser;
    win.XMLSerializer = window.XMLSerializer;
    win.document = window.document;
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
  function parse (path) {
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
  function Bezier (ax, ay, bx, by, cx, cy, dx, dy) {
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
  function Arc (x0, y0, rx, ry, xAxisRotate, LargeArcFlag, SweepFlag, x, y) {
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
  function LinearPosition (x0, x1, y0, y1) {
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
  function PathProperties (svgString) {
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
  function vkXML (text, step) {
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
    var _require = require("xmldom"),
        DOMParser = _require.DOMParser,
        XMLSerializer = _require.XMLSerializer;
    win$1.DOMParser = DOMParser;
    win$1.XMLSerializer = XMLSerializer;
    win$1.document = new DOMParser().parseFromString(htmlString$1, "text/html");
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
        return [].concat(_toConsumableArray(unit), [attribute_list(e)]);
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

  const css_color_names = Object.keys(css_colors);
  const hexToComponents = function (h) {
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 255;
    if (h.length === 4) {
      r = `0x${h[1]}${h[1]}`;
      g = `0x${h[2]}${h[2]}`;
      b = `0x${h[3]}${h[3]}`;
    } else if (h.length === 7) {
      r = `0x${h[1]}${h[2]}`;
      g = `0x${h[3]}${h[4]}`;
      b = `0x${h[5]}${h[6]}`;
    } else if (h.length === 5) {
      r = `0x${h[1]}${h[1]}`;
      g = `0x${h[2]}${h[2]}`;
      b = `0x${h[3]}${h[3]}`;
      a = `0x${h[4]}${h[4]}`;
    } else if (h.length === 9) {
      r = `0x${h[1]}${h[2]}`;
      g = `0x${h[3]}${h[4]}`;
      b = `0x${h[5]}${h[6]}`;
      a = `0x${h[7]}${h[8]}`;
    }
    return [+(r / 255), +(g / 255), +(b / 255), +(a / 255)];
  };
  const color_to_assignment = function (string) {
    let c = [0, 0, 0, 1];
    if (string[0] === "#") {
      c = hexToComponents(string);
    } else if (css_color_names.indexOf(string) !== -1) {
      c = hexToComponents(css_colors[string]);
    }
    const ep = 0.05;
    if (c[0] < ep && c[1] < ep && c[2] < ep) { return "F"; }
    if (c[0] > c[1] && (c[0] - c[2]) > ep) { return "V"; }
    if (c[2] > c[1] && (c[2] - c[0]) > ep) { return "M"; }
    return "F";
  };

  var magnitude = function magnitude(v) {
    var sum = v.map(function (component) {
      return component * component;
    }).reduce(function (prev, curr) {
      return prev + curr;
    }, 0);
    return Math.sqrt(sum);
  };
  var normalize = function normalize(v) {
    var m = magnitude(v);
    return v.map(function (c) {
      return c / m;
    });
  };
  var dot = function dot(a, b) {
    return a.map(function (_, i) {
      return a[i] * b[i];
    }).reduce(function (prev, curr) {
      return prev + curr;
    }, 0);
  };
  var average = function average() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var dimension = args.length > 0 ? args[0].length : 0;
    var sum = Array(dimension).fill(0);
    args.forEach(function (vec) {
      return sum.forEach(function (_, i) {
        sum[i] += vec[i] || 0;
      });
    });
    return sum.map(function (n) {
      return n / args.length;
    });
  };
  var cross2 = function cross2(a, b) {
    return [a[0] * b[1], a[1] * b[0]];
  };
  var cross3 = function cross3(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[0] * b[2] - a[2] * b[0], a[0] * b[1] - a[1] * b[0]];
  };
  var distance2 = function distance2(a, b) {
    var p = a[0] - b[0];
    var q = a[1] - b[1];
    return Math.sqrt(p * p + q * q);
  };
  var distance3 = function distance3(a, b) {
    var c = a[0] - b[0];
    var d = a[1] - b[1];
    var e = a[2] - b[2];
    return Math.sqrt(c * c + d * d + e * e);
  };
  var distance$1 = function distance(a, b) {
    var dimension = a.length;
    var sum = 0;
    for (var i = 0; i < dimension; i += 1) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  };
  var midpoint2 = function midpoint2(a, b) {
    return a.map(function (_, i) {
      return (a[i] + b[i]) / 2;
    });
  };
  var algebra = Object.freeze({
    magnitude: magnitude,
    normalize: normalize,
    dot: dot,
    average: average,
    cross2: cross2,
    cross3: cross3,
    distance2: distance2,
    distance3: distance3,
    distance: distance$1,
    midpoint2: midpoint2
  });
  var multiply_vector2_matrix2 = function multiply_vector2_matrix2(vector, matrix) {
    return [vector[0] * matrix[0] + vector[1] * matrix[2] + matrix[4], vector[0] * matrix[1] + vector[1] * matrix[3] + matrix[5]];
  };
  var multiply_line_matrix2$1 = function multiply_line_matrix2(point, vector, matrix) {
    var new_point = multiply_vector2_matrix2(point, matrix);
    var vec_point = vector.map(function (_, i) {
      return vector[i] + point[i];
    });
    var new_vector = multiply_vector2_matrix2(vec_point, matrix).map(function (vec, i) {
      return vec - new_point[i];
    });
    return [new_point, new_vector];
  };
  var multiply_matrices2$1 = function multiply_matrices2(m1, m2) {
    var a = m1[0] * m2[0] + m1[2] * m2[1];
    var c = m1[0] * m2[2] + m1[2] * m2[3];
    var tx = m1[0] * m2[4] + m1[2] * m2[5] + m1[4];
    var b = m1[1] * m2[0] + m1[3] * m2[1];
    var d = m1[1] * m2[2] + m1[3] * m2[3];
    var ty = m1[1] * m2[4] + m1[3] * m2[5] + m1[5];
    return [a, b, c, d, tx, ty];
  };
  var make_matrix2_translation = function make_matrix2_translation(x, y) {
    return [1, 0, 0, 1, x, y];
  };
  var make_matrix2_scale = function make_matrix2_scale(ratio) {
    var origin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0];
    var tx = ratio * -origin[0] + origin[0];
    var ty = ratio * -origin[1] + origin[1];
    return [ratio, 0, 0, ratio, tx, ty];
  };
  var make_matrix2_rotation = function make_matrix2_rotation(angle) {
    var origin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0];
    var a = Math.cos(angle);
    var b = Math.sin(angle);
    var c = -b;
    var d = a;
    var tx = origin[0];
    var ty = origin[1];
    return [a, b, c, d, tx, ty];
  };
  var make_matrix2_reflection = function make_matrix2_reflection(vector, origin) {
    var origin_x = origin && origin[0] ? origin[0] : 0;
    var origin_y = origin && origin[1] ? origin[1] : 0;
    var angle = Math.atan2(vector[1], vector[0]);
    var cosAngle = Math.cos(angle);
    var sinAngle = Math.sin(angle);
    var cos_Angle = Math.cos(-angle);
    var sin_Angle = Math.sin(-angle);
    var a = cosAngle * cos_Angle + sinAngle * sin_Angle;
    var b = cosAngle * -sin_Angle + sinAngle * cos_Angle;
    var c = sinAngle * cos_Angle + -cosAngle * sin_Angle;
    var d = sinAngle * -sin_Angle + -cosAngle * cos_Angle;
    var tx = origin_x + a * -origin_x + -origin_y * c;
    var ty = origin_y + b * -origin_x + -origin_y * d;
    return [a, b, c, d, tx, ty];
  };
  var make_matrix2_inverse = function make_matrix2_inverse(m) {
    var det = m[0] * m[3] - m[1] * m[2];
    if (!det || isNaN(det) || !isFinite(m[4]) || !isFinite(m[5])) {
      return undefined;
    }
    return [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det, (m[2] * m[5] - m[3] * m[4]) / det, (m[1] * m[4] - m[0] * m[5]) / det];
  };
  var matrix = Object.freeze({
    multiply_vector2_matrix2: multiply_vector2_matrix2,
    multiply_line_matrix2: multiply_line_matrix2$1,
    multiply_matrices2: multiply_matrices2$1,
    make_matrix2_translation: make_matrix2_translation,
    make_matrix2_scale: make_matrix2_scale,
    make_matrix2_rotation: make_matrix2_rotation,
    make_matrix2_reflection: make_matrix2_reflection,
    make_matrix2_inverse: make_matrix2_inverse
  });
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
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }
  function _toConsumableArray$1(arr) {
    return _arrayWithoutHoles$1(arr) || _iterableToArray$1(arr) || _nonIterableSpread$1();
  }
  function _arrayWithoutHoles$1(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
      return arr2;
    }
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _iterableToArray$1(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }
  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  function _nonIterableSpread$1() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }
  var clean_number = function clean_number(num) {
    var places = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 15;
    return parseFloat(num.toFixed(places));
  };
  var is_number = function is_number(n) {
    return n != null && !isNaN(n);
  };
  var is_vector = function is_vector(a) {
    return a != null && a[0] != null && !isNaN(a[0]);
  };
  var is_iterable = function is_iterable(obj) {
    return obj != null && typeof obj[Symbol.iterator] === "function";
  };
  var flatten_input = function flatten_input() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    switch (args.length) {
      case undefined:
      case 0:
        return args;
      case 1:
        return is_iterable(args[0]) ? flatten_input.apply(void 0, _toConsumableArray$1(args[0])) : [args[0]];
      default:
        return Array.from(args).map(function (a) {
          return is_iterable(a) ? _toConsumableArray$1(flatten_input(a)) : a;
        }).reduce(function (a, b) {
          return a.concat(b);
        }, []);
    }
  };
  var semi_flatten_input = function semi_flatten_input() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    var list = args;
    while (list.length === 1 && list[0].length) {
      var _list = list;
      var _list2 = _slicedToArray(_list, 1);
      list = _list2[0];
    }
    return list;
  };
  var get_vector = function get_vector() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }
    var list = flatten_input(args).filter(function (a) {
      return a !== undefined;
    });
    if (list.length === 0) {
      return undefined;
    }
    if (!isNaN(list[0].x)) {
      list = ["x", "y", "z"].map(function (c) {
        return list[0][c];
      }).filter(function (a) {
        return a !== undefined;
      });
    }
    return list.filter(function (n) {
      return typeof n === "number";
    });
  };
  var get_vector_of_vectors = function get_vector_of_vectors() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }
    return semi_flatten_input(args).map(function (el) {
      return get_vector(el);
    });
  };
  var identity = [1, 0, 0, 1, 0, 0];
  var get_matrix2 = function get_matrix2() {
    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }
    var m = get_vector(args);
    if (m.length === 6) {
      return m;
    }
    if (m.length > 6) {
      return [m[0], m[1], m[3], m[4], m[5], m[6]];
    }
    if (m.length < 6) {
      return identity.map(function (n, i) {
        return m[i] || n;
      });
    }
    return undefined;
  };
  function get_edge() {
    for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      args[_key6] = arguments[_key6];
    }
    return get_vector_of_vectors(args);
  }
  function get_line() {
    var params = Array.from(arguments);
    var numbers = params.filter(function (param) {
      return !isNaN(param);
    });
    var arrays = params.filter(function (param) {
      return param.constructor === Array;
    });
    if (params.length == 0) {
      return {
        vector: [],
        point: []
      };
    }
    if (!isNaN(params[0]) && numbers.length >= 4) {
      return {
        point: [params[0], params[1]],
        vector: [params[2], params[3]]
      };
    }
    if (arrays.length > 0) {
      if (arrays.length === 1) {
        return get_line.apply(void 0, _toConsumableArray$1(arrays[0]));
      }
      if (arrays.length === 2) {
        return {
          point: [arrays[0][0], arrays[0][1]],
          vector: [arrays[1][0], arrays[1][1]]
        };
      }
      if (arrays.length === 4) {
        return {
          point: [arrays[0], arrays[1]],
          vector: [arrays[2], arrays[3]]
        };
      }
    }
    if (params[0].constructor === Object) {
      var vector = [],
          point = [];
      if (params[0].vector != null) {
        vector = get_vector(params[0].vector);
      } else if (params[0].direction != null) {
        vector = get_vector(params[0].direction);
      }
      if (params[0].point != null) {
        point = get_vector(params[0].point);
      } else if (params[0].origin != null) {
        point = get_vector(params[0].origin);
      }
      return {
        point: point,
        vector: vector
      };
    }
    return {
      point: [],
      vector: []
    };
  }
  function get_ray() {
    return get_line.apply(void 0, arguments);
  }
  function get_two_vec2() {
    for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
      args[_key7] = arguments[_key7];
    }
    if (args.length === 0) {
      return undefined;
    }
    if (args.length === 1 && args[0] !== undefined) {
      return get_two_vec2.apply(void 0, _toConsumableArray$1(args[0]));
    }
    var params = Array.from(args);
    var numbers = params.filter(function (param) {
      return !isNaN(param);
    });
    var arrays = params.filter(function (o) {
      return _typeof(o) === "object";
    }).filter(function (param) {
      return param.constructor === Array;
    });
    if (numbers.length >= 4) {
      return [[numbers[0], numbers[1]], [numbers[2], numbers[3]]];
    }
    if (arrays.length >= 2 && !isNaN(arrays[0][0])) {
      return arrays;
    }
    if (arrays.length === 1 && !isNaN(arrays[0][0][0])) {
      return arrays[0];
    }
    return undefined;
  }
  function get_array_of_vec() {
    for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
      args[_key8] = arguments[_key8];
    }
    if (args.length === 0) {
      return undefined;
    }
    if (args.length === 1 && args[0] !== undefined) {
      return get_array_of_vec.apply(void 0, _toConsumableArray$1(args[0]));
    }
    return Array.from(args);
  }
  function get_array_of_vec2() {
    var params = Array.from(arguments);
    var arrays = params.filter(function (param) {
      return param.constructor === Array;
    });
    if (arrays.length >= 2 && !isNaN(arrays[0][0])) {
      return arrays;
    }
    if (arrays.length === 1 && arrays[0].length >= 1) {
      return arrays[0];
    }
    return params;
  }
  var EPSILON = 1e-6;
  var array_similarity_test = function array_similarity_test(list, compFunc) {
    return Array.from(Array(list.length - 1)).map(function (_, i) {
      return compFunc(list[0], list[i + 1]);
    }).reduce(function (a, b) {
      return a && b;
    }, true);
  };
  var equivalent_numbers = function equivalent_numbers() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (args.length === 0) {
      return false;
    }
    if (args.length === 1 && args[0] !== undefined) {
      return equivalent_numbers.apply(void 0, _toConsumableArray$1(args[0]));
    }
    return array_similarity_test(args, function (a, b) {
      return Math.abs(a - b) < EPSILON;
    });
  };
  var equivalent_vectors = function equivalent_vectors() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    var list = get_vector_of_vectors(args);
    if (list.length === 0) {
      return false;
    }
    if (list.length === 1 && list[0] !== undefined) {
      return equivalent_vectors.apply(void 0, _toConsumableArray$1(list[0]));
    }
    var dimension = list[0].length;
    var dim_array = Array.from(Array(dimension));
    return Array.from(Array(list.length - 1)).map(function (element, i) {
      return dim_array.map(function (_, di) {
        return Math.abs(list[i][di] - list[i + 1][di]) < EPSILON;
      }).reduce(function (prev, curr) {
        return prev && curr;
      }, true);
    }).reduce(function (prev, curr) {
      return prev && curr;
    }, true) && Array.from(Array(list.length - 1)).map(function (_, i) {
      return list[0].length === list[i + 1].length;
    }).reduce(function (a, b) {
      return a && b;
    }, true);
  };
  var equivalent = function equivalent() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }
    var list = semi_flatten_input(args);
    if (list.length < 1) {
      return false;
    }
    var typeofList = _typeof(list[0]);
    if (typeofList === "undefined") {
      return false;
    }
    if (list[0].constructor === Array) {
      list = list.map(function (el) {
        return semi_flatten_input(el);
      });
    }
    switch (typeofList) {
      case "number":
        return array_similarity_test(list, function (a, b) {
          return Math.abs(a - b) < EPSILON;
        });
      case "boolean":
        return array_similarity_test(list, function (a, b) {
          return a === b;
        });
      case "object":
        if (list[0].constructor === Array) {
          return equivalent_vectors(list);
        }
        console.warn("comparing array of objects for equivalency by slow stringify and no-epsilon");
        return array_similarity_test(list, function (a, b) {
          return JSON.stringify(a) === JSON.stringify(b);
        });
      default:
        console.warn("incapable of determining comparison method");
        break;
    }
    return false;
  };
  var equal = Object.freeze({
    EPSILON: EPSILON,
    equivalent_numbers: equivalent_numbers,
    equivalent_vectors: equivalent_vectors,
    equivalent: equivalent
  });
  var overlap_function = function overlap_function(aPt, aVec, bPt, bVec, compFunc) {
    var det = function det(a, b) {
      return a[0] * b[1] - b[0] * a[1];
    };
    var denominator0 = det(aVec, bVec);
    var denominator1 = -denominator0;
    var numerator0 = det([bPt[0] - aPt[0], bPt[1] - aPt[1]], bVec);
    var numerator1 = det([aPt[0] - bPt[0], aPt[1] - bPt[1]], aVec);
    if (Math.abs(denominator0) < EPSILON) {
      return false;
    }
    var t0 = numerator0 / denominator0;
    var t1 = numerator1 / denominator1;
    return compFunc(t0, t1);
  };
  var edge_edge_comp = function edge_edge_comp(t0, t1) {
    return t0 >= -EPSILON && t0 <= 1 + EPSILON && t1 >= -EPSILON && t1 <= 1 + EPSILON;
  };
  var edge_edge_overlap = function edge_edge_overlap(a0, a1, b0, b1) {
    var aVec = [a1[0] - a0[0], a1[1] - a0[1]];
    var bVec = [b1[0] - b0[0], b1[1] - b0[1]];
    return overlap_function(a0, aVec, b0, bVec, edge_edge_comp);
  };
  var degenerate = function degenerate(v) {
    return Math.abs(v.reduce(function (a, b) {
      return a + b;
    }, 0)) < EPSILON;
  };
  var parallel = function parallel(a, b) {
    return 1 - Math.abs(dot(normalize(a), normalize(b))) < EPSILON;
  };
  var point_on_line = function point_on_line(linePoint, lineVector, point) {
    var epsilon = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : EPSILON;
    var pointPoint = [point[0] - linePoint[0], point[1] - linePoint[1]];
    var cross = pointPoint[0] * lineVector[1] - pointPoint[1] * lineVector[0];
    return Math.abs(cross) < epsilon;
  };
  var point_on_edge = function point_on_edge(edge0, edge1, point) {
    var epsilon = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : EPSILON;
    var edge0_1 = [edge0[0] - edge1[0], edge0[1] - edge1[1]];
    var edge0_p = [edge0[0] - point[0], edge0[1] - point[1]];
    var edge1_p = [edge1[0] - point[0], edge1[1] - point[1]];
    var dEdge = Math.sqrt(edge0_1[0] * edge0_1[0] + edge0_1[1] * edge0_1[1]);
    var dP0 = Math.sqrt(edge0_p[0] * edge0_p[0] + edge0_p[1] * edge0_p[1]);
    var dP1 = Math.sqrt(edge1_p[0] * edge1_p[0] + edge1_p[1] * edge1_p[1]);
    return Math.abs(dEdge - dP0 - dP1) < epsilon;
  };
  var point_in_poly = function point_in_poly(point, poly) {
    var isInside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      if (poly[i][1] > point[1] != poly[j][1] > point[1] && point[0] < (poly[j][0] - poly[i][0]) * (point[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0]) {
        isInside = !isInside;
      }
    }
    return isInside;
  };
  var point_in_convex_poly = function point_in_convex_poly(point, poly) {
    var epsilon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EPSILON;
    if (poly == null || !(poly.length > 0)) {
      return false;
    }
    return poly.map(function (p, i, arr) {
      var nextP = arr[(i + 1) % arr.length];
      var a = [nextP[0] - p[0], nextP[1] - p[1]];
      var b = [point[0] - p[0], point[1] - p[1]];
      return a[0] * b[1] - a[1] * b[0] > -epsilon;
    }).map(function (s, i, arr) {
      return s === arr[0];
    }).reduce(function (prev, curr) {
      return prev && curr;
    }, true);
  };
  var point_in_convex_poly_exclusive = function point_in_convex_poly_exclusive(point, poly) {
    var epsilon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EPSILON;
    if (poly == null || !(poly.length > 0)) {
      return false;
    }
    return poly.map(function (p, i, arr) {
      var nextP = arr[(i + 1) % arr.length];
      var a = [nextP[0] - p[0], nextP[1] - p[1]];
      var b = [point[0] - p[0], point[1] - p[1]];
      return a[0] * b[1] - a[1] * b[0] > epsilon;
    }).map(function (s, i, arr) {
      return s === arr[0];
    }).reduce(function (prev, curr) {
      return prev && curr;
    }, true);
  };
  var convex_polygons_overlap = function convex_polygons_overlap(ps1, ps2) {
    var e1 = ps1.map(function (p, i, arr) {
      return [p, arr[(i + 1) % arr.length]];
    });
    var e2 = ps2.map(function (p, i, arr) {
      return [p, arr[(i + 1) % arr.length]];
    });
    for (var i = 0; i < e1.length; i += 1) {
      for (var j = 0; j < e2.length; j += 1) {
        if (edge_edge_overlap(e1[i][0], e1[i][1], e2[j][0], e2[j][1])) {
          return true;
        }
      }
    }
    if (point_in_poly(ps2[0], ps1)) {
      return true;
    }
    if (point_in_poly(ps1[0], ps2)) {
      return true;
    }
    return false;
  };
  var convex_polygon_is_enclosed = function convex_polygon_is_enclosed(inner, outer) {
    var goesInside = outer.map(function (p) {
      return point_in_convex_poly(p, inner);
    }).reduce(function (a, b) {
      return a || b;
    }, false);
    if (goesInside) {
      return false;
    }
    return undefined;
  };
  var convex_polygons_enclose = function convex_polygons_enclose(inner, outer) {
    var outerGoesInside = outer.map(function (p) {
      return point_in_convex_poly(p, inner);
    }).reduce(function (a, b) {
      return a || b;
    }, false);
    var innerGoesOutside = inner.map(function (p) {
      return point_in_convex_poly(p, inner);
    }).reduce(function (a, b) {
      return a && b;
    }, true);
    return !outerGoesInside && innerGoesOutside;
  };
  var is_counter_clockwise_between = function is_counter_clockwise_between(angle, angleA, angleB) {
    while (angleB < angleA) {
      angleB += Math.PI * 2;
    }
    while (angle < angleA) {
      angle += Math.PI * 2;
    }
    return angle < angleB;
  };
  var query = Object.freeze({
    overlap_function: overlap_function,
    edge_edge_overlap: edge_edge_overlap,
    degenerate: degenerate,
    parallel: parallel,
    point_on_line: point_on_line,
    point_on_edge: point_on_edge,
    point_in_poly: point_in_poly,
    point_in_convex_poly: point_in_convex_poly,
    point_in_convex_poly_exclusive: point_in_convex_poly_exclusive,
    convex_polygons_overlap: convex_polygons_overlap,
    convex_polygon_is_enclosed: convex_polygon_is_enclosed,
    convex_polygons_enclose: convex_polygons_enclose,
    is_counter_clockwise_between: is_counter_clockwise_between
  });
  var line_line_comp = function line_line_comp() {
    return true;
  };
  var line_ray_comp = function line_ray_comp(t0, t1) {
    return t1 >= -EPSILON;
  };
  var line_edge_comp = function line_edge_comp(t0, t1) {
    return t1 >= -EPSILON && t1 <= 1 + EPSILON;
  };
  var ray_ray_comp = function ray_ray_comp(t0, t1) {
    return t0 >= -EPSILON && t1 >= -EPSILON;
  };
  var ray_edge_comp = function ray_edge_comp(t0, t1) {
    return t0 >= -EPSILON && t1 >= -EPSILON && t1 <= 1 + EPSILON;
  };
  var edge_edge_comp$1 = function edge_edge_comp(t0, t1) {
    return t0 >= -EPSILON && t0 <= 1 + EPSILON && t1 >= -EPSILON && t1 <= 1 + EPSILON;
  };
  var line_ray_comp_exclusive = function line_ray_comp_exclusive(t0, t1) {
    return t1 > EPSILON;
  };
  var line_edge_comp_exclusive = function line_edge_comp_exclusive(t0, t1) {
    return t1 > EPSILON && t1 < 1 - EPSILON;
  };
  var ray_ray_comp_exclusive = function ray_ray_comp_exclusive(t0, t1) {
    return t0 > EPSILON && t1 > EPSILON;
  };
  var ray_edge_comp_exclusive = function ray_edge_comp_exclusive(t0, t1) {
    return t0 > EPSILON && t1 > EPSILON && t1 < 1 - EPSILON;
  };
  var edge_edge_comp_exclusive = function edge_edge_comp_exclusive(t0, t1) {
    return t0 > EPSILON && t0 < 1 - EPSILON && t1 > EPSILON && t1 < 1 - EPSILON;
  };
  var limit_line = function limit_line(dist) {
    return dist;
  };
  var limit_ray = function limit_ray(dist) {
    return dist < -EPSILON ? 0 : dist;
  };
  var limit_edge = function limit_edge(dist) {
    if (dist < -EPSILON) {
      return 0;
    }
    if (dist > 1 + EPSILON) {
      return 1;
    }
    return dist;
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
  var line_line = function line_line(aPt, aVec, bPt, bVec, epsilon) {
    return intersection_function(aPt, aVec, bPt, bVec, line_line_comp, epsilon);
  };
  var line_ray = function line_ray(linePt, lineVec, rayPt, rayVec, epsilon) {
    return intersection_function(linePt, lineVec, rayPt, rayVec, line_ray_comp, epsilon);
  };
  var line_edge = function line_edge(point, vec, edge0, edge1, epsilon) {
    var edgeVec = [edge1[0] - edge0[0], edge1[1] - edge0[1]];
    return intersection_function(point, vec, edge0, edgeVec, line_edge_comp, epsilon);
  };
  var ray_ray = function ray_ray(aPt, aVec, bPt, bVec, epsilon) {
    return intersection_function(aPt, aVec, bPt, bVec, ray_ray_comp, epsilon);
  };
  var ray_edge = function ray_edge(rayPt, rayVec, edge0, edge1, epsilon) {
    var edgeVec = [edge1[0] - edge0[0], edge1[1] - edge0[1]];
    return intersection_function(rayPt, rayVec, edge0, edgeVec, ray_edge_comp, epsilon);
  };
  var edge_edge = function edge_edge(a0, a1, b0, b1, epsilon) {
    var aVec = [a1[0] - a0[0], a1[1] - a0[1]];
    var bVec = [b1[0] - b0[0], b1[1] - b0[1]];
    return intersection_function(a0, aVec, b0, bVec, edge_edge_comp$1, epsilon);
  };
  var line_ray_exclusive = function line_ray_exclusive(linePt, lineVec, rayPt, rayVec, epsilon) {
    return intersection_function(linePt, lineVec, rayPt, rayVec, line_ray_comp_exclusive, epsilon);
  };
  var line_edge_exclusive = function line_edge_exclusive(point, vec, edge0, edge1, epsilon) {
    var edgeVec = [edge1[0] - edge0[0], edge1[1] - edge0[1]];
    return intersection_function(point, vec, edge0, edgeVec, line_edge_comp_exclusive, epsilon);
  };
  var ray_ray_exclusive = function ray_ray_exclusive(aPt, aVec, bPt, bVec, epsilon) {
    return intersection_function(aPt, aVec, bPt, bVec, ray_ray_comp_exclusive, epsilon);
  };
  var ray_edge_exclusive = function ray_edge_exclusive(rayPt, rayVec, edge0, edge1, epsilon) {
    var edgeVec = [edge1[0] - edge0[0], edge1[1] - edge0[1]];
    return intersection_function(rayPt, rayVec, edge0, edgeVec, ray_edge_comp_exclusive, epsilon);
  };
  var edge_edge_exclusive = function edge_edge_exclusive(a0, a1, b0, b1, epsilon) {
    var aVec = [a1[0] - a0[0], a1[1] - a0[1]];
    var bVec = [b1[0] - b0[0], b1[1] - b0[1]];
    return intersection_function(a0, aVec, b0, bVec, edge_edge_comp_exclusive, epsilon);
  };
  var circle_line = function circle_line(center, radius, p0, p1) {
    var epsilon = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : EPSILON;
    var x1 = p0[0] - center[0];
    var y1 = p0[1] - center[1];
    var x2 = p1[0] - center[0];
    var y2 = p1[1] - center[1];
    var dx = x2 - x1;
    var dy = y2 - y1;
    var det = x1 * y2 - x2 * y1;
    var det_sq = det * det;
    var r_sq = radius * radius;
    var dr_sq = Math.abs(dx * dx + dy * dy);
    var delta = r_sq * dr_sq - det_sq;
    if (delta < -epsilon) {
      return undefined;
    }
    var suffix = Math.sqrt(r_sq * dr_sq - det_sq);
    function sgn(x) {
      return x < -epsilon ? -1 : 1;
    }
    var solutionA = [center[0] + (det * dy + sgn(dy) * dx * suffix) / dr_sq, center[1] + (-det * dx + Math.abs(dy) * suffix) / dr_sq];
    if (delta > epsilon) {
      var solutionB = [center[0] + (det * dy - sgn(dy) * dx * suffix) / dr_sq, center[1] + (-det * dx - Math.abs(dy) * suffix) / dr_sq];
      return [solutionA, solutionB];
    }
    return [solutionA];
  };
  var circle_ray = function circle_ray(center, radius, p0, p1) {
    throw "circle_ray has not been written yet";
  };
  var circle_edge = function circle_edge(center, radius, p0, p1) {
    var r_squared = Math.pow(radius, 2);
    var x1 = p0[0] - center[0];
    var y1 = p0[1] - center[1];
    var x2 = p1[0] - center[0];
    var y2 = p1[1] - center[1];
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dr_squared = dx * dx + dy * dy;
    var D = x1 * y2 - x2 * y1;
    function sgn(x) {
      if (x < 0) {
        return -1;
      }
      return 1;
    }
    var x_1 = (D * dy + sgn(dy) * dx * Math.sqrt(r_squared * dr_squared - D * D)) / dr_squared;
    var x_2 = (D * dy - sgn(dy) * dx * Math.sqrt(r_squared * dr_squared - D * D)) / dr_squared;
    var y_1 = (-D * dx + Math.abs(dy) * Math.sqrt(r_squared * dr_squared - D * D)) / dr_squared;
    var y_2 = (-D * dx - Math.abs(dy) * Math.sqrt(r_squared * dr_squared - D * D)) / dr_squared;
    var x1_NaN = isNaN(x_1);
    var x2_NaN = isNaN(x_2);
    if (!x1_NaN && !x2_NaN) {
      return [[x_1 + center[0], y_1 + center[1]], [x_2 + center[0], y_2 + center[1]]];
    }
    if (x1_NaN && x2_NaN) {
      return undefined;
    }
    if (!x1_NaN) {
      return [[x_1 + center[0], y_1 + center[1]]];
    }
    if (!x2_NaN) {
      return [[x_2 + center[0], y_2 + center[1]]];
    }
  };
  var quick_equivalent_2 = function quick_equivalent_2(a, b) {
    return Math.abs(a[0] - b[0]) < EPSILON && Math.abs(a[1] - b[1]) < EPSILON;
  };
  var convex_poly_line = function convex_poly_line(poly, linePoint, lineVector) {
    var intersections = poly.map(function (p, i, arr) {
      return [p, arr[(i + 1) % arr.length]];
    }).map(function (el) {
      return line_edge(linePoint, lineVector, el[0], el[1]);
    }).filter(function (el) {
      return el != null;
    });
    switch (intersections.length) {
      case 0:
        return undefined;
      case 1:
        return [intersections[0], intersections[0]];
      case 2:
        return intersections;
      default:
        for (var i = 1; i < intersections.length; i += 1) {
          if (!quick_equivalent_2(intersections[0], intersections[i])) {
            return [intersections[0], intersections[i]];
          }
        }
        return undefined;
    }
  };
  var convex_poly_ray = function convex_poly_ray(poly, linePoint, lineVector) {
    var intersections = poly.map(function (p, i, arr) {
      return [p, arr[(i + 1) % arr.length]];
    }).map(function (el) {
      return ray_edge(linePoint, lineVector, el[0], el[1]);
    }).filter(function (el) {
      return el != null;
    });
    switch (intersections.length) {
      case 0:
        return undefined;
      case 1:
        return [linePoint, intersections[0]];
      case 2:
        return intersections;
      default:
        for (var i = 1; i < intersections.length; i += 1) {
          if (!quick_equivalent_2(intersections[0], intersections[i])) {
            return [intersections[0], intersections[i]];
          }
        }
        return undefined;
    }
  };
  var convex_poly_edge = function convex_poly_edge(poly, edgeA, edgeB) {
    var intersections = poly.map(function (p, i, arr) {
      return [p, arr[(i + 1) % arr.length]];
    }).map(function (el) {
      return edge_edge_exclusive(edgeA, edgeB, el[0], el[1]);
    }).filter(function (el) {
      return el != null;
    });
    var aInsideExclusive = point_in_convex_poly_exclusive(edgeA, poly);
    var bInsideExclusive = point_in_convex_poly_exclusive(edgeB, poly);
    var aInsideInclusive = point_in_convex_poly(edgeA, poly);
    var bInsideInclusive = point_in_convex_poly(edgeB, poly);
    if (intersections.length === 0 && (aInsideExclusive || bInsideExclusive)) {
      return [edgeA, edgeB];
    }
    if (intersections.length === 0 && aInsideInclusive && bInsideInclusive) {
      return [edgeA, edgeB];
    }
    switch (intersections.length) {
      case 0:
        return aInsideExclusive ? [_toConsumableArray$1(edgeA), _toConsumableArray$1(edgeB)] : undefined;
      case 1:
        return aInsideInclusive ? [_toConsumableArray$1(edgeA), intersections[0]] : [_toConsumableArray$1(edgeB), intersections[0]];
      case 2:
        return intersections;
      default:
        throw new Error("clipping edge in a convex polygon resulting in 3 or more points");
    }
  };
  var convex_poly_ray_exclusive = function convex_poly_ray_exclusive(poly, linePoint, lineVector) {
    var intersections = poly.map(function (p, i, arr) {
      return [p, arr[(i + 1) % arr.length]];
    }).map(function (el) {
      return ray_edge_exclusive(linePoint, lineVector, el[0], el[1]);
    }).filter(function (el) {
      return el != null;
    });
    switch (intersections.length) {
      case 0:
        return undefined;
      case 1:
        return [linePoint, intersections[0]];
      case 2:
        return intersections;
      default:
        for (var i = 1; i < intersections.length; i += 1) {
          if (!quick_equivalent_2(intersections[0], intersections[i])) {
            return [intersections[0], intersections[i]];
          }
        }
        return undefined;
    }
  };
  var intersection = Object.freeze({
    limit_line: limit_line,
    limit_ray: limit_ray,
    limit_edge: limit_edge,
    intersection_function: intersection_function,
    line_line: line_line,
    line_ray: line_ray,
    line_edge: line_edge,
    ray_ray: ray_ray,
    ray_edge: ray_edge,
    edge_edge: edge_edge,
    line_ray_exclusive: line_ray_exclusive,
    line_edge_exclusive: line_edge_exclusive,
    ray_ray_exclusive: ray_ray_exclusive,
    ray_edge_exclusive: ray_edge_exclusive,
    edge_edge_exclusive: edge_edge_exclusive,
    circle_line: circle_line,
    circle_ray: circle_ray,
    circle_edge: circle_edge,
    convex_poly_line: convex_poly_line,
    convex_poly_ray: convex_poly_ray,
    convex_poly_edge: convex_poly_edge,
    convex_poly_ray_exclusive: convex_poly_ray_exclusive
  });
  var clockwise_angle2_radians = function clockwise_angle2_radians(a, b) {
    while (a < 0) {
      a += Math.PI * 2;
    }
    while (b < 0) {
      b += Math.PI * 2;
    }
    var a_b = a - b;
    return a_b >= 0 ? a_b : Math.PI * 2 - (b - a);
  };
  var counter_clockwise_angle2_radians = function counter_clockwise_angle2_radians(a, b) {
    while (a < 0) {
      a += Math.PI * 2;
    }
    while (b < 0) {
      b += Math.PI * 2;
    }
    var b_a = b - a;
    return b_a >= 0 ? b_a : Math.PI * 2 - (a - b);
  };
  var clockwise_angle2 = function clockwise_angle2(a, b) {
    var dotProduct = b[0] * a[0] + b[1] * a[1];
    var determinant = b[0] * a[1] - b[1] * a[0];
    var angle = Math.atan2(determinant, dotProduct);
    if (angle < 0) {
      angle += Math.PI * 2;
    }
    return angle;
  };
  var counter_clockwise_angle2 = function counter_clockwise_angle2(a, b) {
    var dotProduct = a[0] * b[0] + a[1] * b[1];
    var determinant = a[0] * b[1] - a[1] * b[0];
    var angle = Math.atan2(determinant, dotProduct);
    if (angle < 0) {
      angle += Math.PI * 2;
    }
    return angle;
  };
  var counter_clockwise_vector_order = function counter_clockwise_vector_order() {
    for (var _len = arguments.length, vectors = new Array(_len), _key = 0; _key < _len; _key++) {
      vectors[_key] = arguments[_key];
    }
    var vectors_radians = vectors.map(function (v) {
      return Math.atan2(v[1], v[0]);
    });
    var counter_clockwise = Array.from(Array(vectors_radians.length)).map(function (_, i) {
      return i;
    }).sort(function (a, b) {
      return vectors_radians[a] - vectors_radians[b];
    });
    return counter_clockwise.slice(counter_clockwise.indexOf(0), counter_clockwise.length).concat(counter_clockwise.slice(0, counter_clockwise.indexOf(0)));
  };
  var interior_angles2 = function interior_angles2(a, b) {
    var interior1 = counter_clockwise_angle2(a, b);
    var interior2 = Math.PI * 2 - interior1;
    return [interior1, interior2];
  };
  var interior_angles = function interior_angles() {
    for (var _len2 = arguments.length, vectors = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      vectors[_key2] = arguments[_key2];
    }
    return vectors.map(function (v, i, ar) {
      return counter_clockwise_angle2(v, ar[(i + 1) % ar.length]);
    });
  };
  var bisect_vectors = function bisect_vectors(a, b) {
    var aV = normalize(a);
    var bV = normalize(b);
    var sum = aV.map(function (_, i) {
      return aV[i] + bV[i];
    });
    var vecA = normalize(sum);
    var vecB = aV.map(function (_, i) {
      return -aV[i] + -bV[i];
    });
    return [vecA, normalize(vecB)];
  };
  var bisect_lines2 = function bisect_lines2(pointA, vectorA, pointB, vectorB) {
    var denominator = vectorA[0] * vectorB[1] - vectorB[0] * vectorA[1];
    if (Math.abs(denominator) < EPSILON) {
      var solution = [midpoint2(pointA, pointB), [vectorA[0], vectorA[1]]];
      var array = [solution, solution];
      var dot$$1 = vectorA[0] * vectorB[0] + vectorA[1] * vectorB[1];
      delete (dot$$1 > 0 ? array[1] : array[0]);
      return array;
    }
    var numerator = (pointB[0] - pointA[0]) * vectorB[1] - vectorB[0] * (pointB[1] - pointA[1]);
    var t = numerator / denominator;
    var x = pointA[0] + vectorA[0] * t;
    var y = pointA[1] + vectorA[1] * t;
    var bisects = bisect_vectors(vectorA, vectorB);
    bisects[1] = [bisects[1][1], -bisects[1][0]];
    return bisects.map(function (el) {
      return [[x, y], el];
    });
  };
  var subsect_radians = function subsect_radians(divisions, angleA, angleB) {
    var angle = counter_clockwise_angle2(angleA, angleB) / divisions;
    return Array.from(Array(divisions - 1)).map(function (_, i) {
      return angleA + angle * i;
    });
  };
  var subsect = function subsect(divisions, vectorA, vectorB) {
    var angleA = Math.atan2(vectorA[1], vectorA[0]);
    var angleB = Math.atan2(vectorB[1], vectorB[0]);
    return subsect_radians(divisions, angleA, angleB).map(function (rad) {
      return [Math.cos(rad), Math.sin(rad)];
    });
  };
  var signed_area = function signed_area(points) {
    return 0.5 * points.map(function (el, i, arr) {
      var next = arr[(i + 1) % arr.length];
      return el[0] * next[1] - next[0] * el[1];
    }).reduce(function (a, b) {
      return a + b;
    }, 0);
  };
  var centroid = function centroid(points) {
    var sixthArea = 1 / (6 * signed_area(points));
    return points.map(function (el, i, arr) {
      var next = arr[(i + 1) % arr.length];
      var mag = el[0] * next[1] - next[0] * el[1];
      return [(el[0] + next[0]) * mag, (el[1] + next[1]) * mag];
    }).reduce(function (a, b) {
      return [a[0] + b[0], a[1] + b[1]];
    }, [0, 0]).map(function (c) {
      return c * sixthArea;
    });
  };
  var enclosing_rectangle = function enclosing_rectangle(points) {
    var l = points[0].length;
    var mins = Array.from(Array(l)).map(function () {
      return Infinity;
    });
    var maxs = Array.from(Array(l)).map(function () {
      return -Infinity;
    });
    points.forEach(function (point) {
      return point.forEach(function (c, i) {
        if (c < mins[i]) {
          mins[i] = c;
        }
        if (c > maxs[i]) {
          maxs[i] = c;
        }
      });
    });
    var lengths = maxs.map(function (max, i) {
      return max - mins[i];
    });
    return [mins, lengths];
  };
  var make_regular_polygon = function make_regular_polygon(sides) {
    var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var radius = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
    var halfwedge = 2 * Math.PI / sides * 0.5;
    var r = radius / Math.cos(halfwedge);
    return Array.from(Array(Math.floor(sides))).map(function (_, i) {
      var a = -2 * Math.PI * i / sides + halfwedge;
      var px = clean_number(x + r * Math.sin(a), 14);
      var py = clean_number(y + r * Math.cos(a), 14);
      return [px, py];
    });
  };
  var smallest_comparison_search = function smallest_comparison_search(obj, array, compare_func) {
    var objs = array.map(function (o, i) {
      return {
        o: o,
        i: i,
        d: compare_func(obj, o)
      };
    });
    var index;
    var smallest_value = Infinity;
    for (var i = 0; i < objs.length; i += 1) {
      if (objs[i].d < smallest_value) {
        index = i;
        smallest_value = objs[i].d;
      }
    }
    return index;
  };
  var nearest_point2 = function nearest_point2(point, array_of_points) {
    var index = smallest_comparison_search(point, array_of_points, distance2);
    return index === undefined ? undefined : array_of_points[index];
  };
  var nearest_point = function nearest_point(point, array_of_points) {
    var index = smallest_comparison_search(point, array_of_points, distance$1);
    return index === undefined ? undefined : array_of_points[index];
  };
  var nearest_point_on_line = function nearest_point_on_line(linePoint, lineVec, point, limiterFunc) {
    var epsilon = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : EPSILON;
    var magSquared = Math.pow(lineVec[0], 2) + Math.pow(lineVec[1], 2);
    var vectorToPoint = [0, 1].map(function (_, i) {
      return point[i] - linePoint[i];
    });
    var pTo0 = [0, 1].map(function (_, i) {
      return point[i] - linePoint[i];
    });
    var dot$$1 = [0, 1].map(function (_, i) {
      return lineVec[i] * vectorToPoint[i];
    }).reduce(function (a, b) {
      return a + b;
    }, 0);
    var distance$$1 = dot$$1 / magSquared;
    var d = limiterFunc(distance$$1, epsilon);
    return [0, 1].map(function (_, i) {
      return linePoint[i] + lineVec[i] * d;
    });
  };
  var split_polygon = function split_polygon(poly, linePoint, lineVector) {
    var vertices_intersections = poly.map(function (v, i) {
      var intersection = point_on_line(linePoint, lineVector, v);
      return {
        type: "v",
        point: intersection ? v : null,
        at_index: i
      };
    }).filter(function (el) {
      return el.point != null;
    });
    var edges_intersections = poly.map(function (v, i, arr) {
      var intersection = line_edge_exclusive(linePoint, lineVector, v, arr[(i + 1) % arr.length]);
      return {
        type: "e",
        point: intersection,
        at_index: i
      };
    }).filter(function (el) {
      return el.point != null;
    });
    var sorted = vertices_intersections.concat(edges_intersections).sort(function (a, b) {
      return Math.abs(a.point[0] - b.point[0]) < EPSILON ? a.point[1] - b.point[1] : a.point[0] - b.point[0];
    });
    console.log(sorted);
    return poly;
  };
  var split_convex_polygon = function split_convex_polygon(poly, linePoint, lineVector) {
    var vertices_intersections = poly.map(function (v, i) {
      var intersection = point_on_line(linePoint, lineVector, v);
      return {
        point: intersection ? v : null,
        at_index: i
      };
    }).filter(function (el) {
      return el.point != null;
    });
    var edges_intersections = poly.map(function (v, i, arr) {
      var intersection = line_edge_exclusive(linePoint, lineVector, v, arr[(i + 1) % arr.length]);
      return {
        point: intersection,
        at_index: i
      };
    }).filter(function (el) {
      return el.point != null;
    });
    if (edges_intersections.length == 2) {
      var sorted_edges = edges_intersections.slice().sort(function (a, b) {
        return a.at_index - b.at_index;
      });
      var face_a = poly.slice(sorted_edges[1].at_index + 1).concat(poly.slice(0, sorted_edges[0].at_index + 1));
      face_a.push(sorted_edges[0].point);
      face_a.push(sorted_edges[1].point);
      var face_b = poly.slice(sorted_edges[0].at_index + 1, sorted_edges[1].at_index + 1);
      face_b.push(sorted_edges[1].point);
      face_b.push(sorted_edges[0].point);
      return [face_a, face_b];
    } else if (edges_intersections.length == 1 && vertices_intersections.length == 1) {
      vertices_intersections[0]["type"] = "v";
      edges_intersections[0]["type"] = "e";
      var sorted_geom = vertices_intersections.concat(edges_intersections).sort(function (a, b) {
        return a.at_index - b.at_index;
      });
      var _face_a = poly.slice(sorted_geom[1].at_index + 1).concat(poly.slice(0, sorted_geom[0].at_index + 1));
      if (sorted_geom[0].type === "e") {
        _face_a.push(sorted_geom[0].point);
      }
      _face_a.push(sorted_geom[1].point);
      var _face_b = poly.slice(sorted_geom[0].at_index + 1, sorted_geom[1].at_index + 1);
      if (sorted_geom[1].type === "e") {
        _face_b.push(sorted_geom[1].point);
      }
      _face_b.push(sorted_geom[0].point);
      return [_face_a, _face_b];
    } else if (vertices_intersections.length == 2) {
      var sorted_vertices = vertices_intersections.slice().sort(function (a, b) {
        return a.at_index - b.at_index;
      });
      var _face_a2 = poly.slice(sorted_vertices[1].at_index).concat(poly.slice(0, sorted_vertices[0].at_index + 1));
      var _face_b2 = poly.slice(sorted_vertices[0].at_index, sorted_vertices[1].at_index + 1);
      return [_face_a2, _face_b2];
    }
    return [poly.slice()];
  };
  var convex_hull = function convex_hull(points) {
    var epsilon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EPSILON;
    var INFINITE_LOOP = 10000;
    var sorted = points.slice().sort(function (a, b) {
      return Math.abs(a[1] - b[1]) < epsilon ? a[0] - b[0] : a[1] - b[1];
    });
    var hull = [];
    hull.push(sorted[0]);
    var ang = 0;
    var infiniteLoop = 0;
    var _loop = function _loop() {
      infiniteLoop += 1;
      var h = hull.length - 1;
      var angles = sorted.filter(function (el) {
        return !(Math.abs(el[0] - hull[h][0]) < epsilon && Math.abs(el[1] - hull[h][1]) < epsilon);
      }).map(function (el) {
        var angle = Math.atan2(hull[h][1] - el[1], hull[h][0] - el[0]);
        while (angle < ang) {
          angle += Math.PI * 2;
        }
        return {
          node: el,
          angle: angle,
          distance: undefined
        };
      }).sort(function (a, b) {
        return a.angle < b.angle ? -1 : a.angle > b.angle ? 1 : 0;
      });
      if (angles.length === 0) {
        return {
          v: undefined
        };
      }
      var rightTurn = angles[0];
      angles = angles.filter(function (el) {
        return Math.abs(rightTurn.angle - el.angle) < epsilon;
      }).map(function (el) {
        var distance$$1 = Math.sqrt(Math.pow(hull[h][0] - el.node[0], 2) + Math.pow(hull[h][1] - el.node[1], 2));
        el.distance = distance$$1;
        return el;
      }).sort(function (a, b) {
        return a.distance < b.distance ? 1 : a.distance > b.distance ? -1 : 0;
      });
      if (hull.filter(function (el) {
        return el === angles[0].node;
      }).length > 0) {
        return {
          v: hull
        };
      }
      hull.push(angles[0].node);
      ang = Math.atan2(hull[h][1] - angles[0].node[1], hull[h][0] - angles[0].node[0]);
    };
    do {
      var _ret = _loop();
      if (_typeof(_ret) === "object") return _ret.v;
    } while (infiniteLoop < INFINITE_LOOP);
    return undefined;
  };
  var geometry = Object.freeze({
    clockwise_angle2_radians: clockwise_angle2_radians,
    counter_clockwise_angle2_radians: counter_clockwise_angle2_radians,
    clockwise_angle2: clockwise_angle2,
    counter_clockwise_angle2: counter_clockwise_angle2,
    counter_clockwise_vector_order: counter_clockwise_vector_order,
    interior_angles2: interior_angles2,
    interior_angles: interior_angles,
    bisect_vectors: bisect_vectors,
    bisect_lines2: bisect_lines2,
    subsect_radians: subsect_radians,
    subsect: subsect,
    signed_area: signed_area,
    centroid: centroid,
    enclosing_rectangle: enclosing_rectangle,
    make_regular_polygon: make_regular_polygon,
    nearest_point2: nearest_point2,
    nearest_point: nearest_point,
    nearest_point_on_line: nearest_point_on_line,
    split_polygon: split_polygon,
    split_convex_polygon: split_convex_polygon,
    convex_hull: convex_hull
  });
  var alternating_sum = function alternating_sum() {
    for (var _len = arguments.length, angles = new Array(_len), _key = 0; _key < _len; _key++) {
      angles[_key] = arguments[_key];
    }
    return [0, 1].map(function (even_odd) {
      return angles.filter(function (_, i) {
        return i % 2 === even_odd;
      }).reduce(function (a, b) {
        return a + b;
      }, 0);
    });
  };
  var kawasaki_sector_score = function kawasaki_sector_score() {
    return alternating_sum.apply(void 0, arguments).map(function (a) {
      return a < 0 ? a + Math.PI * 2 : a;
    }).map(function (s) {
      return Math.PI - s;
    });
  };
  var kawasaki_solutions_radians = function kawasaki_solutions_radians() {
    for (var _len2 = arguments.length, vectors_radians = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      vectors_radians[_key2] = arguments[_key2];
    }
    return vectors_radians.map(function (v, i, ar) {
      return counter_clockwise_angle2_radians(v, ar[(i + 1) % ar.length]);
    }).map(function (_, i, arr) {
      return arr.slice(i + 1, arr.length).concat(arr.slice(0, i));
    }).map(function (opposite_sectors) {
      return kawasaki_sector_score.apply(void 0, _toConsumableArray$1(opposite_sectors));
    }).map(function (kawasakis, i) {
      return vectors_radians[i] + kawasakis[0];
    }).map(function (angle, i) {
      return is_counter_clockwise_between(angle, vectors_radians[i], vectors_radians[(i + 1) % vectors_radians.length]) ? angle : undefined;
    });
  };
  var kawasaki_solutions = function kawasaki_solutions() {
    for (var _len3 = arguments.length, vectors = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      vectors[_key3] = arguments[_key3];
    }
    var vectors_radians = vectors.map(function (v) {
      return Math.atan2(v[1], v[0]);
    });
    return kawasaki_solutions_radians.apply(void 0, _toConsumableArray$1(vectors_radians)).map(function (a) {
      return a === undefined ? undefined : [clean_number(Math.cos(a), 14), clean_number(Math.sin(a), 14)];
    });
  };
  var origami = Object.freeze({
    alternating_sum: alternating_sum,
    kawasaki_sector_score: kawasaki_sector_score,
    kawasaki_solutions_radians: kawasaki_solutions_radians,
    kawasaki_solutions: kawasaki_solutions
  });
  var VectorPrototype = function VectorPrototype(subtype) {
    var proto = [];
    var Type = subtype;
    var _this;
    var bind = function bind(that) {
      _this = that;
    };
    var vecNormalize = function vecNormalize() {
      return Type(normalize(_this));
    };
    var vecDot = function vecDot() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var vec = get_vector(args);
      return this.length > vec.length ? dot(vec, _this) : dot(_this, vec);
    };
    var cross = function cross() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      var b = get_vector(args);
      var a = _this.slice();
      if (a[2] == null) {
        a[2] = 0;
      }
      if (b[2] == null) {
        b[2] = 0;
      }
      return Type(cross3(a, b));
    };
    var distanceTo = function distanceTo() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      var vec = get_vector(args);
      var length = _this.length < vec.length ? _this.length : vec.length;
      var sum = Array.from(Array(length)).map(function (_, i) {
        return Math.pow(_this[i] - vec[i], 2);
      }).reduce(function (prev, curr) {
        return prev + curr;
      }, 0);
      return Math.sqrt(sum);
    };
    var transform = function transform() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      var m = get_matrix2(args);
      return Type(multiply_vector2_matrix2(_this, m));
    };
    var add = function add() {
      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }
      var vec = get_vector(args);
      return Type(_this.map(function (v, i) {
        return v + vec[i];
      }));
    };
    var subtract = function subtract() {
      for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }
      var vec = get_vector(args);
      return Type(_this.map(function (v, i) {
        return v - vec[i];
      }));
    };
    var rotateZ = function rotateZ(angle, origin) {
      var m = make_matrix2_rotation(angle, origin);
      return Type(multiply_vector2_matrix2(_this, m));
    };
    var rotateZ90 = function rotateZ90() {
      return Type(-_this[1], _this[0]);
    };
    var rotateZ180 = function rotateZ180() {
      return Type(-_this[0], -_this[1]);
    };
    var rotateZ270 = function rotateZ270() {
      return Type(_this[1], -_this[0]);
    };
    var reflect = function reflect() {
      for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }
      var ref = get_line(args);
      var m = make_matrix2_reflection(ref.vector, ref.point);
      return Type(multiply_vector2_matrix2(_this, m));
    };
    var lerp = function lerp(vector, pct) {
      var vec = get_vector(vector);
      var inv = 1.0 - pct;
      var length = _this.length < vec.length ? _this.length : vec.length;
      var components = Array.from(Array(length)).map(function (_, i) {
        return _this[i] * pct + vec[i] * inv;
      });
      return Type(components);
    };
    var isEquivalent = function isEquivalent() {
      for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        args[_key8] = arguments[_key8];
      }
      var vec = get_vector(args);
      var sm = _this.length < vec.length ? _this : vec;
      var lg = _this.length < vec.length ? vec : _this;
      return equivalent(sm, lg);
    };
    var isParallel = function isParallel() {
      for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
        args[_key9] = arguments[_key9];
      }
      var vec = get_vector(args);
      var sm = _this.length < vec.length ? _this : vec;
      var lg = _this.length < vec.length ? vec : _this;
      return parallel(sm, lg);
    };
    var scale = function scale(mag) {
      return Type(_this.map(function (v) {
        return v * mag;
      }));
    };
    var midpoint = function midpoint() {
      for (var _len10 = arguments.length, args = new Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
        args[_key10] = arguments[_key10];
      }
      var vec = get_vector(args);
      var sm = _this.length < vec.length ? _this.slice() : vec;
      var lg = _this.length < vec.length ? vec : _this.slice();
      for (var i = sm.length; i < lg.length; i += 1) {
        sm[i] = 0;
      }
      return Type(lg.map(function (_, i) {
        return (sm[i] + lg[i]) * 0.5;
      }));
    };
    var bisect = function bisect() {
      for (var _len11 = arguments.length, args = new Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
        args[_key11] = arguments[_key11];
      }
      var vec = get_vector(args);
      return bisect_vectors(_this, vec).map(function (b) {
        return Type(b);
      });
    };
    Object.defineProperty(proto, "normalize", {
      value: vecNormalize
    });
    Object.defineProperty(proto, "dot", {
      value: vecDot
    });
    Object.defineProperty(proto, "cross", {
      value: cross
    });
    Object.defineProperty(proto, "distanceTo", {
      value: distanceTo
    });
    Object.defineProperty(proto, "transform", {
      value: transform
    });
    Object.defineProperty(proto, "add", {
      value: add
    });
    Object.defineProperty(proto, "subtract", {
      value: subtract
    });
    Object.defineProperty(proto, "rotateZ", {
      value: rotateZ
    });
    Object.defineProperty(proto, "rotateZ90", {
      value: rotateZ90
    });
    Object.defineProperty(proto, "rotateZ180", {
      value: rotateZ180
    });
    Object.defineProperty(proto, "rotateZ270", {
      value: rotateZ270
    });
    Object.defineProperty(proto, "reflect", {
      value: reflect
    });
    Object.defineProperty(proto, "lerp", {
      value: lerp
    });
    Object.defineProperty(proto, "isEquivalent", {
      value: isEquivalent
    });
    Object.defineProperty(proto, "isParallel", {
      value: isParallel
    });
    Object.defineProperty(proto, "scale", {
      value: scale
    });
    Object.defineProperty(proto, "midpoint", {
      value: midpoint
    });
    Object.defineProperty(proto, "bisect", {
      value: bisect
    });
    Object.defineProperty(proto, "copy", {
      value: function value() {
        return Type.apply(void 0, _toConsumableArray$1(_this));
      }
    });
    Object.defineProperty(proto, "magnitude", {
      get: function get() {
        return magnitude(_this);
      }
    });
    Object.defineProperty(proto, "bind", {
      value: bind
    });
    return proto;
  };
  var Vector = function Vector() {
    var proto = VectorPrototype(Vector);
    var vector = Object.create(proto);
    proto.bind(vector);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    get_vector(args).forEach(function (v) {
      return vector.push(v);
    });
    Object.defineProperty(vector, "x", {
      get: function get() {
        return vector[0];
      }
    });
    Object.defineProperty(vector, "y", {
      get: function get() {
        return vector[1];
      }
    });
    Object.defineProperty(vector, "z", {
      get: function get() {
        return vector[2];
      }
    });
    return vector;
  };
  var Matrix2 = function Matrix2() {
    var matrix = [];
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    get_matrix2(args).forEach(function (n) {
      return matrix.push(n);
    });
    var inverse = function inverse() {
      return Matrix2(make_matrix2_inverse(matrix).map(function (n) {
        return clean_number(n, 13);
      }));
    };
    var multiply = function multiply() {
      for (var _len2 = arguments.length, innerArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        innerArgs[_key2] = arguments[_key2];
      }
      var m2 = get_matrix2(innerArgs);
      return Matrix2(multiply_matrices2$1(matrix, m2).map(function (n) {
        return clean_number(n, 13);
      }));
    };
    var transform = function transform() {
      for (var _len3 = arguments.length, innerArgs = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        innerArgs[_key3] = arguments[_key3];
      }
      var v = get_vector(innerArgs);
      return Vector(multiply_vector2_matrix2(v, matrix).map(function (n) {
        return clean_number(n, 13);
      }));
    };
    Object.defineProperty(matrix, "inverse", {
      value: inverse
    });
    Object.defineProperty(matrix, "multiply", {
      value: multiply
    });
    Object.defineProperty(matrix, "transform", {
      value: transform
    });
    return Object.freeze(matrix);
  };
  Matrix2.makeIdentity = function () {
    return Matrix2(1, 0, 0, 1, 0, 0);
  };
  Matrix2.makeTranslation = function (tx, ty) {
    return Matrix2(1, 0, 0, 1, tx, ty);
  };
  Matrix2.makeScale = function () {
    return Matrix2.apply(void 0, _toConsumableArray$1(make_matrix2_scale.apply(void 0, arguments)));
  };
  Matrix2.makeRotation = function (angle, origin) {
    return Matrix2(make_matrix2_rotation(angle, origin).map(function (n) {
      return clean_number(n, 13);
    }));
  };
  Matrix2.makeReflection = function (vector, origin) {
    return Matrix2(make_matrix2_reflection(vector, origin).map(function (n) {
      return clean_number(n, 13);
    }));
  };
  function Prototype (subtype, prototype) {
    var proto = prototype != null ? prototype : {};
    var compare_to_line = function compare_to_line(t0, t1) {
      var epsilon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EPSILON;
      return this.compare_function(t0, epsilon) && true;
    };
    var compare_to_ray = function compare_to_ray(t0, t1) {
      var epsilon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EPSILON;
      return this.compare_function(t0, epsilon) && t1 >= -epsilon;
    };
    var compare_to_edge = function compare_to_edge(t0, t1) {
      var epsilon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EPSILON;
      return this.compare_function(t0, epsilon) && t1 >= -epsilon && t1 <= 1 + epsilon;
    };
    var isParallel = function isParallel(line, epsilon) {
      if (line.vector == null) {
        throw "line isParallel(): please ensure object contains a vector";
      }
      var this_is_smaller = this.vector.length < line.vector.length;
      var sm = this_is_smaller ? this.vector : line.vector;
      var lg = this_is_smaller ? line.vector : this.vector;
      return parallel(sm, lg, epsilon);
    };
    var isDegenerate = function isDegenerate() {
      var epsilon = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : EPSILON;
      return degenerate(this.vector, epsilon);
    };
    var reflection = function reflection() {
      return Matrix2.makeReflection(this.vector, this.point);
    };
    var nearestPoint = function nearestPoint() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var point = get_vector(args);
      return Vector(nearest_point_on_line(this.point, this.vector, point, this.clip_function));
    };
    var intersect = function intersect(other) {
      var _this = this;
      return intersection_function(this.point, this.vector, other.point, other.vector, function (t0, t1) {
        var epsilon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EPSILON;
        return _this.compare_function(t0, epsilon) && other.compare_function(t1, epsilon);
      });
    };
    var intersectLine = function intersectLine() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      var line = get_line(args);
      return intersection_function(this.point, this.vector, line.point, line.vector, compare_to_line.bind(this));
    };
    var intersectRay = function intersectRay() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      var ray = get_ray(args);
      return intersection_function(this.point, this.vector, ray.point, ray.vector, compare_to_ray.bind(this));
    };
    var intersectEdge = function intersectEdge() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      var edge = get_edge(args);
      var edgeVec = [edge[1][0] - edge[0][0], edge[1][1] - edge[0][1]];
      return intersection_function(this.point, this.vector, edge[0], edgeVec, compare_to_edge.bind(this));
    };
    Object.defineProperty(proto, "isParallel", {
      value: isParallel
    });
    Object.defineProperty(proto, "isDegenerate", {
      value: isDegenerate
    });
    Object.defineProperty(proto, "nearestPoint", {
      value: nearestPoint
    });
    Object.defineProperty(proto, "reflection", {
      value: reflection
    });
    Object.defineProperty(proto, "intersect", {
      value: intersect
    });
    Object.defineProperty(proto, "intersectLine", {
      value: intersectLine
    });
    Object.defineProperty(proto, "intersectRay", {
      value: intersectRay
    });
    Object.defineProperty(proto, "intersectEdge", {
      value: intersectEdge
    });
    return Object.freeze(proto);
  }
  var Line = function Line() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var _get_line = get_line(args),
        point = _get_line.point,
        vector = _get_line.vector;
    var transform = function transform() {
      for (var _len2 = arguments.length, innerArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        innerArgs[_key2] = arguments[_key2];
      }
      var mat = get_matrix2(innerArgs);
      var line = multiply_line_matrix2$1(point, vector, mat);
      return Line(line[0], line[1]);
    };
    var proto = Prototype.bind(this);
    var line = Object.create(proto(Line));
    var compare_function = function compare_function() {
      return true;
    };
    Object.defineProperty(line, "compare_function", {
      value: compare_function
    });
    Object.defineProperty(line, "clip_function", {
      value: limit_line
    });
    Object.defineProperty(line, "point", {
      get: function get() {
        return Vector(point);
      }
    });
    Object.defineProperty(line, "vector", {
      get: function get() {
        return Vector(vector);
      }
    });
    Object.defineProperty(line, "length", {
      get: function get() {
        return Infinity;
      }
    });
    Object.defineProperty(line, "transform", {
      value: transform
    });
    return line;
  };
  Line.fromPoints = function () {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }
    var points = get_two_vec2(args);
    return Line({
      point: points[0],
      vector: normalize([points[1][0] - points[0][0], points[1][1] - points[0][1]])
    });
  };
  Line.perpendicularBisector = function () {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }
    var points = get_two_vec2(args);
    var vec = normalize([points[1][0] - points[0][0], points[1][1] - points[0][1]]);
    return Line({
      point: average(points[0], points[1]),
      vector: [vec[1], -vec[0]]
    });
  };
  var Ray = function Ray() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var _get_line = get_line(args),
        point = _get_line.point,
        vector = _get_line.vector;
    var transform = function transform() {
      for (var _len2 = arguments.length, innerArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        innerArgs[_key2] = arguments[_key2];
      }
      var mat = get_matrix2(innerArgs);
      var new_point = multiply_vector2_matrix2(point, mat);
      var vec_point = vector.map(function (vec, i) {
        return vec + point[i];
      });
      var new_vector = multiply_vector2_matrix2(vec_point, mat).map(function (vec, i) {
        return vec - new_point[i];
      });
      return Ray(new_point, new_vector);
    };
    var rotate180 = function rotate180() {
      return Ray(point[0], point[1], -vector[0], -vector[1]);
    };
    var proto = Prototype.bind(this);
    var ray = Object.create(proto(Ray));
    var compare_function = function compare_function(t0, ep) {
      return t0 >= -ep;
    };
    Object.defineProperty(ray, "point", {
      get: function get() {
        return Vector(point);
      }
    });
    Object.defineProperty(ray, "vector", {
      get: function get() {
        return Vector(vector);
      }
    });
    Object.defineProperty(ray, "length", {
      get: function get() {
        return Infinity;
      }
    });
    Object.defineProperty(ray, "transform", {
      value: transform
    });
    Object.defineProperty(ray, "rotate180", {
      value: rotate180
    });
    Object.defineProperty(ray, "compare_function", {
      value: compare_function
    });
    Object.defineProperty(ray, "clip_function", {
      value: limit_ray
    });
    return ray;
  };
  Ray.fromPoints = function () {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }
    var points = get_two_vec2(args);
    return Ray({
      point: points[0],
      vector: normalize([points[1][0] - points[0][0], points[1][1] - points[0][1]])
    });
  };
  var Edge = function Edge() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var inputs = get_two_vec2(args);
    var proto = Prototype.bind(this);
    var edge = Object.create(proto(Edge, []));
    var vecPts = inputs.length > 0 ? inputs.map(function (p) {
      return Vector(p);
    }) : undefined;
    if (vecPts === undefined) {
      return undefined;
    }
    vecPts.forEach(function (p, i) {
      edge[i] = p;
    });
    var transform = function transform() {
      for (var _len2 = arguments.length, innerArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        innerArgs[_key2] = arguments[_key2];
      }
      var mat = get_matrix2(innerArgs);
      var transformed_points = edge.map(function (point) {
        return multiply_vector2_matrix2(point, mat);
      });
      return Edge(transformed_points);
    };
    var vector = function vector() {
      return Vector(edge[1][0] - edge[0][0], edge[1][1] - edge[0][1]);
    };
    var midpoint = function midpoint() {
      return Vector(average(edge[0], edge[1]));
    };
    var length = function length() {
      return Math.sqrt(Math.pow(edge[1][0] - edge[0][0], 2) + Math.pow(edge[1][1] - edge[0][1], 2));
    };
    var compare_function = function compare_function(t0, ep) {
      return t0 >= -ep && t0 <= 1 + ep;
    };
    Object.defineProperty(edge, "point", {
      get: function get() {
        return edge[0];
      }
    });
    Object.defineProperty(edge, "vector", {
      get: function get() {
        return vector();
      }
    });
    Object.defineProperty(edge, "midpoint", {
      value: midpoint
    });
    Object.defineProperty(edge, "length", {
      get: function get() {
        return length();
      }
    });
    Object.defineProperty(edge, "transform", {
      value: transform
    });
    Object.defineProperty(edge, "compare_function", {
      value: compare_function
    });
    Object.defineProperty(edge, "clip_function", {
      value: limit_edge
    });
    return edge;
  };
  var Circle = function Circle() {
    var origin;
    var radius;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var params = Array.from(args);
    var numbers = params.filter(function (param) {
      return !isNaN(param);
    });
    if (numbers.length === 3) {
      origin = Vector(numbers[0], numbers[1]);
      var _numbers = _slicedToArray(numbers, 3);
      radius = _numbers[2];
    }
    var intersectionLine = function intersectionLine() {
      for (var _len2 = arguments.length, innerArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        innerArgs[_key2] = arguments[_key2];
      }
      var line = get_line(innerArgs);
      var p2 = [line.point[0] + line.vector[0], line.point[1] + line.vector[1]];
      var result = circle_line(origin, radius, line.point, p2);
      return result === undefined ? undefined : result.map(function (i) {
        return Vector(i);
      });
    };
    var intersectionRay = function intersectionRay() {
      for (var _len3 = arguments.length, innerArgs = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        innerArgs[_key3] = arguments[_key3];
      }
      var ray = get_ray(innerArgs);
      var result = circle_ray(origin, radius, ray[0], ray[1]);
      return result === undefined ? undefined : result.map(function (i) {
        return Vector(i);
      });
    };
    var intersectionEdge = function intersectionEdge() {
      for (var _len4 = arguments.length, innerArgs = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        innerArgs[_key4] = arguments[_key4];
      }
      var edge = get_two_vec2(innerArgs);
      var result = circle_edge(origin, radius, edge[0], edge[1]);
      return result === undefined ? undefined : result.map(function (i) {
        return Vector(i);
      });
    };
    return {
      intersectionLine: intersectionLine,
      intersectionRay: intersectionRay,
      intersectionEdge: intersectionEdge,
      get origin() {
        return origin;
      },
      get radius() {
        return radius;
      },
      set origin(innerArgs) {
        origin = Vector(innerArgs);
      },
      set radius(newRadius) {
        radius = newRadius;
      }
    };
  };
  var Sector = function Sector(vectorA, vectorB) {
    var center = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0];
    var vectors = [get_vector(vectorA), get_vector(vectorB)];
    var bisect = function bisect() {
      var interior_angle = counter_clockwise_angle2(vectors[0], vectors[1]);
      var vectors_radians = vectors.map(function (el) {
        return Math.atan2(el[1], el[0]);
      });
      var bisected = vectors_radians[0] + interior_angle * 0.5;
      return [Math.cos(bisected), Math.sin(bisected)];
    };
    var subsect_sector = function subsect_sector(divisions) {
      return subsect(divisions, vectors[0], vectors[1]).map(function (vec) {
        return [vec[0], vec[1]];
      });
    };
    var contains = function contains() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var point = get_vector(args).map(function (n, i) {
        return n + center[i];
      });
      var cross0 = (point[1] - vectors[0][1]) * -vectors[0][0] - (point[0] - vectors[0][0]) * -vectors[0][1];
      var cross1 = point[1] * vectors[1][0] - point[0] * vectors[1][1];
      return cross0 < 0 && cross1 < 0;
    };
    return {
      contains: contains,
      bisect: bisect,
      subsect: subsect_sector,
      get center() {
        return center;
      },
      get vectors() {
        return vectors;
      },
      get angle() {
        return counter_clockwise_angle2(vectors[0], vectors[1]);
      }
    };
  };
  Sector.fromVectors = function (vectorA, vectorB) {
    return Sector(vectorA, vectorB);
  };
  Sector.fromPoints = function (pointA, pointB) {
    var center = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0];
    var vectors = [pointA, pointB].map(function (p) {
      return p.map(function (_, i) {
        return p[i] - center[i];
      });
    });
    return Sector(vectors[0], vectors[1], center);
  };
  function Prototype$1 (subtype) {
    var proto = {};
    var Type = subtype;
    var area = function area() {
      return signed_area(this.points);
    };
    var midpoint = function midpoint() {
      return average(this.points);
    };
    var enclosingRectangle = function enclosingRectangle() {
      return enclosing_rectangle(this.points);
    };
    var sectors = function sectors() {
      return this.points.map(function (p, i, a) {
        return [a[(i + a.length - 1) % a.length], a[i], a[(i + 1) % a.length]];
      }).map(function (points) {
        return Sector(points[1], points[2], points[0]);
      });
    };
    var contains = function contains() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return point_in_poly(get_vector(args), this.points);
    };
    var polyCentroid = function polyCentroid() {
      return centroid(this.points);
    };
    var nearest = function nearest() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      var point = get_vector(args);
      var points = this.sides.map(function (edge) {
        return edge.nearestPoint(point);
      });
      var lowD = Infinity;
      var lowI;
      points.map(function (p) {
        return distance2(point, p);
      }).forEach(function (d, i) {
        if (d < lowD) {
          lowD = d;
          lowI = i;
        }
      });
      return {
        point: points[lowI],
        edge: this.sides[lowI]
      };
    };
    var clipEdge = function clipEdge() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      var edge = get_edge(args);
      var e = convex_poly_edge(this.points, edge[0], edge[1]);
      return e === undefined ? undefined : Edge(e);
    };
    var clipLine = function clipLine() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      var line = get_line(args);
      var e = convex_poly_line(this.points, line.point, line.vector);
      return e === undefined ? undefined : Edge(e);
    };
    var clipRay = function clipRay() {
      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }
      var line = get_line(args);
      var e = convex_poly_ray(this.points, line.point, line.vector);
      return e === undefined ? undefined : Edge(e);
    };
    var split = function split() {
      for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }
      var line = get_line(args);
      return split_polygon(this.points, line.point, line.vector).map(function (poly) {
        return Type(poly);
      });
    };
    var scale = function scale(magnitude$$1) {
      var center = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : centroid(this.points);
      var newPoints = this.points.map(function (p) {
        return [0, 1].map(function (_, i) {
          return p[i] - center[i];
        });
      }).map(function (vec) {
        return vec.map(function (_, i) {
          return center[i] + vec[i] * magnitude$$1;
        });
      });
      return Type(newPoints);
    };
    var rotate = function rotate(angle) {
      var centerPoint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : centroid(this.points);
      var newPoints = this.points.map(function (p) {
        var vec = [p[0] - centerPoint[0], p[1] - centerPoint[1]];
        var mag = Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2));
        var a = Math.atan2(vec[1], vec[0]);
        return [centerPoint[0] + Math.cos(a + angle) * mag, centerPoint[1] + Math.sin(a + angle) * mag];
      });
      return Type(newPoints);
    };
    var translate = function translate() {
      for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }
      var vec = get_vector(args);
      var newPoints = this.points.map(function (p) {
        return p.map(function (n, i) {
          return n + vec[i];
        });
      });
      return Type(newPoints);
    };
    var transform = function transform() {
      for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        args[_key8] = arguments[_key8];
      }
      var m = get_matrix2(args);
      var newPoints = this.points.map(function (p) {
        return Vector(multiply_vector2_matrix2(p, m));
      });
      return Type(newPoints);
    };
    Object.defineProperty(proto, "area", {
      value: area
    });
    Object.defineProperty(proto, "centroid", {
      value: polyCentroid
    });
    Object.defineProperty(proto, "midpoint", {
      value: midpoint
    });
    Object.defineProperty(proto, "enclosingRectangle", {
      value: enclosingRectangle
    });
    Object.defineProperty(proto, "contains", {
      value: contains
    });
    Object.defineProperty(proto, "nearest", {
      value: nearest
    });
    Object.defineProperty(proto, "clipEdge", {
      value: clipEdge
    });
    Object.defineProperty(proto, "clipLine", {
      value: clipLine
    });
    Object.defineProperty(proto, "clipRay", {
      value: clipRay
    });
    Object.defineProperty(proto, "split", {
      value: split
    });
    Object.defineProperty(proto, "scale", {
      value: scale
    });
    Object.defineProperty(proto, "rotate", {
      value: rotate
    });
    Object.defineProperty(proto, "translate", {
      value: translate
    });
    Object.defineProperty(proto, "transform", {
      value: transform
    });
    Object.defineProperty(proto, "edges", {
      get: function get() {
        return this.sides;
      }
    });
    Object.defineProperty(proto, "sectors", {
      get: function get() {
        return sectors();
      }
    });
    Object.defineProperty(proto, "signedArea", {
      value: area
    });
    return Object.freeze(proto);
  }
  var Polygon = function Polygon() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var points = get_vector_of_vectors(args).map(function (p) {
      return Vector(p);
    });
    if (points === undefined) {
      return undefined;
    }
    var sides = points.map(function (p, i, arr) {
      return [p, arr[(i + 1) % arr.length]];
    }).map(function (ps) {
      return Edge(ps[0][0], ps[0][1], ps[1][0], ps[1][1]);
    });
    var proto = Prototype$1.bind(this);
    var polygon = Object.create(proto());
    Object.defineProperty(polygon, "points", {
      get: function get() {
        return points;
      }
    });
    Object.defineProperty(polygon, "sides", {
      get: function get() {
        return sides;
      }
    });
    return polygon;
  };
  Polygon.regularPolygon = function (sides) {
    var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var radius = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
    var points = make_regular_polygon(sides, x, y, radius);
    return Polygon(points);
  };
  Polygon.convexHull = function (points) {
    var includeCollinear = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var hull = convex_hull(points, includeCollinear);
    return Polygon(hull);
  };
  var ConvexPolygon = function ConvexPolygon() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var points = get_array_of_vec(args).map(function (p) {
      return Vector(p);
    });
    if (points === undefined) {
      return undefined;
    }
    var sides = points.map(function (p, i, arr) {
      return [p, arr[(i + 1) % arr.length]];
    }).map(function (ps) {
      return Edge(ps[0][0], ps[0][1], ps[1][0], ps[1][1]);
    });
    var proto = Prototype$1.bind(this);
    var polygon = Object.create(proto(ConvexPolygon));
    var split = function split() {
      for (var _len2 = arguments.length, innerArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        innerArgs[_key2] = arguments[_key2];
      }
      var line = get_line(innerArgs);
      return split_convex_polygon(points, line.point, line.vector).map(function (poly) {
        return ConvexPolygon(poly);
      });
    };
    var overlaps = function overlaps() {
      for (var _len3 = arguments.length, innerArgs = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        innerArgs[_key3] = arguments[_key3];
      }
      var poly2Points = get_array_of_vec(innerArgs);
      return convex_polygons_overlap(points, poly2Points);
    };
    var scale = function scale(magnitude) {
      var center = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : centroid(polygon.points);
      var newPoints = polygon.points.map(function (p) {
        return [0, 1].map(function (_, i) {
          return p[i] - center[i];
        });
      }).map(function (vec) {
        return vec.map(function (_, i) {
          return center[i] + vec[i] * magnitude;
        });
      });
      return ConvexPolygon(newPoints);
    };
    var rotate = function rotate(angle) {
      var centerPoint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : centroid(polygon.points);
      var newPoints = polygon.points.map(function (p) {
        var vec = [p[0] - centerPoint[0], p[1] - centerPoint[1]];
        var mag = Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2));
        var a = Math.atan2(vec[1], vec[0]);
        return [centerPoint[0] + Math.cos(a + angle) * mag, centerPoint[1] + Math.sin(a + angle) * mag];
      });
      return ConvexPolygon(newPoints);
    };
    Object.defineProperty(polygon, "points", {
      get: function get() {
        return points;
      }
    });
    Object.defineProperty(polygon, "sides", {
      get: function get() {
        return sides;
      }
    });
    Object.defineProperty(polygon, "split", {
      value: split
    });
    Object.defineProperty(polygon, "overlaps", {
      value: overlaps
    });
    Object.defineProperty(polygon, "scale", {
      value: scale
    });
    Object.defineProperty(polygon, "rotate", {
      value: rotate
    });
    return polygon;
  };
  ConvexPolygon.regularPolygon = function (sides) {
    var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var radius = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
    var points = make_regular_polygon(sides, x, y, radius);
    return ConvexPolygon(points);
  };
  ConvexPolygon.convexHull = function (points) {
    var includeCollinear = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var hull = convex_hull(points, includeCollinear);
    return ConvexPolygon(hull);
  };
  var Rectangle = function Rectangle() {
    var _origin;
    var _width;
    var _height;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var params = Array.from(args);
    var numbers = params.filter(function (param) {
      return !isNaN(param);
    });
    var arrays = params.filter(function (param) {
      return param.constructor === Array;
    });
    if (numbers.length === 4) {
      _origin = numbers.slice(0, 2);
      var _numbers = _slicedToArray(numbers, 4);
      _width = _numbers[2];
      _height = _numbers[3];
    }
    if (arrays.length === 1) {
      arrays = arrays[0];
    }
    if (arrays.length === 2) {
      if (typeof arrays[0][0] === "number") {
        _origin = arrays[0].slice();
        _width = arrays[1][0];
        _height = arrays[1][1];
      }
    }
    var points = [[_origin[0], _origin[1]], [_origin[0] + _width, _origin[1]], [_origin[0] + _width, _origin[1] + _height], [_origin[0], _origin[1] + _height]];
    var proto = Prototype$1.bind(this);
    var rect = Object.create(proto(Rectangle));
    var scale = function scale(magnitude, center_point) {
      var center = center_point != null ? center_point : [_origin[0] + _width, _origin[1] + _height];
      var x = _origin[0] + (center[0] - _origin[0]) * (1 - magnitude);
      var y = _origin[1] + (center[1] - _origin[1]) * (1 - magnitude);
      return Rectangle(x, y, _width * magnitude, _height * magnitude);
    };
    var rotate = function rotate() {
      var _ConvexPolygon;
      return (_ConvexPolygon = ConvexPolygon(points)).rotate.apply(_ConvexPolygon, arguments);
    };
    var transform = function transform() {
      for (var _len2 = arguments.length, innerArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        innerArgs[_key2] = arguments[_key2];
      }
      return ConvexPolygon(points).transform(innerArgs);
    };
    Object.defineProperty(rect, "origin", {
      get: function get() {
        return _origin;
      }
    });
    Object.defineProperty(rect, "width", {
      get: function get() {
        return _width;
      }
    });
    Object.defineProperty(rect, "height", {
      get: function get() {
        return _height;
      }
    });
    Object.defineProperty(rect, "area", {
      get: function get() {
        return _width * _height;
      }
    });
    Object.defineProperty(rect, "scale", {
      value: scale
    });
    Object.defineProperty(rect, "rotate", {
      value: rotate
    });
    Object.defineProperty(rect, "transform", {
      value: transform
    });
    return rect;
  };
  var Junction = function Junction() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var vectors = get_vector_of_vectors(args);
    if (vectors === undefined) {
      return undefined;
    }
    var sorted_order = counter_clockwise_vector_order.apply(void 0, _toConsumableArray$1(vectors));
    var sectors = function sectors() {
      return sorted_order.map(function (i) {
        return vectors[i];
      }).map(function (v, i, arr) {
        return [v, arr[(i + 1) % arr.length]];
      }).map(function (pair) {
        return Sector.fromVectors(pair[0], pair[1]);
      });
    };
    var angles = function angles() {
      return sorted_order.map(function (i) {
        return vectors[i];
      }).map(function (v, i, arr) {
        return [v, arr[(i + 1) % arr.length]];
      }).map(function (pair) {
        return counter_clockwise_angle2(pair[0], pair[1]);
      });
    };
    var alternatingAngleSum = function alternatingAngleSum() {
      return alternating_sum.apply(void 0, _toConsumableArray$1(angles()));
    };
    var kawasaki_score = function kawasaki_score() {
      return kawasaki_sector_score.apply(void 0, _toConsumableArray$1(angles()));
    };
    var kawasaki_solutions$$1 = function kawasaki_solutions$$1() {
      return kawasaki_solutions_radians.apply(void 0, _toConsumableArray$1(angles()));
    };
    return {
      sectors: sectors,
      angles: angles,
      kawasaki_score: kawasaki_score,
      kawasaki_solutions: kawasaki_solutions$$1,
      alternatingAngleSum: alternatingAngleSum,
      get vectors() {
        return vectors;
      },
      get vectorOrder() {
        return _toConsumableArray$1(sorted_order);
      }
    };
  };
  Junction.fromVectors = function () {
    return Junction.apply(void 0, arguments);
  };
  Junction.fromPoints = function (center, edge_adjacent_points) {
    var vectors = edge_adjacent_points.map(function (p) {
      return p.map(function (_, i) {
        return p[i] - center[i];
      });
    });
    return Junction.fromVectors(vectors);
  };
  var core = Object.create(null);
  Object.assign(core, algebra, matrix, geometry, query, equal, origami);
  core.clean_number = clean_number;
  core.is_number = is_number;
  core.is_vector = is_vector;
  core.is_iterable = is_iterable;
  core.flatten_input = flatten_input;
  core.semi_flatten_input = semi_flatten_input;
  core.get_vector = get_vector;
  core.get_vector_of_vectors = get_vector_of_vectors;
  core.get_matrix2 = get_matrix2;
  core.get_edge = get_edge;
  core.get_line = get_line;
  core.get_ray = get_ray;
  core.get_two_vec2 = get_two_vec2;
  core.get_array_of_vec = get_array_of_vec;
  core.get_array_of_vec2 = get_array_of_vec2;
  core.intersection = intersection;
  Object.freeze(core);
  var math = {
    vector: Vector,
    matrix2: Matrix2,
    line: Line,
    ray: Ray,
    edge: Edge,
    circle: Circle,
    polygon: Polygon,
    convexPolygon: ConvexPolygon,
    rectangle: Rectangle,
    junction: Junction,
    sector: Sector,
    core: core
  };

  const max_array_length = function (...arrays) {
    return Math.max(...(arrays
      .filter(el => el !== undefined)
      .map(el => el.length)));
  };
  const vertices_count = function ({
    vertices_coords, vertices_faces, vertices_vertices,
  }) {
    return max_array_length([], vertices_coords,
      vertices_faces, vertices_vertices);
  };
  const edges_count = function ({
    edges_vertices, edges_faces,
  }) {
    return max_array_length([], edges_vertices, edges_faces);
  };
  const faces_count = function ({
    faces_vertices, faces_edges,
  }) {
    return max_array_length([], faces_vertices, faces_edges);
  };
  const get_geometry_length = {
    vertices: vertices_count,
    edges: edges_count,
    faces: faces_count,
  };
  const remove_geometry_key_indices = function (graph, key, removeIndices) {
    const geometry_array_size = get_geometry_length[key](graph);
    const removes = Array(geometry_array_size).fill(false);
    removeIndices.forEach((v) => { removes[v] = true; });
    let s = 0;
    const index_map = removes.map(remove => (remove ? --s : s));
    if (removeIndices.length === 0) { return index_map; }
    const prefix = `${key}_`;
    const suffix = `_${key}`;
    const graph_keys = Object.keys(graph);
    const prefixKeys = graph_keys
      .map(str => (str.substring(0, prefix.length) === prefix ? str : undefined))
      .filter(str => str !== undefined);
    const suffixKeys = graph_keys
      .map(str => (str.substring(str.length - suffix.length, str.length) === suffix
        ? str
        : undefined))
      .filter(str => str !== undefined);
    suffixKeys
      .forEach(sKey => graph[sKey]
        .forEach((_, i) => graph[sKey][i]
          .forEach((v, j) => { graph[sKey][i][j] += index_map[v]; })));
    prefixKeys.forEach((pKey) => {
      graph[pKey] = graph[pKey]
        .filter((_, i) => !removes[i]);
    });
    return index_map;
  };
  const remove_vertices = function (graph, vertices) {
    return remove_geometry_key_indices(graph, "vertices", vertices);
  };
  const equivalent$1 = function (a, b, epsilon = math.core.EPSILON) {
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
  const make_edges_intersections = function ({ vertices_coords, edges_vertices }) {
    const edge_count = edges_vertices.length;
    const edges = edges_vertices
      .map(ev => ev.map(v => vertices_coords[v]));
    const crossings = Array.from(Array(edge_count - 1)).map(() => []);
    for (let i = 0; i < edges.length - 1; i += 1) {
      for (let j = i + 1; j < edges.length; j += 1) {
        crossings[i][j] = math.core.intersection.edge_edge_exclusive(
          edges[i][0], edges[i][1],
          edges[j][0], edges[j][1],
        );
      }
    }
    const edges_intersections = Array.from(Array(edge_count)).map(() => []);
    for (let i = 0; i < edges.length - 1; i += 1) {
      for (let j = i + 1; j < edges.length; j += 1) {
        if (crossings[i][j] != null) {
          edges_intersections[i].push(crossings[i][j]);
          edges_intersections[j].push(crossings[i][j]);
        }
      }
    }
    return edges_intersections;
  };
  const fragment = function (graph, epsilon = math.core.EPSILON) {
    const horizSort = function (a, b) { return a[0] - b[0]; };
    const vertSort = function (a, b) { return a[1] - b[1]; };
    const edges_alignment = make_edges_alignment(graph);
    const edges = graph.edges_vertices
      .map(ev => ev.map(v => graph.vertices_coords[v]));
    edges.forEach((e, i) => e.sort(edges_alignment[i] ? horizSort : vertSort));
    const edges_intersections = make_edges_intersections(graph);
    edges_intersections.forEach((e, i) => e
      .sort(edges_alignment[i] ? horizSort : vertSort));
    let new_edges = edges_intersections
      .map((e, i) => [edges[i][0], ...e, edges[i][1]])
      .map(ev => Array.from(Array(ev.length - 1))
        .map((_, i) => [ev[i], ev[(i + 1)]]));
    new_edges = new_edges
      .map(edgeGroup => edgeGroup
        .filter(e => false === e
          .map((_, i) => Math.abs(e[0][i] - e[1][i]) < epsilon)
          .reduce((a, b) => a && b, true)));
    const edge_map = new_edges
      .map((edge, i) => edge.map(() => i))
      .reduce((a, b) => a.concat(b), []);
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
        vertices_equivalent[i][j] = equivalent$1(
          vertices_coords[i],
          vertices_coords[j],
          epsilon,
        );
      }
    }
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
    edges_vertices
      .forEach((edge, i) => edge
        .forEach((v, j) => {
          edges_vertices[i][j] = vertices_map[v];
        }));
    const flat = {
      vertices_coords,
      edges_vertices,
    };
    if ("edges_assignment" in graph === true) {
      flat.edges_assignment = edge_map.map(i => graph.edges_assignment[i]);
    }
    if ("edges_foldAngle" in graph === true) {
      flat.edges_foldAngle = edge_map.map(i => graph.edges_foldAngle[i]);
    }
    const vertices_remove_indices = vertices_remove
      .map((rm, i) => (rm ? i : undefined))
      .filter(i => i !== undefined);
    remove_vertices(flat, vertices_remove_indices);
    return flat;
  };

  var geom = {},
    modulo = function(a, b) { return (+a % (b = +b) + b) % b; };
  geom.EPS = 0.000001;
  geom.sum = function(a, b) {
    return a + b;
  };
  geom.min = function(a, b) {
    if (a < b) {
      return a;
    } else {
      return b;
    }
  };
  geom.max = function(a, b) {
    if (a > b) {
      return a;
    } else {
      return b;
    }
  };
  geom.all = function(a, b) {
    return a && b;
  };
  geom.next = function(start, n, i) {
    if (i == null) {
      i = 1;
    }
    return modulo(start + i, n);
  };
  geom.rangesDisjoint = function(arg, arg1) {
    var a1, a2, b1, b2, ref, ref1;
    a1 = arg[0], a2 = arg[1];
    b1 = arg1[0], b2 = arg1[1];
    return ((b1 < (ref = Math.min(a1, a2)) && ref > b2)) || ((b1 > (ref1 = Math.max(a1, a2)) && ref1 < b2));
  };
  geom.topologicalSort = function(vs) {
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
  geom.visit = function(v, list) {
    var k, len, ref, u;
    v.visited = true;
    ref = v.children;
    for (k = 0, len = ref.length; k < len; k++) {
      u = ref[k];
      if (!(!u.visited)) {
        continue;
      }
      u.parent = v;
      list = geom.visit(u, list);
    }
    return list.concat([v]);
  };
  geom.magsq = function(a) {
    return geom.dot(a, a);
  };
  geom.mag = function(a) {
    return Math.sqrt(geom.magsq(a));
  };
  geom.unit = function(a, eps) {
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
  geom.ang2D = function(a, eps) {
    if (eps == null) {
      eps = geom.EPS;
    }
    if (geom.magsq(a) < eps) {
      return null;
    }
    return Math.atan2(a[1], a[0]);
  };
  geom.mul = function(a, s) {
    var i, k, len, results;
    results = [];
    for (k = 0, len = a.length; k < len; k++) {
      i = a[k];
      results.push(i * s);
    }
    return results;
  };
  geom.linearInterpolate = function(t, a, b) {
    return geom.plus(geom.mul(a, 1 - t), geom.mul(b, t));
  };
  geom.plus = function(a, b) {
    var ai, i, k, len, results;
    results = [];
    for (i = k = 0, len = a.length; k < len; i = ++k) {
      ai = a[i];
      results.push(ai + b[i]);
    }
    return results;
  };
  geom.sub = function(a, b) {
    return geom.plus(a, geom.mul(b, -1));
  };
  geom.dot = function(a, b) {
    var ai, i;
    return ((function() {
      var k, len, results;
      results = [];
      for (i = k = 0, len = a.length; k < len; i = ++k) {
        ai = a[i];
        results.push(ai * b[i]);
      }
      return results;
    })()).reduce(geom.sum);
  };
  geom.distsq = function(a, b) {
    return geom.magsq(geom.sub(a, b));
  };
  geom.dist = function(a, b) {
    return Math.sqrt(geom.distsq(a, b));
  };
  geom.closestIndex = function(a, bs) {
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
  geom.dir = function(a, b) {
    return geom.unit(geom.sub(b, a));
  };
  geom.ang = function(a, b) {
    var ref, ua, ub, v;
    ref = (function() {
      var k, len, ref, results;
      ref = [a, b];
      results = [];
      for (k = 0, len = ref.length; k < len; k++) {
        v = ref[k];
        results.push(geom.unit(v));
      }
      return results;
    })(), ua = ref[0], ub = ref[1];
    if (!((ua != null) && (ub != null))) {
      return null;
    }
    return Math.acos(geom.dot(ua, ub));
  };
  geom.cross = function(a, b) {
    var i, j, ref, ref1;
    if ((a.length === (ref = b.length) && ref === 2)) {
      return a[0] * b[1] - a[1] * b[0];
    }
    if ((a.length === (ref1 = b.length) && ref1 === 3)) {
      return (function() {
        var k, len, ref2, ref3, results;
        ref2 = [[1, 2], [2, 0], [0, 1]];
        results = [];
        for (k = 0, len = ref2.length; k < len; k++) {
          ref3 = ref2[k], i = ref3[0], j = ref3[1];
          results.push(a[i] * b[j] - a[j] * b[i]);
        }
        return results;
      })();
    }
    return null;
  };
  geom.parallel = function(a, b, eps) {
    var ref, ua, ub, v;
    if (eps == null) {
      eps = geom.EPS;
    }
    ref = (function() {
      var k, len, ref, results;
      ref = [a, b];
      results = [];
      for (k = 0, len = ref.length; k < len; k++) {
        v = ref[k];
        results.push(geom.unit(v));
      }
      return results;
    })(), ua = ref[0], ub = ref[1];
    if (!((ua != null) && (ub != null))) {
      return null;
    }
    return 1 - Math.abs(geom.dot(ua, ub)) < eps;
  };
  geom.rotate = function(a, u, t) {
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
      results.push(((function() {
        var l, len1, ref2, results1;
        ref2 = [ct, -st * u[p[2]], st * u[p[1]]];
        results1 = [];
        for (i = l = 0, len1 = ref2.length; l < len1; i = ++l) {
          q = ref2[i];
          results1.push(a[p[i]] * (u[p[0]] * u[p[i]] * (1 - ct) + q));
        }
        return results1;
      })()).reduce(geom.sum));
    }
    return results;
  };
  geom.interiorAngle = function(a, b, c) {
    var ang;
    ang = geom.ang2D(geom.sub(a, b)) - geom.ang2D(geom.sub(c, b));
    return ang + (ang < 0 ? 2 * Math.PI : 0);
  };
  geom.turnAngle = function(a, b, c) {
    return Math.PI - geom.interiorAngle(a, b, c);
  };
  geom.triangleNormal = function(a, b, c) {
    return geom.unit(geom.cross(geom.sub(b, a), geom.sub(c, b)));
  };
  geom.polygonNormal = function(points, eps) {
    var i, p;
    if (eps == null) {
      eps = geom.EPS;
    }
    return geom.unit(((function() {
      var k, len, results;
      results = [];
      for (i = k = 0, len = points.length; k < len; i = ++k) {
        p = points[i];
        results.push(geom.cross(p, points[geom.next(i, points.length)]));
      }
      return results;
    })()).reduce(geom.plus), eps);
  };
  geom.twiceSignedArea = function(points) {
    var i, v0, v1;
    return ((function() {
      var k, len, results;
      results = [];
      for (i = k = 0, len = points.length; k < len; i = ++k) {
        v0 = points[i];
        v1 = points[geom.next(i, points.length)];
        results.push(v0[0] * v1[1] - v1[0] * v0[1]);
      }
      return results;
    })()).reduce(geom.sum);
  };
  geom.polygonOrientation = function(points) {
    return Math.sign(geom.twiceSignedArea(points));
  };
  geom.sortByAngle = function(points, origin, mapping) {
    if (origin == null) {
      origin = [0, 0];
    }
    if (mapping == null) {
      mapping = function(x) {
        return x;
      };
    }
    origin = mapping(origin);
    return points.sort(function(p, q) {
      var pa, qa;
      pa = geom.ang2D(geom.sub(mapping(p), origin));
      qa = geom.ang2D(geom.sub(mapping(q), origin));
      return pa - qa;
    });
  };
  geom.segmentsCross = function(arg, arg1) {
    var p0, p1, q0, q1;
    p0 = arg[0], q0 = arg[1];
    p1 = arg1[0], q1 = arg1[1];
    if (geom.rangesDisjoint([p0[0], q0[0]], [p1[0], q1[0]]) || geom.rangesDisjoint([p0[1], q0[1]], [p1[1], q1[1]])) {
      return false;
    }
    return geom.polygonOrientation([p0, q0, p1]) !== geom.polygonOrientation([p0, q0, q1]) && geom.polygonOrientation([p1, q1, p0]) !== geom.polygonOrientation([p1, q1, q0]);
  };
  geom.parametricLineIntersect = function(arg, arg1) {
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
  geom.segmentIntersectSegment = function(s1, s2) {
    var ref, s, t;
    ref = geom.parametricLineIntersect(s1, s2), s = ref[0], t = ref[1];
    if ((s != null) && ((0 <= s && s <= 1)) && ((0 <= t && t <= 1))) {
      return geom.linearInterpolate(s, s1[0], s1[1]);
    } else {
      return null;
    }
  };
  geom.lineIntersectLine = function(l1, l2) {
    var ref, s, t;
    ref = geom.parametricLineIntersect(l1, l2), s = ref[0], t = ref[1];
    if (s != null) {
      return geom.linearInterpolate(s, l1[0], l1[1]);
    } else {
      return null;
    }
  };
  geom.pointStrictlyInSegment = function(p, s, eps) {
    var v0, v1;
    if (eps == null) {
      eps = geom.EPS;
    }
    v0 = geom.sub(p, s[0]);
    v1 = geom.sub(p, s[1]);
    return geom.parallel(v0, v1, eps) && geom.dot(v0, v1) < 0;
  };
  geom.centroid = function(points) {
    return geom.mul(points.reduce(geom.plus), 1.0 / points.length);
  };
  geom.basis = function(ps, eps) {
    var d, ds, n, ns, p, x, y, z;
    if (eps == null) {
      eps = geom.EPS;
    }
    if (((function() {
      var k, len, results;
      results = [];
      for (k = 0, len = ps.length; k < len; k++) {
        p = ps[k];
        results.push(p.length !== 3);
      }
      return results;
    })()).reduce(geom.all)) {
      return null;
    }
    ds = (function() {
      var k, len, results;
      results = [];
      for (k = 0, len = ps.length; k < len; k++) {
        p = ps[k];
        if (geom.distsq(p, ps[0]) > eps) {
          results.push(geom.dir(p, ps[0]));
        }
      }
      return results;
    })();
    if (ds.length === 0) {
      return [];
    }
    x = ds[0];
    if (((function() {
      var k, len, results;
      results = [];
      for (k = 0, len = ds.length; k < len; k++) {
        d = ds[k];
        results.push(geom.parallel(d, x, eps));
      }
      return results;
    })()).reduce(geom.all)) {
      return [x];
    }
    ns = (function() {
      var k, len, results;
      results = [];
      for (k = 0, len = ds.length; k < len; k++) {
        d = ds[k];
        results.push(geom.unit(geom.cross(d, x)));
      }
      return results;
    })();
    ns = (function() {
      var k, len, results;
      results = [];
      for (k = 0, len = ns.length; k < len; k++) {
        n = ns[k];
        if (n != null) {
          results.push(n);
        }
      }
      return results;
    })();
    z = ns[0];
    y = geom.cross(z, x);
    if (((function() {
      var k, len, results;
      results = [];
      for (k = 0, len = ns.length; k < len; k++) {
        n = ns[k];
        results.push(geom.parallel(n, z, eps));
      }
      return results;
    })()).reduce(geom.all)) {
      return [x, y];
    }
    return [x, y, z];
  };
  geom.above = function(ps, qs, n, eps) {
    var pn, qn, ref, v, vs;
    if (eps == null) {
      eps = geom.EPS;
    }
    ref = (function() {
      var k, len, ref, results;
      ref = [ps, qs];
      results = [];
      for (k = 0, len = ref.length; k < len; k++) {
        vs = ref[k];
        results.push((function() {
          var l, len1, results1;
          results1 = [];
          for (l = 0, len1 = vs.length; l < len1; l++) {
            v = vs[l];
            results1.push(geom.dot(v, n));
          }
          return results1;
        })());
      }
      return results;
    })(), pn = ref[0], qn = ref[1];
    if (qn.reduce(geom.max) - pn.reduce(geom.min) < eps) {
      return 1;
    }
    if (pn.reduce(geom.max) - qn.reduce(geom.min) < eps) {
      return -1;
    }
    return 0;
  };
  geom.separatingDirection2D = function(t1, t2, n, eps) {
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
  geom.separatingDirection3D = function(t1, t2, eps) {
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
  geom.circleCross = function(d, r1, r2) {
    var x, y;
    x = (d * d - r2 * r2 + r1 * r1) / d / 2;
    y = Math.sqrt(r1 * r1 - x * x);
    return [x, y];
  };
  geom.creaseDir = function(u1, u2, a, b, eps) {
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
  geom.quadSplit = function(u, p, d, t) {
    if (geom.magsq(p) > d * d) {
      throw new Error("STOP! Trying to split expansive quad.");
    }
    return geom.mul(u, (d * d - geom.magsq(p)) / 2 / (d * Math.cos(t) - geom.dot(u, p)));
  };

  var filter = {};
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  filter.edgesAssigned = function(fold, target) {
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
  filter.mountainEdges = function(fold) {
    return filter.edgesAssigned(fold, 'M');
  };
  filter.valleyEdges = function(fold) {
    return filter.edgesAssigned(fold, 'V');
  };
  filter.flatEdges = function(fold) {
    return filter.edgesAssigned(fold, 'F');
  };
  filter.boundaryEdges = function(fold) {
    return filter.edgesAssigned(fold, 'B');
  };
  filter.unassignedEdges = function(fold) {
    return filter.edgesAssigned(fold, 'U');
  };
  filter.keysStartingWith = function(fold, prefix) {
    var key, results;
    results = [];
    for (key in fold) {
      if (key.slice(0, prefix.length) === prefix) {
        results.push(key);
      }
    }
    return results;
  };
  filter.keysEndingWith = function(fold, suffix) {
    var key, results;
    results = [];
    for (key in fold) {
      if (key.slice(-suffix.length) === suffix) {
        results.push(key);
      }
    }
    return results;
  };
  filter.remapField = function(fold, field, old2new) {
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
      fold[key] = (function() {
        var len2, m, results;
        results = [];
        for (m = 0, len2 = new2old.length; m < len2; m++) {
          old = new2old[m];
          results.push(fold[key][old]);
        }
        return results;
      })();
    }
    ref1 = filter.keysEndingWith(fold, "_" + field);
    for (m = 0, len2 = ref1.length; m < len2; m++) {
      key = ref1[m];
      fold[key] = (function() {
        var len3, n, ref2, results;
        ref2 = fold[key];
        results = [];
        for (n = 0, len3 = ref2.length; n < len3; n++) {
          array = ref2[n];
          results.push((function() {
            var len4, o, results1;
            results1 = [];
            for (o = 0, len4 = array.length; o < len4; o++) {
              old = array[o];
              results1.push(old2new[old]);
            }
            return results1;
          })());
        }
        return results;
      })();
    }
    return fold;
  };
  filter.remapFieldSubset = function(fold, field, keep) {
    var id, old2new, value;
    id = 0;
    old2new = (function() {
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
    })();
    filter.remapField(fold, field, old2new);
    return old2new;
  };
  filter.numType = function(fold, type) {
    var counts, key, value;
    counts = (function() {
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
    })();
    if (!counts.length) {
      counts = (function() {
        var k, len, ref, results;
        ref = filter.keysEndingWith(fold, "_" + type);
        results = [];
        for (k = 0, len = ref.length; k < len; k++) {
          key = ref[k];
          results.push(1 + Math.max.apply(Math, fold[key]));
        }
        return results;
      })();
    }
    if (counts.length) {
      return Math.max.apply(Math, counts);
    } else {
      return 0;
    }
  };
  filter.numVertices = function(fold) {
    return filter.numType(fold, 'vertices');
  };
  filter.numEdges = function(fold) {
    return filter.numType(fold, 'edges');
  };
  filter.numFaces = function(fold) {
    return filter.numType(fold, 'faces');
  };
  filter.removeDuplicateEdges_vertices = function(fold) {
    var edge, id, key, old2new, seen, v, w;
    seen = {};
    id = 0;
    old2new = (function() {
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
    })();
    filter.remapField(fold, 'edges', old2new);
    return old2new;
  };
  filter.edges_verticesIncident = function(e1, e2) {
    var k, len, v;
    for (k = 0, len = e1.length; k < len; k++) {
      v = e1[k];
      if (indexOf.call(e2, v) >= 0) {
        return v;
      }
    }
    return null;
  };
  var RepeatedPointsDS = (function() {
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
    RepeatedPointsDS.prototype.lookup = function(coord) {
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
    RepeatedPointsDS.prototype.key = function(coord) {
      var key, x, xr, y, yr;
      x = coord[0], y = coord[1];
      xr = Math.round(x / this.epsilon);
      yr = Math.round(y / this.epsilon);
      return key = xr + "," + yr;
    };
    RepeatedPointsDS.prototype.insert = function(coord) {
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
  })();
  filter.collapseNearbyVertices = function(fold, epsilon) {
    var coords, old2new, vertices;
    vertices = new RepeatedPointsDS([], epsilon);
    old2new = (function() {
      var k, len, ref, results;
      ref = fold.vertices_coords;
      results = [];
      for (k = 0, len = ref.length; k < len; k++) {
        coords = ref[k];
        results.push(vertices.insert(coords));
      }
      return results;
    })();
    return filter.remapField(fold, 'vertices', old2new);
  };
  filter.maybeAddVertex = function(fold, coords, epsilon) {
    var i;
    i = geom.closestIndex(coords, fold.vertices_coords);
    if ((i != null) && epsilon >= geom.dist(coords, fold.vertices_coords[i])) {
      return i;
    } else {
      return fold.vertices_coords.push(coords) - 1;
    }
  };
  filter.addVertexLike = function(fold, oldVertexIndex) {
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
  filter.addEdgeLike = function(fold, oldEdgeIndex, v1, v2) {
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
  filter.addVertexAndSubdivide = function(fold, coords, epsilon) {
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
        s = (function() {
          var l, len1, results;
          results = [];
          for (l = 0, len1 = e.length; l < len1; l++) {
            u = e[l];
            results.push(fold.vertices_coords[u]);
          }
          return results;
        })();
        if (geom.pointStrictlyInSegment(coords, s)) {
          iNew = filter.addEdgeLike(fold, i, v, e[1]);
          changedEdges.push(i, iNew);
          e[1] = v;
        }
      }
    }
    return [v, changedEdges];
  };
  filter.removeLoopEdges = function(fold) {
    var edge;
    return filter.remapFieldSubset(fold, 'edges', (function() {
      var k, len, ref, results;
      ref = fold.edges_vertices;
      results = [];
      for (k = 0, len = ref.length; k < len; k++) {
        edge = ref[k];
        results.push(edge[0] !== edge[1]);
      }
      return results;
    })());
  };
  filter.subdivideCrossingEdges_vertices = function(fold, epsilon, involvingEdgesFrom) {
    var addEdge, changedEdges, cross, crossI, e, e1, e2, i, i1, i2, k, l, len, len1, len2, len3, m, n, old2new, p, ref, ref1, ref2, ref3, s, s1, s2, u, v, vertices;
    changedEdges = [[], []];
    addEdge = function(v1, v2, oldEdgeIndex, which) {
      var eNew;
      eNew = filter.addEdgeLike(fold, oldEdgeIndex, v1, v2);
      return changedEdges[which].push(oldEdgeIndex, eNew);
    };
    i = involvingEdgesFrom != null ? involvingEdgesFrom : 0;
    while (i < fold.edges_vertices.length) {
      e = fold.edges_vertices[i];
      s = (function() {
        var k, len, results;
        results = [];
        for (k = 0, len = e.length; k < len; k++) {
          u = e[k];
          results.push(fold.vertices_coords[u]);
        }
        return results;
      })();
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
      s1 = (function() {
        var l, len1, results;
        results = [];
        for (l = 0, len1 = e1.length; l < len1; l++) {
          v = e1[l];
          results.push(fold.vertices_coords[v]);
        }
        return results;
      })();
      ref1 = fold.edges_vertices.slice(0, i1);
      for (i2 = l = 0, len1 = ref1.length; l < len1; i2 = ++l) {
        e2 = ref1[i2];
        s2 = (function() {
          var len2, m, results;
          results = [];
          for (m = 0, len2 = e2.length; m < len2; m++) {
            v = e2[m];
            results.push(fold.vertices_coords[v]);
          }
          return results;
        })();
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
      changedEdges[i] = (function() {
        var len3, n, ref3, results;
        ref3 = changedEdges[i];
        results = [];
        for (n = 0, len3 = ref3.length; n < len3; n++) {
          e = ref3[n];
          results.push(old2new[e]);
        }
        return results;
      })();
    }
    old2new = filter.removeLoopEdges(fold);
    ref3 = [0, 1];
    for (n = 0, len3 = ref3.length; n < len3; n++) {
      i = ref3[n];
      changedEdges[i] = (function() {
        var len4, o, ref4, results;
        ref4 = changedEdges[i];
        results = [];
        for (o = 0, len4 = ref4.length; o < len4; o++) {
          e = ref4[o];
          results.push(old2new[e]);
        }
        return results;
      })();
    }
    if (involvingEdgesFrom != null) {
      return changedEdges;
    } else {
      return changedEdges[0].concat(changedEdges[1]);
    }
  };
  filter.addEdgeAndSubdivide = function(fold, v1, v2, epsilon) {
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
      if ((e[0] === v1 && e[1] === v2) || (e[0] === v2 && e[1] === v1)) {
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
  filter.cutEdges = function(fold, es) {
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
  filter.edges_vertices_to_vertices_vertices = function(fold) {
    var edge, k, len, numVertices, ref, v, vertices_vertices, w;
    numVertices = filter.numVertices(fold);
    vertices_vertices = (function() {
      var k, ref, results;
      results = [];
      for (v = k = 0, ref = numVertices; 0 <= ref ? k < ref : k > ref; v = 0 <= ref ? ++k : --k) {
        results.push([]);
      }
      return results;
    })();
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
    modulo$1 = function(a, b) { return (+a % (b = +b) + b) % b; },
    hasProp = {}.hasOwnProperty;
  convert.edges_vertices_to_vertices_vertices_unsorted = function(fold) {
    fold.vertices_vertices = filter.edges_vertices_to_vertices_vertices(fold);
    return fold;
  };
  convert.edges_vertices_to_vertices_vertices_sorted = function(fold) {
    convert.edges_vertices_to_vertices_vertices_unsorted(fold);
    return convert.sort_vertices_vertices(fold);
  };
  convert.edges_vertices_to_vertices_edges_sorted = function(fold) {
    convert.edges_vertices_to_vertices_vertices_sorted(fold);
    return convert.vertices_vertices_to_vertices_edges(fold);
  };
  convert.sort_vertices_vertices = function(fold) {
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
      geom.sortByAngle(neighbors, v, function(x) {
        return fold.vertices_coords[x];
      });
    }
    return fold;
  };
  convert.vertices_vertices_to_faces_vertices = function(fold) {
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
    ref1 = (function() {
      var results;
      results = [];
      for (key in next) {
        results.push(key);
      }
      return results;
    })();
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
      if ((w != null) && geom.polygonOrientation((function() {
        var len3, m, results;
        results = [];
        for (m = 0, len3 = face.length; m < len3; m++) {
          x = face[m];
          results.push(fold.vertices_coords[x]);
        }
        return results;
      })()) > 0) {
        fold.faces_vertices.push(face);
      }
    }
    return fold;
  };
  convert.vertices_edges_to_faces_vertices_edges = function(fold) {
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
        if ((e2 != null) && geom.polygonOrientation((function() {
          var len4, n, results;
          results = [];
          for (n = 0, len4 = vertices.length; n < len4; n++) {
            x = vertices[n];
            results.push(fold.vertices_coords[x]);
          }
          return results;
        })()) > 0) {
          fold.faces_vertices.push(vertices);
          fold.faces_edges.push(edges);
        }
      }
    }
    return fold;
  };
  convert.edges_vertices_to_faces_vertices = function(fold) {
    convert.edges_vertices_to_vertices_vertices_sorted(fold);
    return convert.vertices_vertices_to_faces_vertices(fold);
  };
  convert.edges_vertices_to_faces_vertices_edges = function(fold) {
    convert.edges_vertices_to_vertices_edges_sorted(fold);
    return convert.vertices_edges_to_faces_vertices_edges(fold);
  };
  convert.vertices_vertices_to_vertices_edges = function(fold) {
    var edge, edgeMap, i, j, len, ref, ref1, v1, v2, vertex, vertices;
    edgeMap = {};
    ref = fold.edges_vertices;
    for (edge = j = 0, len = ref.length; j < len; edge = ++j) {
      ref1 = ref[edge], v1 = ref1[0], v2 = ref1[1];
      edgeMap[v1 + "," + v2] = edge;
      edgeMap[v2 + "," + v1] = edge;
    }
    return fold.vertices_edges = (function() {
      var k, len1, ref2, results;
      ref2 = fold.vertices_vertices;
      results = [];
      for (vertex = k = 0, len1 = ref2.length; k < len1; vertex = ++k) {
        vertices = ref2[vertex];
        results.push((function() {
          var l, ref3, results1;
          results1 = [];
          for (i = l = 0, ref3 = vertices.length; 0 <= ref3 ? l < ref3 : l > ref3; i = 0 <= ref3 ? ++l : --l) {
            results1.push(edgeMap[vertex + "," + vertices[i]]);
          }
          return results1;
        })());
      }
      return results;
    })();
  };
  convert.faces_vertices_to_faces_edges = function(fold) {
    var edge, edgeMap, face, i, j, len, ref, ref1, v1, v2, vertices;
    edgeMap = {};
    ref = fold.edges_vertices;
    for (edge = j = 0, len = ref.length; j < len; edge = ++j) {
      ref1 = ref[edge], v1 = ref1[0], v2 = ref1[1];
      edgeMap[v1 + "," + v2] = edge;
      edgeMap[v2 + "," + v1] = edge;
    }
    return fold.faces_edges = (function() {
      var k, len1, ref2, results;
      ref2 = fold.faces_vertices;
      results = [];
      for (face = k = 0, len1 = ref2.length; k < len1; face = ++k) {
        vertices = ref2[face];
        results.push((function() {
          var l, ref3, results1;
          results1 = [];
          for (i = l = 0, ref3 = vertices.length; 0 <= ref3 ? l < ref3 : l > ref3; i = 0 <= ref3 ? ++l : --l) {
            results1.push(edgeMap[vertices[i] + "," + vertices[(i + 1) % vertices.length]]);
          }
          return results1;
        })());
      }
      return results;
    })();
  };
  convert.faces_vertices_to_edges = function(mesh) {
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
      mesh.faces_edges.push((function() {
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
      })());
    }
    return mesh;
  };
  convert.deepCopy = function(fold) {
    var copy, item, j, key, len, ref, results, value;
    if ((ref = typeof fold) === 'number' || ref === 'string' || ref === 'boolean') {
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
  convert.toJSON = function(fold) {
    var key, obj, value;
    return "{\n" + ((function() {
      var results;
      results = [];
      var keys = Object.keys(fold);
      for(var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
        key = keys[keyIndex];
        value = fold[key];
        results.push(("  " + (JSON.stringify(key)) + ": ") + (Array.isArray(value) ? "[\n" + ((function() {
          var j, len, results1;
          results1 = [];
          for (j = 0, len = value.length; j < len; j++) {
            obj = value[j];
            results1.push("    " + (JSON.stringify(obj)));
          }
          return results1;
        })()).join(',\n') + "\n  ]" : JSON.stringify(value)));
      }
      return results;
    })()).join(',\n') + "\n}\n";
  };
  convert.extensions = {};
  convert.converters = {};
  convert.getConverter = function(fromExt, toExt) {
    if (fromExt === toExt) {
      return function(x) {
        return x;
      };
    } else {
      return convert.converters["" + fromExt + toExt];
    }
  };
  convert.setConverter = function(fromExt, toExt, converter) {
    convert.extensions[fromExt] = true;
    convert.extensions[toExt] = true;
    return convert.converters["" + fromExt + toExt] = converter;
  };
  convert.convertFromTo = function(data, fromExt, toExt) {
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
  convert.convertFrom = function(data, fromExt) {
    return convert.convertFromTo(data, fromExt, '.fold');
  };
  convert.convertTo = function(data, toExt) {
    return convert.convertFromTo(data, '.fold', toExt);
  };

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
  const svg_to_fold = function (svg) {
    const pre_frag = emptyFOLD();
    const v0 = pre_frag.vertices_coords.length;
    const segments = Segmentize(svg);
    pre_frag.vertices_coords = segments
      .map(s => [[s[0], s[1]], [s[2], s[3]]])
      .reduce((a, b) => a.concat(b), pre_frag.vertices_coords);
    pre_frag.edges_vertices = segments.map((_, i) => [v0 + i * 2, v0 + i * 2 + 1]);
    pre_frag.edges_assignment = segments.map(l => getSegmentAssignment(l));
    const graph = fragment(pre_frag);
    convert.edges_vertices_to_vertices_vertices_sorted(graph);
    convert.vertices_vertices_to_faces_vertices(graph);
    convert.faces_vertices_to_faces_edges(graph);
    graph.edges_foldAngle = graph.edges_assignment.map(a => ea_to_fa(a));
    return graph;
  };

  const SVGtoFOLD = function (input, options) {
    if (typeof input === "string") {
      const svg = (new win.DOMParser())
        .parseFromString(input, "text/xml").documentElement;
      return svg_to_fold(svg, options);
    }
    return svg_to_fold(input, options);
  };
  SVGtoFOLD.core = {
    segmentize: () => { },
    fragment,
  };

  return SVGtoFOLD;

})));
