/* eslint no-console:0, react/no-danger: 0 */
import { Component } from 'react';
import Tree from 'rc-tree';
import './FileTree.less';
import { NodeDragEventParams } from 'rc-tree/lib/contextTypes';
import { EventDataNode, FieldDataNode, Key } from 'rc-tree/lib/interface';

const STYLE = `
.rc-tree-child-tree {
  display: block;
}

.node-motion {
  transition: all .3s;
  overflow-y: hidden;
}
`;

type TreeDataType = FieldDataNode<{
  key: string;
  title: string;
  children?: TreeDataType[];
}>;

function getTreeData(): TreeDataType[] {
  // big-data: generateData(1000, 3, 2)
  return [
    {
      key: '0',
      title: 'node 0',
      children: [
        { key: '0-0', title: 'node 0-0' },
        { key: '0-1', title: 'node 0-1' },
        { key: '0-3', title: 'node 0-3' },
        { key: '0-8', title: 'node 0-8' },
        {
          key: '0-9',
          title: 'node 0-9',
          children: [
            { key: '0-9-0', title: 'node 0-9-0' },
            {
              key: '0-9-1',
              title: 'node 0-9-1',
              children: [
                { key: '0-9-1-0', title: 'node 0-9-1-0' },
                { key: '0-9-1-1', title: 'node 0-9-1-1' },
                { key: '0-9-1-2', title: 'node 0-9-1-2' },
                { key: '0-9-1-3', title: 'node 0-9-1-3' },
                { key: '0-9-1-4', title: 'node 0-9-1-4' },
              ],
            },
          ],
        },
      ],
    },
    {
      key: '1',
      title: 'node 1',
      // children: new Array(1000)
      //   .fill(null)
      //   .map((_, index) => ({ title: `auto ${index}`, key: `auto-${index}` })),
      children: [
        {
          key: '1-0',
          title: 'node 1-0',
          children: [
            { key: '1-0-0', title: 'node 1-0-0' },
            {
              key: '1-0-1',
              title: 'node 1-0-1',
              children: [
                { key: '1-0-1-0', title: 'node 1-0-1-0' },
                { key: '1-0-1-1', title: 'node 1-0-1-1' },
              ],
            },
            { key: '1-0-2', title: 'node 1-0-2' },
          ],
        },
      ],
    },
  ];
}

interface FileTreeState {
  gData: TreeDataType[];
}

export default class FileTree extends Component<
  Record<string, string>,
  FileTreeState
> {
  constructor(props: Record<string, string>) {
    super(props);
    this.state = {
      gData: getTreeData(),
    };
  }

  onDrop = (
    info: NodeDragEventParams<TreeDataType> & {
      dragNode: EventDataNode<TreeDataType>;
      dragNodesKeys: Key[];
      dropPosition: number;
      dropToGap: boolean;
    }
  ) => {
    console.log('drop', info);
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition =
      info.dropPosition - Number(dropPos[dropPos.length - 1]);

    type LoopCallback = (
      item: TreeDataType,
      index: number,
      arr: TreeDataType[]
    ) => void;

    const loop = (
      data: TreeDataType[],
      key: string,
      callback: LoopCallback
    ) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          callback(item, index, arr);
          return;
        }
        if (item.children) {
          loop(item.children, key, callback);
        }
      });
    };

    const { gData } = this.state;
    const data = [...gData];

    // Find dragObject
    let dragObj: TreeDataType | null | undefined;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (dragObj) {
      let ar: TreeDataType[] = [];
      let i = 0;
      // Drop on the content
      loop(data, dropKey, (item, index, arr) => {
        if (dropPosition === 0 && item.children) {
          item.children = item.children || [];
          // where to insert
          item.children.unshift(dragObj as TreeDataType);
        } else {
          ar = arr;
          i = index;
        }
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    }
    this.setState({
      gData: data,
    });
  };

  render() {
    const { gData } = this.state;
    return (
      <div className="filetree">
        <span className="filetree_title">Folder</span>
        <style dangerouslySetInnerHTML={{ __html: STYLE }} />
        <div style={{ display: 'flex' }}>
          <div style={{ flex: '1 1 50%' }}>
            <Tree<TreeDataType>
              defaultExpandAll
              itemHeight={20}
              draggable
              virtual={false}
              onDragStart={(info) => {
                console.log('drag start', info);
              }}
              onDragEnter={(info) => {
                console.log('drag enter', info);
              }}
              onDrop={this.onDrop}
              style={{ overflow: 'scroll' }}
              treeData={gData}
              expandAction={false}
            />
          </div>
        </div>
      </div>
    );
  }
}
