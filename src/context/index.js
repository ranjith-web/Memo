import React, { createContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

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

    const addChildToParent = parentItem => {
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
    
        newObj = Object.assign(defaultMemo, { index: combinedId, children: [], id: uuidv4(), text: `Text ${combinedId}` });
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

    const makeChild = (index, id) => {
        if(index === 0){
            return;
        }
        const memoCopy = [...memo];
        const { parentItem } = findPath(
            memoCopy,
            1,
            index.split("-"),
            false
        );

        addChildToParent(parentItem);
        deleteList(memoCopy, id);
        setMemo(memoCopy);
    }

    const deleteList = (lists, id) => {
        let found = false
        for(let i = 0; i < lists.length; i++){
            let item = lists[i];
            if(item.id === id){
                lists.splice(i, 1);
                found = true;
                break;
            }
            if(!found && item.children.length > 0){
                deleteList(item.children, id);
            }
        }
    }

    const memoData = {
        memo,
        addMemo,
        makeChild
    };
    return(
        <Provider value={memoData}>
            {props.children}
        </Provider>
    );
}