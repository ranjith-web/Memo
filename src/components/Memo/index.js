import React from 'react';
import { Input, Space } from 'antd';
import { Radio } from 'antd';
import Remove from "../Remove";
import './styles.scss';

const INDENT_SIZE = 25;

const Memo = ({ data, makeChild, depth, unMakeChild, deleteMemo }) => {
    const { index, id, text } = data;
    const marginLeft = `${depth * INDENT_SIZE}px`;

    const getParentIndex = (index) => {
        let _idx = index.split('-'),
            prevIndex = _idx[_idx.length - 1],
            c = prevIndex - 1;
        if(c > 0){
            _idx[_idx.length - 1] = c;
        }
        return _idx.join("-");
    }

    const onHandleKeyPress = (e) => {
        switch (e.which) {
            case 9:
                if (!e.shiftKey) {  // tab
                    e.preventDefault();
                    if (e.type === 'keydown') {
                        makeChild(getParentIndex(index), id, data);
                    }
                }else {  // shift+tab
                    e.preventDefault();
                    if (e.type === 'keydown') {
                        unMakeChild(index, id, data);
                    }
                    break;
                }
                break;
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
            removeItem={() => deleteMemo(id, index)}
        />
    )

    return (
        <div className='memo-item-content'>
            <Space direction="vertical" className='memo-antd-space'>
                <Input style={{
                    marginLeft
                }} 
                data-index={index} 
                addonBefore={
                    <Radio.Group name="radiogroup" defaultValue={1}>
                        <Radio value={1}></Radio>
                    </Radio.Group>
                } 
                onKeyDown={onHandleKeyPress} 
                addonAfter={renderDelIcon} 
                value={text} />
            </Space>
        </div>
    );
};
export default Memo;