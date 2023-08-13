import React from 'react';
import { AppContext, IExtension, IMenuBarItem, react } from '@hubai/core';
import { TodoListExtensionController } from './controllers';
import TodoListService from './services/todoListService';
import SidebarView from './views/sidebar';

const { connect } = react;

export class TodoListExtension implements IExtension {
  id: string = 'todoList';

  name: string = 'TodoList';

  activate(context: AppContext): void {
    const service = new TodoListService();

    const controller = new TodoListExtensionController(context, service);

    const SidebarViewConnected = connect(service, SidebarView, controller);

    controller.initView();

    const sidebar = {
      id: 'todoList.sidebarPane',
      title: 'SidebarPanel',
      render: () => <SidebarViewConnected />,
    };

    const activityBar = {
      id: 'todoList.sidebarPane',
      name: 'TodoList',
      title: 'Todo List',
      icon: 'checklist',
    };

    const addTodoItemMenuItem: IMenuBarItem = {
      id: 'todoList.menu.addTodoItem',
      name: 'Add Item',
      icon: 'project',
    };

    context.services.sidebar.add(sidebar);
    context.services.activityBar.add(activityBar);
    context.services.menuBar.append(addTodoItemMenuItem, 'File');
    context.services.menuBar.forceUpdate();
  }

  dispose(context: AppContext): void {
    context.services.sidebar.remove('todoList.sidebarPane');
    context.services.activityBar.remove('todoList.activityBar');
  }
}

const todoExtension = new TodoListExtension();
export default todoExtension;
