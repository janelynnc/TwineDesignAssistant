//Finds the most recent non-link node added to the graph
function findValidRecentNode(stack){
    if(stack.length == 0){
        return null;
    }
    for(var i = stack.length-1; i>=0; i--){
        if(stack[i].type != 'passagelink' ){
            return stack[i];
        }
    }
    return null;
}

function createPassageNode(graph,target){
    var passageNode = {
        "name":target.passage,
        "id": target.id,
        "type": "Passage",
    }
    var targetNode = passageNode;
    var foundNodeAt = graph.nodes.findIndex((elem) => elem == passageNode);
    if(foundNodeAt > -1){
        targetNode = graph.nodes[foundNodeAt];
    }else{
        graph.nodes.push(passageNode);
        target.stack = [passageNode];
    }
    return targetNode;
}

module.exports = (passages, story) => {
    var firstPassage = passages.find((passage) => passage.id == story.startPassage);
    var passagesToProcess = [firstPassage];
    
    //Note mape entries are ordered by insertion order i.e first key added will be the first entry in the map
    var graph = {
        "nodes": [],
        "edges": new Map()
    }
    //We'll use visited to keep track of passage we've already visited
    //This will prevent us from getting trapped in cycles
    var visited = new Map();
    
    graph.nodes.push(createPassageNode(graph,firstPassage));
    while(passagesToProcess.length>0){
        var currentPassage = passagesToProcess.pop() 
        var count = 0;
        for(node of currentPassage.nodes){
            var parent = findValidRecentNode(currentPassage.stack,count);
            if(parent != null){
                if(!graph.edges.has(parent)){
                    graph.edges.set(parent,new Set([node]));
                }else{
                    graph.edges.get(parent).add(node);
                }
            }

            if(node.type == 'passagelink' || node.type == 'link-goto'){
                try{
                    var target = passages.find((entry) => entry.passage == node.target);
                    var targetNode = createPassageNode(graph,target);
                    graph.edges.set(node,[targetNode]);
                    
                    //Only visit new passages to avoid infinite loops
                    if(!visited.has(target.id)){
                        passagesToProcess.push(target);
                        visited.set(target.id,target);
                    }

                }catch(e){
                    console.log(node.target)
                    console.log(e)
                }
            }
            node.index = graph.nodes.length.toString();
            graph.nodes.push(node);
            currentPassage.stack.push(node);
            count++;
        }
    }
    return graph;
}