/* eslint no-console:0, react/no-danger: 0 */
import React, { Component } from 'react';
import Tree from '../../tree/src/Tree';
import './FileTree.less';
import { NodeDragEventParams } from '../../tree/src/contextTypes';
import { EventDataNode, Key } from '../../tree/src/interface';
import { TreeDataType, loadFiles } from './FileOp';

const STYLE = `
.rc-tree-child-tree {
  display: block;
}

.node-motion {
  transition: all .3s;
  overflow-y: hidden;
}
`;

interface FileTreeState {
  gData: TreeDataType[];
}

function findNode(
  key: string,
  child: TreeDataType[]
): TreeDataType | undefined {
  let result;
  for (let index = 0; index < child.length; index += 1) {
    if (child[index].key === key) {
      return child[index];
    }
    if (child[index].children) {
      result = findNode(key, child[index].children as TreeDataType[]);
      if (result) {
        return result;
      }
    }
  }
  return result;
}

export default class FileTree extends Component<
  Record<string, unknown>,
  FileTreeState
> {
  treeRef: React.RefObject<Tree<TreeDataType>>;

  constructor(props: Record<string, unknown>) {
    super(props);
    this.state = {
      gData: [],
    };
    this.treeRef = React.createRef();
    loadFiles((treeData: TreeDataType[], sel: string) => {
      this.setState({
        gData: treeData,
      });
    }, '');
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }

  getCurrentSelect() {
    const element = this.treeRef.current;
    return element?.state.selectedKeys;
  }

  getNodeByKey(key: string) {
    const { gData } = this.state;
    return findNode(key, gData);
  }

  updateDimensions = () => {
    const element = this.treeRef.current;
    console.log('update dimensions', element?.state.selectedKeys);
  };

  onSelect = (
    selectedKeys: Key[],
    info: {
      event: 'select';
      selected: boolean;
      node: EventDataNode<TreeDataType>;
      selectedNodes: TreeDataType[];
      nativeEvent: MouseEvent;
    }
  ) => {
    console.log('onSelect, selected=', selectedKeys, info);
  };

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
        <span className="filetree_title">Folders</span>
        <style dangerouslySetInnerHTML={{ __html: STYLE }} />
        <div style={{ display: 'flex' }}>
          <div style={{ flex: '1 1 50%' }}>
            <Tree<TreeDataType>
              ref={this.treeRef}
              defaultExpandAll
              // height={200}
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
              // style={{ overflow: 'scroll' }}
              treeData={gData}
              expandAction="doubleClick"
              checkable={false}
              onSelect={this.onSelect}
            />
          </div>
        </div>
      </div>
    );
  }
}
