import { component } from '@hubai/core';
import { TodoItem } from './todoItem';

export interface TodoListState {
  headerToolBar?: component.IActionBarItemProps[];
  todoList: TodoItem[];
}
