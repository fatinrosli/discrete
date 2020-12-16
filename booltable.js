
function run(query) {
  var table= getTable(parse(query));
  var html= "<table>";
  var results= getResultsFromTable(table);

  html += "<tr>";
  for (var x= 0; x < table[0].length; x++) {
    html += "<th>" + table[0][x] + "</th>";
  }
  html += "</tr>";

  for (var y= 1; y < table.length; y++) {
    html += "<tr>";
    for (var x= 0; x < table[0].length; x++) {
      if (table[y][x]) { html += "<td class='true'>T</td>"; }
      else  { html += "<td class='false'>F</td>"; }
    }
    html += "</tr>";
  }
  html += "</table>";

  html += "This proposition is " +
  (isTautology(results) ? "Tautology" : "Contingency" ) +  ", " +
  (isAbsurdity(results)? "Absurdity" : "inabsurdity") +  ", " +
  // (isContingency(results)? "Contingency" : "Not Contingency"+  ", " +
  (isValid(results) ? "valid" : "invalid") + " and " +
  (isConsistent(results) ? "consistent" : "inconsistent") + ".</p>";
    
  // (isComplete(results) ? "complete" : "incomplete") + " and " + 
  // (isAbsurdity(results)? "Absurdity" : "inabsurdity") +".</p>";
  return html;
}

function getQuery() {
  var query = window.location.search.substring(1);
  var each = query.split("&");
  for (var i= 0; i < each.length; i++) {
    var pair= each[i].split("=");
    if (pair[0] == "q") return decodeURIComponent(pair[1]);
  }
  return "";
}

// Return link string of the query
function getPermlink(query) {
  return window.location.pathname + "?q=" + encodeURIComponent(query);
}

function getTable(node) {
  var varList= getVarList(node);
  var worlds= enumerate(varList.length);
  var displayNodeList= arrangeNodes(getNodeList(node), varList);
  var result= [];
  var header= [];

  for (var i= 0; i < displayNodeList.length; i++) {
    header.push(show(displayNodeList[i]));
  }
  result.push(header);

  for (var i= 0; i < worlds.length; i++) {
    var line= [];
    var env= makeEnvironment(varList, worlds[i]);
    for (var j= 0; j < displayNodeList.length; j++) {
      line.push(apply(displayNodeList[j], env));
    }
    result.push(line);
  }
  return result;
}

// Pickup only last culumn (result of the node) from a table
function getResultsFromTable(table) {
  var resultIndex= table[0].length - 1;
  var results= [];
  for (var rows= 1; rows < table.length; rows++) {
    results.push(table[rows][resultIndex]);
  }
  return results;
}
//Tautology = results all true
function isTautology(results){
  for (var i= 0; i < results.length; i++) if (results[i] == 0) return false;
  return true;
}

//Absrudity = result all false
function isAbsurdity(results) {
  for (var i= 0; i < results.length; i++) if (results[i] == 1) return false;
  return true;
}
  // function isContingency(results) {
  //   for (var i= 0; i < results.length; i++) if (results[i] == 1 && results[i] == 0) return false;
  // return true;
  // }

// Return true if results is all true
function isValid(results) {
  for (var i= 0; i < results.length; i++) if (results[i] == 0) return false;
  return true;
}

// Return true if results include a true
function isConsistent(results) {
  for (var i= 0; i < results.length; i++) if (results[i] == 1) return true;
  return false;
}

// Return true if results have just one true
//function isComplete(results) {
 // var trues= 0;
 // for (var i= 0; i < results.length; i++) if (results[i] == 1) trues++;
  //return trues == 1;
//}

// ---------- Execute ----------

function makeEnvironment(varNames, values) {
  var env= new Object();
  for (var i= 0; i < varNames.length; i++) {
    env[varNames[i]]= values[i];
  }
  return env;
}

function apply(node, env) {
  if (typeof node == "number") return node;
  if (typeof node == "string") return env[node];

  if (node[0] == "+") {
    if (apply(node[1], env) == 1) return 1;
    if (apply(node[2], env) == 1) return 1;
    return 0;
  }
  if (node[0] == "*") {
    if (apply(node[1], env) == 0) return 0;
    if (apply(node[2], env) == 0) return 0;
    return 1;
  }
  if (node[0] == "=>") {
    return apply(["+", ["-", node[1]], node[2]], env);
  }
  if (node[0] == "=") {
    if (apply(node[1], env) == apply(node[2], env)) return 1;
    return 0;
  }
  if (node[0] == "-") {
    if (apply(node[1], env) == 0) return 1;
    return 0;
  }
  throw "error";
}

// Arrange node lists so that the output is easy to read.
function arrangeNodes(nodeList, varList) {
  var arranged= [];
  for (var i= 0; i < nodeList.length; i++) {
    if (!varList.includes(nodeList[i])) {
      arranged.push(nodeList[i]);
    }
  }
  return varList.concat(arranged.reverse());
}

Array.prototype.includes= function(object) {
  for (var i= 0; i < this.length; i++)
    if (this[i] == object) return true;
  return false;
};

// Return a list of unique variable names.
function getVarList(node) {
  var nodeList=	getNodeList(node);
  var dictionary= new Object();
  for (var i= 0; i < nodeList.length; i++) {
    if (typeof nodeList[i] == "string") {
      dictionary[nodeList[i]]= true;
    }
  }
  var list= [];
  for (key in dictionary) list.push(key);
  return list.sort();
}

// Return a list of all sub nodes
function getNodeList(node) {
  if (typeof node == "string" || typeof node == "number") {
    return [node];
  }
  if (node[0] == "+" || node[0] == "*" || node[0] == "=>" || node[0] == "=" ) {
    // This reverse makes it easy to read.
    return [node].concat(getNodeList(node[2]), getNodeList(node[1]));
  }
  if (node[0] == "-") {
    return [node].concat(getNodeList(node[1]));
  }
  throw	"unknown operator";
}

// Return a list with all possible n boolean values.
function enumerate(n) {
  if (n == 0) return [[]];
  var children= enumerate(n - 1);
  var falses= [];
  var trues= [];
  for (var i= 0; i < children.length; i++) {
    falses.push([0].concat(children[i]));
    trues.push([1].concat(children[i]));
  }
  return falses.concat(trues);
}

// ---------- Print ----------

function show(node) {
  if (typeof node == "string" || typeof node == "number") {
    return node.toString();
  }
  if (node[0] == "+" || node[0] == "*" || node[0] == "=>" || node[0] == "=" ) {
    return "(" + show(node[1]) + node[0] + show(node[2]) + ")";
  }
  if (node[0] == "-") {
    return "-" + show(node[1]);
  }
  throw	"unknown operator";
}

// ---------- Read ----------

// All parsers have same signature:
//
// argument     String
// return value [true, parsed tree, rest of source]
//           or [false] if failed

function parse(source) {
  var parsed= parseExpr(source.replace(/\s/g, ""));
  if (parsed[2] == "") return parsed[1];
  throw "parse error: " + parsed[2];
}

function parseLiteral(source) {
  if (source.charAt(0) == "0") return [true, 0, source.slice(1)];
  if (source.charAt(0) == "1") return [true, 1, source.slice(1)];
  return [false];
}

function parseOp(source) {
  if (source.charAt(0) == "*") return [true, "*", source.slice(1)];
  if (source.charAt(0) == "+") return [true, "+", source.slice(1)];
  if (/^=>/.exec(source)) return [true, "=>", source.slice(2)];
  if (source.charAt(0) == "=") return [true, "=", source.slice(1)];
  return [false];
}

function parseSymbol(source) {
  return parseRegExp(/^[^0-9!-?]+/)(source);
}

function parseParenthesis(source) {
  var result= seq(parseRegExp(/^\(/),
              seq(parseExpr,
                  parseRegExp(/^\)/)))(source);
  if (!result[0]) return [false];
  return [true, result[1][1][0], result[2]];
}
function parseNot(source) {
  var result= seq(parseRegExp(/^-/), parsePrim)(source);
  if (!result[0]) return [false];
  return [true, ["-", result[1][1]], result[2]];
}

function parsePrim(source) {
  return orElse(parseParenthesis,
         orElse(parseNot,
         orElse(parseLiteral,
                parseSymbol)))(source);
}

function parseExpr(source) {
  var result= seq(parsePrim,
             many(
              seq(parseOp,
		  parsePrim)))(source);
  if (!result[0]) return [false];
  var newTree= leftRecursion(result[1][0], result[1][1]);
  return [true, newTree, result[2]];
}

function leftRecursion(first, rest) {
  if (rest.length == 0) return first;
  var op= rest[0][0];
  var second= rest[0][1];
  return leftRecursion([op, first, second], rest.slice(1));
}

// Return a parser which accept with the regular expression.
function parseRegExp(regExp) {
  return function(source) {
    var match= regExp.exec(source);
    if (match) return [true, match[0], source.slice(match[0].length)];
    return [false];
  };
}

// ---------- Combinator Parser Library ----------

// Return a list of values using parser until it fails.
function many(parser) {
  return function(source) {
    var result= [];
    while (true) {
      var each= parser(source);
      if (!each[0]) return [true, result, source];
      result.push(each[1]);
      source= each[2];
    }
  };
}

// If parser1 fails then parse2.
function orElse(parser1, parser2) {
  return function(source) {
    var first= parser1(source);
    if (first[0]) return first;
    return parser2(source);
  };
}

// Do parse1 and parse2 and return list of results.
function seq(parser1, parser2) {
  return function(source) {
    var first= parser1(source);
    if (!first[0]) return [false];
    var second= parser2(first[2]);
    if (!second[0]) return [false];
    return [true, [first[1], second[1]], second[2]];
  };
}

