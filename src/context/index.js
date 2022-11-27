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
        id: ""
    }
    const [memo, setMemo] = useState([]);

    useEffect(() => {
        addMemo();
    }, [])

    const addMemo = () => {
        defaultMemo.id = uuidv4();
        setMemo(memo.concat(defaultMemo));
    }

    const makeChild = (index, id) => {
        if(index === 0){
            return;
        }
        const previous = index - 1;
        const currentNode = memo[index];
        memo[previous].children.push(currentNode);
        memo.splice(index, 1);
        setMemo([...memo]);
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