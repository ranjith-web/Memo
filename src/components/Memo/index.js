import React from 'react';
import { Input, Space } from 'antd';
import Remove from "../Remove";
import './styles.scss';

const INDENT_SIZE = 25;

const Memo = ({ index, id, makeChild, depth }) => {
    const marginLeft = `${depth * INDENT_SIZE}px`;

    const onHandleKeyPress = (e) => {
        switch (e.which) {
            case 9:
                if (!e.shiftKey) {  // tab
                    e.preventDefault();
                    if (e.type === 'keydown') {
                        makeChild(Number(index), id);
                    }
                    break;
                }
            default:
                break;
        }
    }

    const renderDelIcon = (
        <Remove
            title="Remove parent and its children"
            className="memo-item-cross"
            dataTestId="todo-item-cross"
            listId={"listId"}
            itemId={"itemId"}
            removeItem={() => {}}
        />
    )

    return (
        <div className='memo-item-content'>
            <Space direction="vertical" className='memo-antd-space'>
                <Input style={{
                    marginLeft
                }} 
                data-index={index} 
                addonBefore="#" 
                onKeyDown={onHandleKeyPress} 
                addonAfter={renderDelIcon} 
                defaultValue="mysite" />
            </Space>
        </div>
    );
};
export default Memo;