function findValidRecentNode(graph){
    if(graph.nodes.length == 0){
        return null;
    }
    for(var i = graph.nodes.length-1; i>=0; i--){
        if(graph.nodes[i].type != 'link'){
            return graph.nodes[i];
        }
    }
    return null;
}

module.exports = (passages, story) => {
    var firstPassage = passages.find((passage) => passage.id == story.startPassage);
    var passagesToProcess = [firstPassage];
    //Note mape entries are ordered by insertion order i.e first key added will be the first entry in the map
    var graph = {
        "nodes": [],
        "edges": new Map()
    }
    
    while(passagesToProcess.length>0){
        var currentPassage = passagesToProcess.pop()
        console.log(currentPassage);
        var passageNode = {
            "name":currentPassage.name,
            "id": currentPassage.id,
            "type": "Passage",
            "index": graph.nodes.length.toString(),
            "previous": currentPassage.previous
        }
        graph.nodes.push(passageNode);
        if(passageNode.previous){
            if(!graph.edges.has(passageNode.previous)){
                graph.edges.set(passageNode.previous,[passageNode]);
            }else{
                graph.edges.get(passageNode.previous).push(newPassageNode);
            }
        }

        for(node of currentPassage.nodes){
            var parent = findValidRecentNode(graph);
            if(parent != null){
                if(!graph.edges.has(parent)){
                    graph.edges.set(parent,[node]);
                }else{
                    graph.edges.get(parent).push(node);
                }
            }

            if(node.type == 'link'){
                var target = passages.find((entry) => entry.passage == node.target);
                target.previous = node;
                passagesToProcess.push(target);
            }
            node.index = graph.nodes.length.toString();
            graph.nodes.push(node);
        }
    }
    return graph;
}