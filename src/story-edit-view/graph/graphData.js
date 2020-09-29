//Finds the most recent non-link node added to the graph
//The stack here represents the previous nodes we've added to the graph
//that belong to the current passage. The last node on the stack is the
//most recent node to be added
function findValidRecentNode(stack,node){
    if(stack.length == 0){
        return null;
    }
    //To find the most recent valid node we move backwards through the stack
    for(var i = stack.length-1; i>=0; i--){
        //If the node doesn't share the same parent skip it
        if(stack[i].parent != node.parent){
            continue;
        }
        //A valid node is any node thats not a passagelink or conditional
        if(stack[i].type != 'passagelink' && stack[i].type != 'conditional'){
            return stack[i];
        }
    }
    return null;
}

//PassageNodes display info about the passage and is always the first (or root)
//node for all the nodes in a passage.
//This is the only node thats does not come from the story's script.
function createPassageNode(graph,target){
    var passageNode = {
        "name":target.passage,
        "id": target.id,
        "type": "Passage",
        "index": target.id
    }

    var targetNode = passageNode;
    //Try to find the passage node in the graph first
    var foundNodeAt = graph.nodes.findIndex((elem) => elem == passageNode);
    //If we can't find it return the one we just created
    if(foundNodeAt > -1){
        targetNode = graph.nodes[foundNodeAt];
    }else{ //Otherwise we add the node to the graph, and start the stack for this passage
        graph.nodes.push(passageNode);
        //The stack will hold all the nodes from a passage in the order they're added
        //The passageNode will always be the first
        target.stack = [passageNode];
    }
    return targetNode;
}

//This function set up edges (arrows) from a parent to the current node
function setParent(graph,parent,node){
    //If there isn't and existing edge list make one. 
    if(!graph.edges.has(parent)){
        graph.edges.set(parent,new Set([node]));
    }else{ //Otherwise add the node to the parent's edge list
        //For macros nested in a body, the node should be linked to the the previous child 
        if(parent.type == "body"){
            var children = graph.edges.get(parent)
            for(child of children.values())
            {
                if(child.parent == parent){
                    parent = child;
                    break;
                }
            };
        }
        graph.edges.get(parent).add(node);
    }
}

//This is the main function and what we export. Aka graphData()
module.exports = (passages, story) => {
    //Find the first passage of the story and create a list of passage to process
    var firstPassage = passages.find((passage) => passage.id == story.startPassage);
    var passagesToProcess = [firstPassage];
    
    //Note mape entries are ordered by insertion order i.e first key added will be the first entry in the map
    //Maps are like dictionarys.
    //The graph object represent the abstraction layer graphs as a list of all nodes and an adjacency list
    var graph = {
        "nodes": [],
        "edges": new Map() //Edges will be represented as dictionary entries. The key will be the parent node.
                           //The value will be a list of all child nodes. So each entry represent all the (edges) arrows
                           //that come out of a node.
    }
    //We'll use visited to keep track of passage we've already visited
    //This will prevent us from getting trapped in cycles
    var visited = new Map();
    
    //To get the process start we have to first create a passage node and add it to the graph
    //This passage node will act as the root of our graph
    graph.nodes.push(createPassageNode(graph,firstPassage));
    //While there are still passages to process
    //Each loop will take out one passage from the list to process
    //Passagelinks will add new passages to proocess
    //By the end of this we should have explored every reachable passage
    while(passagesToProcess.length>0){
        // Take a passage out of passagesToProcess
        // We will loop through all the nodes in this passage
        var currentPassage = passagesToProcess.pop() 
        // Loop through all the nodes in this passage       
        for(node of currentPassage.nodes){
            // Try to find the parent for this current node
            var parent = currentPassage.nodes.find((entry)=> entry.index == node.parent);
            //If we don't have a parent then this node picks the most recent valid node 
            // as the parent.
            if(parent==null){
                parent = findValidRecentNode(currentPassage.stack,node,currentPassage.nodes);
            }

            //Add this node to it's parent's edgelist 
            setParent(graph,parent,node);

            //These two special node types will add new passages to process           
            if(node.type == 'passagelink' || node.type == 'link-goto'){
                try{
                    //Try to find the destination of this link in the list of all passages
                    var target = passages.find((entry) => entry.passage == node.target);
                    //Attempt to create a passagenode. Passagenodes is always the first node to appear
                    //before the rest of the nodes in a passage. 
                    var targetNode = createPassageNode(graph,target);
                    if(!graph.edges.has(node)){
                        graph.edges.set(node,[targetNode]);
                    }else{
                        graph.edges.get(node).add(targetNode);
                    }
                    
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
            //When we're done processing this node add to the story wide list of graph nodes
            //Also add it to the end of the stack. (The stack holds all the nodes from a passage that have
            //been added to the graph).
            graph.nodes.push(node);
            currentPassage.stack.push(node);
        }
    }
    return graph;
}