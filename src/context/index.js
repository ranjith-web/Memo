import React, { createContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { isEmpty } from 'lodash';

export const MemoContext = createContext();

const { Provider } = MemoContext;

export const MemoProvider = (props) => {
    const defaultMemo = {
        parent: {},
        children: [],
        text: "",
        completed: false,
        focused: false,
        id: "",
        index: ""
    }

    const [memo, setMemo] = useState([]);

    const addMemo = () => {
        defaultMemo.id = uuidv4();
        defaultMemo.index = `${memo.length + 1}`;
        defaultMemo.text = `Text ${defaultMemo.index}`;
        setMemo(memo.concat(defaultMemo));
    }

    const overrideChildrens = (newObj) => {
        for(let i = 0; i < newObj.children.length > 0; i++){
            let pIndex = newObj.index.split("-");
            if(pIndex.length > 1){
                let cIndex = pIndex[pIndex.length - 1];
                pIndex.pop();
                cIndex = Number(cIndex) + 1; 
                pIndex.push(cIndex);
            } else {
                pIndex.push(1);
            }
            newObj.children[i].index = pIndex.join("-");
            newObj.children[i].text = `Text ${newObj.children[i].index}`;
            newObj.children[i].parent = {id: newObj.id};
        
            if(newObj.children[i].children.length > 0){
                overrideChildrens(newObj.children[i]);
            }
        }
    }

    const overrideChildrensV2 = (newObj) => {
        let pIndex = newObj.index.split("-");
        for(let i = 0; i < newObj.children.length > 0; i++){
            if(i === 0){
                pIndex.push(1);
            } else {
                let cIndex = pIndex[pIndex.length - 1];
                pIndex.pop();
                cIndex = Number(cIndex) + 1; 
                pIndex.push(cIndex);
            }
            newObj.children[i].index = pIndex.join("-");
            newObj.children[i].text = `Text ${newObj.children[i].index}`;
            newObj.children[i].parent = {id: newObj.id};
        
            if(newObj.children[i].children.length > 0){
                overrideChildrensV2(newObj.children[i]);
            }
        }
    }

    const overrideParentSubsequent = (parentItem, memoCopy, updateChildNodes) => {
        if(isEmpty(parentItem.parent)){
            let count = 0;
            while(count < memoCopy.length){
                let idx = count + 1;
                memoCopy[count].index = `${idx}`;
                memoCopy[count].text = `Text ${idx}`;
                if(updateChildNodes){
                    overrideChildrensV2(memoCopy[count]);                    
                }
                count++;
            }
        }
    }

    const addChildToParent = (parentItem, cNode) => {
        const numOfChildren = parentItem.children.length;
        let combinedId;
        let newObj;
    
        if (numOfChildren > 0) {
            let index;
            let currentLastNum = 1;
            let nextLastNum;
        
            for (let x = 0; x < parentItem.children.length; x++) {
                index = parentItem.children[x].index.split("-");
                nextLastNum = Number(index[index.length - 1]);
        
                if (currentLastNum !== nextLastNum) {
                    break;
                }
                currentLastNum++;
            }
        
            index.pop();
            index.push(currentLastNum);
            combinedId = index.join("-");
        } else {
            combinedId = parentItem.index + "-1";
        }
        newObj = { ...cNode, index: combinedId, id: uuidv4(), text: `Text ${combinedId}`, parent: {id: parentItem.id} };
        // update index value for all the subseuent of child nodes
        overrideChildrensV2(newObj);
        parentItem.children.push(newObj);
    };

    const findFirstItemIndex = (listItems, index) => {
        return listItems.findIndex(item => {
          return Number(index) === Number(item.index);
        });
    };
    
    const findSubsequentItemIndex = (parentItem, index, address) => {
        if (parentItem) {
            for (let x = 0; x < parentItem.children.length; x++) {
                const parentItemId = parentItem.children[x].index.split("-");
        
                if (index === parentItemId[address.length + 1]) {
                    address.push(x);
                    return parentItem.children[x];
                }
            }
        }
    };
    const findPath = (lists, listId, itemId, findItsParent) => {
        const firstItemAddress = findFirstItemIndex(lists, itemId[0]);

        itemId.shift();
        let parentItem = lists[firstItemAddress];
        const childAddress = [];
    
        while (findItsParent ? itemId.length > 1 : itemId.length > 0) {
            parentItem = findSubsequentItemIndex(
                parentItem,
                itemId[0],
                childAddress
            );
    
            itemId.shift();
        }
        return { parentItem, childAddress };
    };

    const makeChild = (index, id, currentNode) => {
        const memoCopy = [...memo];
        const { parentItem } = findPath(
            memoCopy,
            1,
            index.split("-"),
            false
        );
        if(parentItem.id === currentNode.id){
            return console.log("Invalid move");
        }
        if(parentItem !== undefined){
            addChildToParent(parentItem, currentNode);
            removeOrMoveList(memoCopy, id);
            // update index value for all the subseuent of parent nodes
            overrideParentSubsequent(parentItem, memoCopy);
            setMemo(memoCopy);
        }
    }
    //Function to decide tree to move or remove
    const removeOrMoveList = (lists, id, move = {}) => {
        let found = false;
        let isMoveEnable = move && move.hasOwnProperty('enable') && move.enable;
        for(let i = 0; i < lists.length; i++){
            let item = lists[i];
            if(item.id === id){
                if(isMoveEnable){
                    var sl = lists.slice(i, i+1);
                    lists.splice(i, 1);
                    let prevNodeIndex = move.parentNode[move.parentNode.length - 1].index || "",
                        prevSplit = prevNodeIndex.split("-"),
                        lastIndex = prevSplit[prevSplit.length - 1],
                        lastPrevIndex = Number(lastIndex);
                    if(prevSplit.length > 1){
                        lastPrevIndex = prevSplit[prevSplit.length - 2];
                        lastPrevIndex = Number(lastPrevIndex) - 1;
                    }

                    prevSplit.pop();
                    prevSplit.push(Number(lastIndex)+1);
                    let combinedIndex = prevSplit.join('-');
                    let newObj = {...sl[0], index: combinedIndex, text: `Text ${combinedIndex}`};
                    overrideChildrens(newObj);
                    move.parentNode.splice(lastPrevIndex, 0, newObj);
                }else {
                    lists.splice(i, 1);
                }
                found = true;
                break;
            }
            if(!found && item.children.length > 0){
                if(isMoveEnable){
                    move.parentNode = lists;
                } else {
                    move = {};
                }
                removeOrMoveList(item.children, id, move);
            }
        }
    }

    const onPathPush = (m, toPush, path, currentParent) => {
        let l = path.length;
        let node = m;
        //condition to go parent of parent node
        let goToPath = (count) => {
            let elem = path[count];
            let i = Number(elem);
            if(path.length === 1 && path[0] == '0'){
                toPush.parent = {};
                let pos = currentParent.index.split("-");
                pos = Number(pos[pos.length - 1]);
                node.splice(pos, 0, toPush);
                overrideParentSubsequent({}, node, true);
            } else {
                if(count === l - 1){
                    node[i - 1].children.push(toPush);
                    overrideChildrensV2(node[i - 1]);
                } else {
                    count++;
                    node = node[i-1].children;
                    goToPath(count);
                }
            }
        }
        goToPath(0);
    }

    const moveBackward = (m, pluckedNode, p, id) => {
        const spliceById = (item) => {
            let l = item.length;
            for(let i =0; i < l; i++){
                if(item[i].id === id){
                    item.splice(i, 1);
                    break;
                }else{
                    spliceById(item[i].children);
                }
            }
        }
        spliceById(p.children); // iterate deep and find id
        let path = p.index.split("-");
        if(path.length > 0){
            path.pop();
        }
        if(isEmpty(path)){
            path = ['0'];
        }
        onPathPush(m, pluckedNode, path, p);

        setMemo([...m]);
    }
    const unMakeChild = (index, id, toMoveback) => {
        const memoCopy = [...memo];
        const { parentItem } = findPath(
            memoCopy,
            1,
            index.split("-"),
            true
        );
        
        if(parentItem.id === toMoveback.id){
            return console.log("Not invalid move");
        }
        moveBackward(memoCopy, toMoveback, parentItem, id);
        setMemo(memoCopy);
    }

    /**
     * 
     * @param {*} o
     * const o = [{"id":1,"children":[{"id":3,"children":[]}]},{"id":2,"children":[]}] 
     * @param {*} id 
        id = d44491c3-7f7c-4a9c-a0c9-4cbeee4f6ba2
     * @returns updated memo;
     */
    const removeByIdFromTree = (o, id) => {
        return o.map ( item => { return {...item} }).filter ( item => {
            if ( 'children' in item ) {
                item.children = removeByIdFromTree ( item.children, id );
            }
            return item.id !== id;
        });
    }

    const deleteMemo = (childIdToRemove, index) => {
        const _m = removeByIdFromTree(memo, childIdToRemove);
        const memoCopy = [..._m];
        const { parentItem } = findPath(
            memoCopy,
            1,
            index.split("-"),
            true
        );
        overrideChildrensV2(parentItem);
        setMemo([..._m]);
    }

    const memoData = {
        memo,
        addMemo,
        makeChild,
        unMakeChild,
        deleteMemo
    };
    return(
        <Provider value={memoData}>
            {props.children}
        </Provider>
    );
}