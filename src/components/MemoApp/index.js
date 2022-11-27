import { useContext } from 'react';
import { Space, Button } from 'antd';
import Memo from '../Memo';
import { MemoContext } from '../../context';

const INDEX_SEPERATOR = "-";
const MemoApp = () => {
    const memoList = useContext(MemoContext);
    
    const renderMemoItems = (mData, idx) => {
        let l = mData.length;
        let items = [];
        for(let i = 0; i < l; i++){
            let item = mData[i];
            let _idx;
            if(idx === null){
                _idx = `${i}`;
            }else {
                _idx = `${idx}-${i}`;
            }
            let depth = 0;
            if(_idx){
                depth = _idx.split(INDEX_SEPERATOR).length;
                depth = depth > -1 ? depth - 1 : depth;
            }
            items.push(
                <Memo data={item} depth={depth} index={_idx}  key={item.id} id={item.id} {...memoList} />
            )
            if(item.children.length > 0){
                let childItems = renderMemoItems(item.children, _idx);
                childItems.forEach(element => {
                    items.push(element);
                });
            }
        }
        return items;
    }
    return (
        <div className='memo-parent'>
            <Space>
                <Button onClick={memoList.addMemo}>+ Memo</Button>
            </Space>
            {renderMemoItems(memoList.memo, null)}
        </div>
    )
}

export default MemoApp;