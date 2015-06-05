'use strict';

var PARSE_TYPE = 'text/html';
var WRAPPER_NAME = 'wrapper';
var DOM_PARSER = new DOMParser();
var DO_CLONE_ATTRIBUTES = true;
var COMPONENT_DELIM = ':';
var ESCAPED_COLON = '\\\:';


var BEST_ROOT = document.createElement('best-root');
var UID_KEY = 'uid';
var TAG_KEY = 'tag';
var VALID_HTML_TAGS = [
    '<a>', '<abbr>', '<address>', '<area>', '<article>', '<aside>', '<audio>', '<b>',
    '<base>', '<bdi>', '<bdo>', '<blockquote>', '<body>', '<br>', '<button>', '<canvas>',
    '<caption>', '<cite>', '<code>', '<col>', '<colgroup>', '<command>', '<content>', '<data>',
    '<datalist>', '<dd>', '<del>', '<details>', '<dfn>', '<div>', '<dl>', '<dt>', '<element>',
    '<em>', '<embed>', '<fieldset>', '<figcaption>', '<figure>', '<font>', '<footer>', '<form>',
    '<head>', '<header>', '<hgroup>', '<hr>', '<html>', '<i>', '<iframe>', '<image>', '<img>',
    '<input>', '<ins>', '<kbd>', '<keygen>', '<label>', '<legend>', '<li>', '<link>', '<main>',
    '<map>', '<mark>', '<menu>', '<menuitem>', '<meta>', '<meter>', '<nav>', '<noframes>', '<noscript>',
    '<object>', '<ol>', '<optgroup>', '<option>', '<output>', '<p>', '<param>', '<picture>', '<pre>',
    '<progress>', '<q>', '<rp>', '<rt>', '<rtc>', '<ruby>', '<s>', '<samp>', '<script>', '<section>',
    '<select>', '<shadow>', '<small>', '<source>', '<span>', '<strong>', '<style>', '<sub>', '<summary>',
    '<sup>', '<table>', '<tbody>', '<td>', '<template>', '<textarea>', '<tfoot>', '<th>', '<thead>', '<time>',
    '<title>', '<tr>', '<track>', '<u>', '<ul>', '<var>', '<video>', '<wbr>'
];

function create(str) {
    return document.createElement(str);
}
 function addNode(childNode, parentNode) {
    parentNode.appendChild(childNode);
}

function getBaseNode() {
    return BEST_ROOT;
}
 function transferChildNodes(from, to) {
    while (from.childNodes[0]) {
        to.appendChild(from.childNodes[0]);
    }
}

function removeChildNodes(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function deleteNode(node) {
    removeChildNodes(node);
    node.parentNode.removeChild(node);
    node = null;
}

function parse(str) {
    var parsed = DOM_PARSER.parseFromString(str, PARSE_TYPE).body;
    var wrapper = create(WRAPPER_NAME);
    transferChildNodes(parsed, wrapper);
    return wrapper;
}

function clone(node) {
    return node.cloneNode(DO_CLONE_ATTRIBUTES);
}

function query(node, selector) {
    if (selector.indexOf(COMPONENT_DELIM) !== -1) {
        // Strings like 'foo:bar:baz' aren't supported by
        // querySelector/querySelectorAll unless the colon
        // is escaped using a backslash.
        selector = selector.split(COMPONENT_DELIM).join(ESCAPED_COLON);
    }
    return node.querySelectorAll(selector);
}

// Calls a callback on each target that matches a query. Passes the
// node to the callback function.
function eachNode(node, selector, cb) {
    var targets = query(node, selector);
    for (var i = 0; i < targets.length; i++) {
        cb(targets[i]);
    }
}

function attachAttributeFromJSON(node, json, key) {
    var info = JSON.stringify(json);
    node.setAttribute(key, info);
}

function getAttribute(node, attrName) {
    return node.getAttribute(attrName);
}

function queryAttribute(node, attributeName, value) {
    var selector;
    if (typeof value !== 'undefined') {
        selector = '[' + attributeName + '="' + value + '"]';
    }
    else {
        selector = '[' + attributeName + ']';
    }
    return query(node, selector);
}

function setTag(node, tag) {
    node.setAttribute(TAG_KEY, tag);
}

function getTag(node) {
    return node.getAttribute(TAG_KEY);
}

function setUID(node, uid) {
    node.setAttribute(UID_KEY, uid);
}

function getUID(node) {
    return node.getAttribute(UID_KEY);
}

function getParentUID(node) {
    return getUID(node.parentNode);
}

function getNodeByUID(root, uid) {
    return query(root, '[' + UID_KEY + '="' + uid + '"]')[0];
}

function removeNodeByUID(tree, uid) {
    var node = getNodeByUID(tree, uid);
    if (!node) {
        throw new Error('Node with UID `' + uid + '` does not exist in the given subtree.');
    }
    node.parentNode.removeChild(node);
}

// TODO --> optimize this function so that it doesn't always
// traverse every node;
function isDescendant(desendant, progenitor) {
    var result = false;
    eachNode(progenitor, '*', function(node){
        if (node === desendant) {
            result = true;
        }
    });
    return result;
}

function stripHTMLElements(domNode) {
    var htmlElements = [];
    var child;
    var tag;
    var nodesToProcess = domNode.children.length;
    var processCount = 0;
    var childIndex = 0;
    while (processCount < nodesToProcess) {
        child = domNode.children[childIndex];
        tag = '<' + child.tagName.toLowerCase() + '>';

        if (VALID_HTML_TAGS.indexOf(tag) !== -1) {
            htmlElements.push(domNode.removeChild(child));
        }
        else {
            childIndex++;
        }
        processCount++;
    }
    return htmlElements;
}

module.exports = {
    addNode: addNode,
    attachAttributeFromJSON: attachAttributeFromJSON,
    clone: clone,
    create: create,
    deleteNode: deleteNode,
    eachNode: eachNode,
    getAttribute: getAttribute,
    getBaseNode: getBaseNode,
    getNodeByUID: getNodeByUID,
    getParentUID: getParentUID,
    getTag: getTag,
    getUID: getUID,
    isDescendant: isDescendant,
    parse: parse,
    query: query,
    queryAttribute: queryAttribute,
    removeChildNodes: removeChildNodes,
    removeNodeByUID: removeNodeByUID,
    setTag: setTag,
    setUID: setUID,
    stripHTMLElements: stripHTMLElements,
    transferChildNodes: transferChildNodes
};
