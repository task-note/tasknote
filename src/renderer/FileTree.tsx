/* eslint no-console:0, react/no-danger: 0 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { ButtonItem, MenuGroup, Section } from '@atlaskit/menu';
import { N800 } from '@atlaskit/theme/colors';
import { token } from '@atlaskit/tokens';
import tippy, { Instance } from 'tippy.js';
import Tree from '../../tree/src/Tree';
import './FileTree.less';
import { NodeDragEventParams } from '../../tree/src/contextTypes';
import { EventDataNode, Key } from '../../tree/src/interface';
import { TreeDataType, loadFiles, trashItem } from './FileOp';
import { log } from './Logger';
import showMessageBox from './messageBox';

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
  selectedKeys: Key[];
}

export type OnSelectType = (node: TreeDataType) => void;

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

interface FileTreeProps {
  width: number;
}

class FileTree extends Component<FileTreeProps, FileTreeState> {
  treeRef: React.RefObject<Tree<TreeDataType>>;

  selCallback: OnSelectType | undefined;

  contextMenu: Instance | undefined;

  constructor(props: FileTreeProps) {
    super(props);
    this.state = {
      gData: [],
      selectedKeys: [],
    };
    this.treeRef = React.createRef();
    loadFiles((treeData: TreeDataType[], sel: string) => {
      this.setState({
        gData: treeData,
      });
    }, '');
  }

  getCurrentSelect() {
    const element = this.treeRef.current;
    return element?.state.selectedKeys;
  }

  getNodeByKey(key: string) {
    const { gData } = this.state;
    return findNode(key, gData);
  }

  setSelectProc = (cb: OnSelectType) => {
    this.selCallback = cb;
  };

  onDelete = () => {
    const currSel = this.getCurrentSelect();
    if (!currSel || currSel.length <= 0) {
      return;
    }
    const selFilePath = currSel[0].toString();
    const selNode = this.getNodeByKey(selFilePath);
    this.contextMenu?.hide();
    const type = selNode?.isLeaf ? 'note' : 'folder';
    showMessageBox(
      'Delete Project Notes',
      `Do you want to delete the project ${type} "${selNode?.title}" ?`,
      (val) => {
        log('onDelete', val, selFilePath);
        if (val) {
          trashItem(selFilePath, (treeData: TreeDataType[], sel: string) => {
            this.setState({
              gData: treeData,
            });
          });
        }
      }
    );
  };

  onSelect = (
    keys: Key[],
    info: {
      event: 'select';
      selected: boolean;
      node: EventDataNode<TreeDataType>;
      selectedNodes: TreeDataType[];
      nativeEvent: MouseEvent;
    }
  ) => {
    console.log('onSelect, selected=', keys, info);
    this.setState({ selectedKeys: keys });
    if (this.selCallback && info.selectedNodes.length > 0) {
      this.selCallback(info.selectedNodes[0]);
    }
  };

  onContextMenu = (info: {
    event: React.MouseEvent;
    node: EventDataNode<TreeDataType>;
  }) => {
    info.event.preventDefault();
    this.setState({ selectedKeys: [info.node.key] });
    log('right click', info.node);

    if (!this.contextMenu) {
      const element = document.createElement('div');
      ReactDOM.render(
        <div
          id="rightmenu"
          style={{
            color: token('color.text', N800),
            backgroundColor: token('elevation.surface.overlay', '#fff'),
            boxShadow: token(
              'elevation.shadow.overlay',
              '0px 4px 8px rgba(9, 30, 66, 0.25), 0px 0px 1px rgba(9, 30, 66, 0.31)'
            ),
            borderRadius: 4,
            maxWidth: 320,
            margin: '16px auto',
          }}
        >
          <MenuGroup>
            <Section>
              <ButtonItem onClick={this.onDelete}>Delete</ButtonItem>
              <ButtonItem>Create project</ButtonItem>
            </Section>
          </MenuGroup>
        </div>,
        element
      );

      const rightClickableArea = document.querySelector('#filetree');
      this.contextMenu = tippy(rightClickableArea as Element, {
        content: element,
        placement: 'right-start',
        trigger: 'manual',
        interactive: true,
        arrow: false,
        offset: [0, 0],
      });
    }
    const rect: DOMRect = new DOMRect(
      info.event.clientX,
      info.event.clientY,
      0,
      0
    );
    this.contextMenu.setProps({
      getReferenceClientRect: () => rect,
    });

    this.contextMenu.show();
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
    const { gData, selectedKeys } = this.state;
    const { width } = this.props;
    const sideWidth = width - 35;
    return (
      <div className="filetree" id="filetree">
        <span className="filetree_title">Folders</span>
        <style dangerouslySetInnerHTML={{ __html: STYLE }} />
        <div style={{ display: 'flex', width: sideWidth, overflow: 'hidden' }}>
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
              selectedKeys={selectedKeys}
              checkable={false}
              onSelect={this.onSelect}
              onRightClick={this.onContextMenu}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default FileTree;
