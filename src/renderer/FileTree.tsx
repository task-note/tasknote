/* eslint no-console:0, react/no-danger: 0 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { ButtonItem, MenuGroup, Section } from '@atlaskit/menu';
import { N800 } from '@atlaskit/theme/colors';
import { token } from '@atlaskit/tokens';
import tippy, { Instance } from 'tippy.js';

import Tree from '../../packages/tree/src/Tree';
import './FileTree.less';
import { NodeDragEventParams } from '../../packages/tree/src/contextTypes';
import { EventDataNode, Key } from '../../packages/tree/src/interface';
import {
  TreeDataType,
  loadFiles,
  trashItem,
  nameValidator,
  renameItem,
  trydrop,
} from './FileOp';
import { log, warn, error } from './Logger';
import showMessageBox from './messageBox';
import showInputDialog from './InputDialog';
import { IconCirclePlus } from './CustomIcons';

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

export type OnSelectType = (node: TreeDataType | undefined) => void;

function findNode(
  key: string,
  child: TreeDataType[]
): [TreeDataType | undefined, TreeDataType[]] {
  for (let index = 0; index < child.length; index += 1) {
    if (child[index].key === key) {
      return [child[index], child];
    }
    if (child[index].children) {
      const result = findNode(key, child[index].children as TreeDataType[]);
      if (result[0]) {
        return result;
      }
    }
  }
  return [undefined, []];
}

function generateKeys(key: string) {
  const result = [];
  let lastPos = 0;
  let pos = key.indexOf('/', lastPos);
  while (pos >= 0) {
    if (pos > 0) {
      result.push(key.substring(0, pos));
    }
    lastPos = pos + 1;
    pos = key.indexOf('/', lastPos);
  }
  return result;
}

interface FileTreeProps {
  width: number;
  selCallback: OnSelectType | undefined;
  newRootFolderCB: () => void | undefined;
  newFileCB: () => void | undefined;
  newFolderCB: () => void | undefined;
}

class FileTree extends Component<FileTreeProps, FileTreeState> {
  treeRef: React.RefObject<Tree<TreeDataType>>;

  contextMenu: Instance | undefined;

  constructor(props: FileTreeProps) {
    super(props);
    this.state = {
      gData: [],
      selectedKeys: [],
    };
    this.treeRef = React.createRef();
    this.reloadTree('');
  }

  getCurrentSelect() {
    const element = this.treeRef.current;
    return element?.state.selectedKeys;
  }

  setCurrentSelect(key: string) {
    this.setState({ selectedKeys: [key] });
    const tree = this.treeRef.current;
    const currExpanded = tree?.state.expandedKeys;
    let extendedKeys = [];
    const newExpands = generateKeys(key);
    if (currExpanded) {
      extendedKeys = [...currExpanded, ...newExpands];
    } else {
      extendedKeys = newExpands;
    }
    tree?.setExpandedKeys(extendedKeys);
  }

  getNodeByKey(key: string) {
    const { gData } = this.state;
    const [node] = findNode(key, gData);
    return node;
  }

  getValidator(key: string | undefined) {
    if (key === '.') {
      const { gData } = this.state;
      return nameValidator.bind(this, gData, undefined);
    }
    if (key) {
      const { gData } = this.state;
      const [selNode, siblings] = findNode(key, gData);
      if (selNode) {
        return nameValidator.bind(this, siblings, undefined);
      }
    }
    return () => {
      return true;
    };
  }

  onNewFolder = () => {
    const { newFolderCB } = this.props;
    newFolderCB();
  };

  onNewFile = () => {
    const { newFileCB } = this.props;
    newFileCB();
  };

  onRename = () => {
    this.contextMenu?.hide();
    const currSel = this.getCurrentSelect();
    if (!currSel || currSel.length <= 0) {
      return;
    }
    const selFilePath = currSel[0].toString();
    const { gData } = this.state;
    const [selNode, siblings] = findNode(selFilePath, gData);
    if (!selNode) {
      return;
    }
    const type = selNode?.isLeaf ? 'note' : 'folder';
    log('rename current=', selFilePath, selNode?.title);
    showInputDialog(
      `Rename Project ${type}`,
      'Please input your new name:',
      (val: string) => {
        log('-->', val);
        renameItem(selFilePath, val, this.updateTree.bind(this));
      },
      selNode.title,
      nameValidator.bind(this, siblings, selNode),
      'Rename'
    );
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
          trashItem(selFilePath, this.updateTree.bind(this));
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
    const { selCallback } = this.props;
    log('onSelect, selected=', keys, info);
    this.setState({ selectedKeys: keys });
    if (selCallback && info.selectedNodes.length > 0) {
      selCallback(info.selectedNodes[0]);
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
              <ButtonItem onClick={this.onRename}>Rename</ButtonItem>
            </Section>
            <Section hasSeparator>
              <ButtonItem onClick={this.onNewFolder}>New Folder</ButtonItem>
              <ButtonItem onClick={this.onNewFile}>New Project Note</ButtonItem>
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
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    log('drop', dragKey, dropKey);
    trydrop(dragKey, dropKey, (result, dropPath) => {
      if (result === 0) {
        this.reloadTree(dropPath);
      } else if (result === 2) {
        if (dropPath === dragKey) {
          log('drop in the same folder, ignore');
          return;
        }
        showMessageBox(
          'Drop Failed',
          'Same name file or folder exists in the destination folder',
          () => {},
          'OK'
        );
      } else if (result === 1) {
        if (dropPath === dragKey) {
          log('drop in the same folder, ignore');
          return;
        }
        showMessageBox(
          'Confirm',
          'Same name file exists in the destination folder, Do you want replace',
          (val) => {
            if (val === 1) {
              renameItem(dragKey, dropPath, this.updateTree.bind(this));
            } else {
              warn('User abandon file replace:', val);
            }
          },
          'Yes'
        );
      } else {
        error('unknown drop error:', result);
      }
    });
  };

  reloadTree(defaultSel: string) {
    loadFiles(this.updateTree.bind(this), defaultSel);
  }

  updateTree(treeData: TreeDataType[], sel: string) {
    let expanded = sel.substring(0, sel.lastIndexOf('/'));
    expanded = expanded.replaceAll('//', '/');
    const tree = this.treeRef.current;
    const currExpanded = tree?.state.expandedKeys;
    let extendedKeys = [];
    if (currExpanded) {
      extendedKeys = [...currExpanded, expanded];
    } else {
      extendedKeys = [expanded];
    }

    this.setState({
      gData: treeData,
      selectedKeys: [sel],
    });
    tree?.setExpandedKeys(extendedKeys);
    const { selCallback } = this.props;
    const selNode = this.getNodeByKey(sel);
    if (selCallback) {
      selCallback(selNode);
    }
  }

  render() {
    const { gData, selectedKeys } = this.state;
    const { width, newRootFolderCB } = this.props;
    const sideWidth = width - 35;

    return (
      <div className="filetree" id="filetree">
        <button id="new_folder" type="button" onClick={newRootFolderCB}>
          <IconCirclePlus />
        </button>
        <span className="filetree_title">Folders</span>
        <style dangerouslySetInnerHTML={{ __html: STYLE }} />
        <div style={{ display: 'flex', width: sideWidth, overflow: 'hidden' }}>
          <div style={{ flex: '1 1 50%' }}>
            <Tree<TreeDataType>
              ref={this.treeRef}
              defaultExpandAll
              // height={200}
              itemHeight={20}
              selectedKeys={selectedKeys}
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
              onRightClick={this.onContextMenu}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default FileTree;
