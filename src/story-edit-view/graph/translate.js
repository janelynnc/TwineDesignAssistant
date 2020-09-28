const linkParser = require('./link-parser');
const getOnlyArg = new RegExp(/(?<=:[\s]+)(.*)(?=\)$)/g);
//So we're going need a modifed version of solving 
// the balanced parenthesis problem https://medium.com/@paulrohan/parenthesis-matching-problem-in-javascript-the-hacking-school-hyd-7d7708278911
// Also this problem is pretty similiar to what we need https://www.geeksforgeeks.org/find-maximum-depth-nested-parenthesis-string/
function extractNestedChildren(script){
   //The stack wiil hold the opening tags
   const stack = []
    //This pattern matchs any opening and closing tags for html, links, or a macro
    //For a more detailed explanation and visualization visit
    //regexr.com/5bjtm
    var patterns = new RegExp(/\<.*?\>|\<\/.+\>|\[\[|\]\]|\([\w]*:|\)|\(|\[|\]/g) 
    //Split the script into an array of opening and closing tags this helps us deal with html tags
    //where we have to read by word and not by character
    const matches = script.matchAll(patterns);
    const lookupTags = [
        {open:new RegExp(/\<\w*?\>/),close:new RegExp(/\<\/.+\>/),type:"Html"},
        {open:new RegExp(/\[\[/),close:new RegExp(/\]\]/),type:"PassageLink"},
        {open:new RegExp(/\([\w]*:/),close:new RegExp(/\)/),type:"Macro"},
        {open:new RegExp(/\[/),close:new RegExp(/\]/),type:"Body"}
    ];
    for(const match of matches){
        //ignore whitespace
        if(match[0].replace(/\s/g, '').length<=0){
            continue;
        }

    }

}

function find(script,regex){
    var result  = script.match(regex);
    if(result!=null && result.length>0){
        return result[0]
    }
    return null;
}


module.exports = (tokens) => {
    var nodes = tokens;
    const htmlParser = new DOMParser();
    //Map each macro to a function that extracts all the important info
    //from that macro
    var managedMacros = new Map([
        ["mouseout-goto", function(script){
            var values = find(script,new RegExp(/(?<=:[\s]+)(.*)(?=\)$)/g))
            if(values != null){
                values = values.split(",");
            }else{
                return;
            }
            return {
                type:"passageLink",
                display: values[0],
                target: values[1],
                input: "mouseout"
            }
        }],
        ["mouseover-goto", function(script){
            var values = find(script,getOnlyArg)
            if(values != null){
                values = values.split(",");
            }else{
                return;
            }
            return {
                type:"passageLink",
                display: values[0],
                target: values[1],
                input: "mouseover"
            }
        }],
        ["click-goto", function(script){
            var values = find(script,getOnlyArg)
            if(values != null){
                values = values.split(",");
            }else{
                return;
            }
            return {
                type:"passageLink",
                display: values[0],
                target: values[1],
                input: "click"
            }
        }],
        ["mouseout-append", function(script){
            return {
                type:"link-append",
                target: find(script,getOnlyArg),
                input: "mouseout"
            }
        }],
        ["mouseout-replace", function(script){
            return {
                type:"link-replace",
                target: find(script,getOnlyArg),
                input: "mouseout"
            }
        }],
        ["show", function(script){
            return {
                type:"show",
                target: find(script,getOnlyArg),
            }
        }],
        ["live", function(script){
            return {
                type:"live",
                duration: find(script,getOnlyArg),
            }
        }],
        ["stop", function(_script){
            return {type: "stop"}
        }],
        ["event", function(script){
            return{
                type:"conditional",
                condition: "event",
                value: find(script,getOnlyArg)
            } 
        }],
        ["more", function(_script){
            return{
                type:"conditional",
                condition: "more"
            }
        }],
        ["unless", function(script){
            return{
                type:"conditional",
                condition: "unless "+ find(script,getOnlyArg)
            }
        }],
        ["else-if", function(script){
            return{
                type:"conditional",
                condition: "else-if "+ find(script,getOnlyArg)
            }
        }],
        ["else", function(_script){
            return{
                type:"conditional",
                condition: "else" 
            }
        }],
        ["if", function(script){
            return{
                type:"conditional",
                condition: "if "+ find(script,getOnlyArg)
            }
        }],
        ["prompt", function(script){
            var values = find(script,getOnlyArg)
            if(values != null){
                values = values.split(",");
            }
            return {
                type:"popup",
                display: values[0],
                value: values[1],
                input: "typing"
            }
        }],
        ["confirm", function(script){
            var values = find(script,getOnlyArg)
            if(values != null){
                values = values.split(",");
            }
            return {
                type:"popup",
                display: values[0],
                value: "boolean",
                input: "click"
            }
        }],
        ["alert", function(script){
            var values = find(script,getOnlyArg)
            if(values != null){
                values = values.split(",");
            }
            return {
                type:"popup",
                display: values[0],
                input: "click"
            }
        }],
        ["mouseout-prepend", function(script){
            return {
                type:"link-prepend",
                target: find(script,getOnlyArg),
                input: "mouseout"
            }
        }],
        ["mouseout-append", function(script){
            return {
                type:"link-append",
                target: find(script,getOnlyArg),
                input: "mouseout"
            }
        }],
        ["mouseout-replace", function(script){
            return {
                type:"link-replace",
                target: find(script,getOnlyArg),
                input: "mouseout"
            }
        }],
        ["mouseover-prepend", function(script){
            return {
                type:"link-prepend",
                target: find(script,getOnlyArg),
                input: "mouseover"
            }
        }],
        ["mouseover-append", function(script){
            return {
                type:"link-append",
                target: find(script,getOnlyArg),
                input: "mouseover"
            }
        }],
        ["mouseover-replace", function(script){
            return {
                type:"link-replace",
                target: find(script,getOnlyArg),
                input: "mouseover"
            }
        }],
        ["click-prepend", function(script){
            return {
                type:"link-prepend",
                target: find(script,getOnlyArg),
                input: "click"
            }
        }],
        ["click-append", function(script){
            return {
                type:"link-append",
                target: find(script,getOnlyArg),
                input: "click"
            }
        }],
        ["click-replace", function(script){
            return {
                type:"link-replace",
                target: find(script,getOnlyArg),
                input: "click"
            }
        }],
        ["move", function(script){
            var source = find(script,new RegExp(/(?<=:[\s]+)(.*)(?=\sinto)/g));
            var target = find(script,new RegExp(/(?<=into\s)(\S*)(?=\)$)/g));
            return {
                type:"move",
                source: source,
                target: target
            }
        }],
        ["put", function(script){
            var value = find(script,new RegExp(/(?<=:[\s]+)(.*)(?=\sinto)/g));
            var variable = find(script,new RegExp(/(?<=into\s)(\S*)(?=\)$)/g));
            return {
                type:"put",
                target: variable,
                value: value
            }
        }],
        ["set", function(script){
            var variable = find(script,new RegExp(/(?<=:[\s]+)(.*)(?=\sto)/g));
            var value = find(script,new RegExp(/(?<=to[\s]+)(\S*)(?=\)$)/g));
            return {
                type:"set",
                target: variable,
                value: value
            }
        }],
        ["font", function(script){
            var font = find(script,getOnlyArg);
            return {
                type:"font",
                value:font,
            }
        }],
        ["passagelink",function(script){ return linkParser(script);}]
    ]);
    //This pattern matchs name of a macro command for example, in (set:),
    //The word set would be matched
    var macroPattern = new RegExp(/(\w*)(?=:)/);
    var type,matchs;
    for(const passage of nodes){
        passage.nodes = [];
        for(const token of passage.tokens){
            var node;
            if(token.type == 'Macro'){
                matchs = macroPattern.exec(token.script);
                if(matchs){
                    type = matchs[0];
                }
                if(managedMacros.has(type)){
                    node = managedMacros.get(type)(token.script);
                }else{
                    //For most tokens the value is just its first arguement
                    node = {
                        "type": type,
                        "value": find(token.script,getOnlyArg),
                        "script": token.script
                    }
                }
            }else if(token.type == "Html"){
                const html = htmlParser.parseFromString(token.script, "text/html");
                console.log(html.body.firstElementChild.tagName)
                node = {
                    "type": "Html",
                    "tag": html.body.firstElementChild.tagName,
                    "classes": html.body.firstElementChild.classList,
                    "attributes": html.body.firstElementChild.attributes,
                    "innerText": html.body.firstElementChild.innerHTML
                }
            }else if(token.type == "PassageLink"){
                type = token.type;
                node = managedMacros.get(type.toLowerCase())(token.script);
            }else{
                node = {
                    "type": token.type.toLowerCase(),
                    "script": token.script
                }
            }
            node.index = token.index;
            node.parent = token.parent;
            if(node.type == "body"){
                for(var i = passage.nodes.length-1;i>=0;i--){
                    if(passage.nodes[i].parent == node.parent && passage.nodes[i].type == "conditional"){
                        node.parent = passage.nodes[i].index;
                        break;
                    }
                }
            }
            node.depth = token.depth;
            passage.nodes.push(node);
        }
        delete passage.tokens;
    }
    return nodes;
}