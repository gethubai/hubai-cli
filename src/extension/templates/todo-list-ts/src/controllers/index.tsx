import {
  AppContext,
  Controller,
  INotificationItem,
  localize,
  component
} from '@hubai/core';
import React from 'react';
import TodoListService from '../services/todoListService';
import { TodoItem } from '../models/todoItem';
import TodoItemView from '../views/todoItem';
export class TodoListExtensionController extends Controller {
  appContext: AppContext;
  todoService: TodoListService;

  constructor(appContext: AppContext, todoService: TodoListService) {
    super();
    this.appContext = appContext;
    this.todoService = todoService;
  }

  initView(): void {
    const sidebarHeaderToolbar = [
      {
        icon: 'refresh',
        id: 'todoList.reload',
        title: localize('reload', 'Reload'),
        onClick: () => {
          console.log('OnReload!');
        },
      },
      {
        icon: 'add',
        id: 'todoList.add',
        title: localize('todoList.menu.addItem', 'Add TODO'),
        onClick: () => this.openEditorTab(),
      },
    ];

    this.todoService.setState({ headerToolBar: sidebarHeaderToolbar });
  }

  public openEditorTab = (item?: TodoItem) => {
    const tabId = `todoList.${item?.id ?? 'create'}`;
    let renderPane;

    // Check if tab is already opened
    if (!this.appContext.services.editor.isOpened(tabId)) {
      renderPane = () => (
        <TodoItemView
          item={item}
          onSubmit={(e) => {
            this.updateOrCreateTodoItem(e);
            this.tryCloseEditorTab(tabId);
          }}
        />
      );
    }

    this.appContext.services.editor.open({
      id: tabId,
      name: item?.name ?? 'New TODO',
      icon: 'pass',
      renderPane,
    });
  };

  onContextMenuClick = (menu: component.IMenuItemProps, item: TodoItem) => {
    switch (menu.id) {
      case 'edit':
        this.openEditorTab(item);
        break;
      case 'remove':
        // Close the tab if it's opened
        this.tryCloseEditorTab(`todoList.${item.id}`);
        this.todoService.removeItem(item.id);
        break;
      default:
        break;
    }
  };

  updateOrCreateTodoItem(e: TodoItem) {
    const existingItem = this.todoService.getTodoItem(e.id);

    if (existingItem) {
      this.todoService.updateItem(e);
    } else {
      this.todoService.addItem(e.name);
    }
  }

  tryCloseEditorTab = (tabId: string) => {
    const group = this.appContext.services.editor.getState().current;
    if (group) {
      this.appContext.services.editor.closeTab(tabId, group.id!);
    }
  };

  sendNotification = (
    value: INotificationItem<any>,
    render: (item: INotificationItem<any>) => React.ReactNode
  ) => {
    this.appContext.services.notification.add([
      {
        id: `todoList.notification.${new Date().getTime.toString()}`,
        value,
        render,
      },
    ]);

    this.appContext.services.notification.toggleNotification();
  };
}
