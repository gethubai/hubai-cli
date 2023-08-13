import React, { useCallback, useMemo } from 'react';

import {
  component,
  localize,
  Content,
  Header,
  getEventPosition,
} from '@hubai/core';
import { TodoListExtensionController } from '../controllers';
import { TodoListState } from '../models/todoState';

const {
  Toolbar,
  TreeView: Tree,
  Collapse,
  Menu,
  useContextViewEle,
} = component;

export type Props = TodoListExtensionController & TodoListState & {};

function Sidebar({
  headerToolBar,
  todoList,
  openEditorTab,
  onContextMenuClick,
}: Props) {
  const contextView = useContextViewEle();
  const collapseItems = todoList?.map(
    (item) =>
      ({
        id: item.id,
        name: item.name,
        value: item,
        fileType: 'File',
        icon: item.completed ? 'pass-filled' : 'circle-large',
        isLeaf: true,
      } as component.ICollapseItem)
  );

  const openContextMenu = useCallback(
    (e: React.MouseEvent, selected: component.ITreeNodeItemProps) => {
      e.preventDefault();
      contextView?.show(getEventPosition(e), () => (
        <Menu
          role="menu"
          onClick={(_: any, item: component.IMenuItemProps) => {
            contextView?.hide();
            onContextMenuClick?.(item, selected.value);
          }}
          data={[
            {
              id: 'edit',
              name: localize('todoList.menu.edit', 'Edit'),
              icon: 'edit',
            },
            {
              id: 'remove',
              name: localize('todoList.menu.remove', 'Remove'),
              icon: 'x',
            },
          ]}
        />
      ));
    },
    [contextView, onContextMenuClick]
  );

  const onSelectItem = useCallback(
    (node: component.ITreeNodeItemProps<any>) => {
      if (!node.isLeaf) return;

      openEditorTab(node.value);
    },
    [openEditorTab]
  );

  const renderCollapse = useMemo<component.ICollapseItem[]>(
    () => [
      {
        id: 'todoList.list',
        name: localize('todoList.listTitle', 'Tasks'),
        renderPanel: () => {
          return (
            <Tree
              data={collapseItems}
              className="todoListTree"
              onSelect={onSelectItem}
              onRightClick={openContextMenu}
            />
          );
        },
      },
    ],
    [collapseItems, onSelectItem, openContextMenu]
  );

  return (
    <div className="container" style={{ width: '100%', height: '100%' }}>
      <Header
        title={localize('todoList.sidebarTitle', 'Todo List')}
        toolbar={<Toolbar data={headerToolBar || []} />}
      />
      <Content>
        <Collapse data={renderCollapse} activePanelKeys={['todoList.list']} />
      </Content>
    </div>
  );
}

export default Sidebar;
