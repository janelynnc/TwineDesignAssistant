 module.exports = (story) => {
    var passages = story.passages;
    var tokens = [];
    var count = 0;

    //Parse the script in each passage and turn the into nodes
    passages.forEach(passage => {
        var script = passage.text;
        passage.tokens = []
        //This pattern matchs any opening and closing tags for html, links, or a macro
        //For a more detailed explanation and visualization visit
        //regexr.com/5bjtm
        var patterns = new RegExp(/\<.*?\>|\<\/.+\>|\[\[|\]\]|\([\w]*:|\)|\(|\[|\]/g) 
        //Split the script into an array of opening and closing tags this helps us deal with html tags
        //where we have to read by word and not by character
        const matches = script.matchAll(patterns);
        const lookupTags = [
            {open:new RegExp(/\<\w*?\>/),close:new RegExp(/\<\/.+\>/),type:"Html"},
            {open:new RegExp(/\<\w*/),close:new RegExp(/\\>/),type:"Html"},
            {open:new RegExp(/\[\[/),close:new RegExp(/\]\]/),type:"PassageLink"},
            {open:new RegExp(/\([\w]*:/),close:new RegExp(/\)/),type:"Macro"},
            {open:new RegExp(/\[/),close:new RegExp(/\]/),type:"Body"}

        ];
        var previousEnd = 0;
        var end = 0;
        var currentPattern = [];
        for (const match of matches) {
            //console.log(`Found ${match[0]} start=${match.index} end=${match.index + match[0].length}.`);
            //Check if the match is has something other than whitespace
            if(match[0].replace(/[\n\r\s]+/g, '').length>0){
                for(const tag of lookupTags){
                    if(tag.open.test(match[0])){
                        var patternEntry = {
                            type:tag.type,
                            close:tag.close,
                            start:match.index,
                            index: count
                        }
                        count++;
                        currentPattern.push(patternEntry);
                        break;
                    }else if(currentPattern.length>0 && currentPattern[currentPattern.length-1].close.test(match[0])){
                        end = match.index + match[0].length;
                        var token;
                        token = currentPattern.pop(); 
                        if(token.type == "Body"){
                            end++;
                        }
                        var parent = null;
                        if(currentPattern.length>0){
                            parent = currentPattern[currentPattern.length-1].index
                        }
                        var content = null;
                        var contentParent = parent;
                        if(token.start-previousEnd>1 && currentPattern.length==0){
                            content = script.substring(previousEnd+1,token.start);
                        }else if(currentPattern.length>0){
                            if(token.start - currentPattern[currentPattern.length-1].start > 0 && token.start-previousEnd>1){
                                var contentStart = currentPattern[currentPattern.length-1].start+1;
                                if(token.type == "Body"){
                                    contentStart++;
                                }
                                content = script.substring(contentStart,token.start-1);
                            }
                        }else if(end-previousEnd>0 && passage.tokens.length>0 && passage.tokens[passage.tokens.length-1].parent == token.index){
                            content = script.substring(previousEnd+1,end -1);
                            contentParent = token.index;
                        }
                        if(content != null){
                            passage.tokens.push({
                                script: content, 
                                type: "Content",
                                depth: currentPattern.length,
                                index: `c${token.index}`,
                                parent:contentParent
                            });
                        }
                        passage.tokens.push({
                            script: script.substring(token.start,end), 
                            type: token.type,
                            depth: currentPattern.length,
                            index: token.index,
                            parent:parent
                        });
                        
                        
                        previousEnd = end;
                        break;
                    }

                }
            }
        }

        lastToken = script.substring(end,script.length-1);
        if(end<script.length-1 && lastToken.replace(/\s/g, '').length>0){
            passage.tokens.push({
                script: lastToken, 
                type: "Content",
                depth: currentPattern.length,
                index: `c${count}`
            });
            count++
        }

        passage.tokens = passage.tokens.filter(token => token.script.trim() != '');
        //Next we'll take these tokens and turn them in passages
        tokens.push({
            "id": passage.id,
            "passage":passage.name,
            "tokens": passage.tokens
        })
    })

    return tokens;
};