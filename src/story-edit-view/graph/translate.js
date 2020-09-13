const linkParser = require('./link-parser');

module.exports = (tokens) => {
    var nodes = tokens;
    var managedMacros = new Map([
        ["link",function(script){
            var link = linkParser(script);
            return {
                "type": "link",
                "target": link.target,
                "display": link.display
            }
        }]
    ]);
    //This pattern matchs name of a macro command for example, in (set:),
    //The word set would be matched
    var macroPattern = new RegExp(/(\w*)(?=:)/);
    var htmlPattern = new RegExp(/^\S*/);
    var type,matchs;
    for(const passage of nodes){
        passage.nodes = [];
        for(const token of passage.tokens){
            var node;
            console.log(token)
            if(token.type == 'Macro'){
                matchs = macroPattern.exec(token.script);
                type = matchs || matchs[0];
                if(managedMacros.has(type)){
                    node = managedMacros.get(type)(token.script);
                }else{
                    node = {
                        "type": type,
                        "script": token.script
                    }
                }
            }else if(token.type == "Html"){
                matchs = htmlPattern.exec(token.script)
                type = matchs || matchs[0];
                node = {
                    "type": type,
                    "script": token.script
                }
            }else if(token.type == "Link"){
                type = token.type;
                node = managedMacros.get(type.toLowerCase())(token.script);
            }else{
                node = {
                    "type": "Content",
                    "script": token.script
                }
            }
            passage.nodes.push(node);
        }
        //delete passage.tokens
    }
    return nodes;
}