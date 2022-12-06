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

    useEffect(() => {
        addMemo();
    }, [])

    const addMemo = () => {
        defaultMemo.id = uuidv4();
        defaultMemo.index = `${memo.length + 1}`;
        defaultMemo.text = `Text ${defaultMemo.index}`;
        setMemo(memo.concat(defaultMemo));
    }

    const overrideChildrens = (pIndexs, newObj) => {
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
                overrideChildrens(newObj.children[i].index, newObj.children[i]);
            }
        }
    }

    const overrideParentSubsequent = (parentItem, memoCopy) => {
        if(isEmpty(parentItem.parent)){
            let count = 0;
            while(count < memoCopy.length){
                let idx = count + 1;
                memoCopy[count].index = `${idx}`;
                memoCopy[count].text = `Text ${idx}`;
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
        overrideChildrens(parentItem.index, newObj);
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
        console.log("parentItem---->", parentItem);
        if(parentItem !== undefined){
            addChildToParent(parentItem, currentNode);
            removeOrMoveList(memoCopy, id);
            // update index value for all the subseuent of parent nodes
            overrideParentSubsequent(parentItem, memoCopy);
            setMemo(memoCopy);
        }
    }

    const removeOrMoveList = (lists, id, move = {}) => {
        let found = false;
        let isMoveEnable = move && move.hasOwnProperty('enable') && move.enable;
        for(let i = 0; i < lists.length; i++){
            let item = lists[i];
            if(item.id === id){
                if(isMoveEnable){
                    var sl = lists.slice(i, i+1);
                    lists.splice(i, 1);
                    let prevNodeIndex = move.parentNode[move.parentNode.length - 1].index || "";
                    let prevSplit = prevNodeIndex.split("-");
                    let lastIndex = prevSplit[prevSplit.length - 1];
                    let lastPrevIndex = Number(lastIndex);
                    if(prevSplit.length > 1){
                        lastPrevIndex = prevSplit[prevSplit.length - 2];
                        lastPrevIndex = Number(lastPrevIndex) - 1;
                    }

                    prevSplit.pop();
                    prevSplit.push(Number(lastIndex)+1);
                    let combinedIndex = prevSplit.join('-');
                    move.parentNode.splice(lastPrevIndex, 0, {...sl[0], index: combinedIndex, text: `Text ${combinedIndex}`})
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

    const unMakeChild = (id) => {
        const memoCopy = [...memo];
        
        removeOrMoveList(memoCopy, id, {enable: true});
        setMemo(memoCopy);
    }

    const memoData = {
        memo,
        addMemo,
        makeChild,
        unMakeChild
    };
    return(
        <Provider value={memoData}>
            {props.children}
        </Provider>
    );
}