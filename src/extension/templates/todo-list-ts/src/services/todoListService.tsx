import { react } from '@hubai/core';
import { TodoListState } from '../models/todoState';
import { TodoItem } from '../models/todoItem';

const { Component } = react;

export default class TodoListService extends Component<TodoListState> {
  protected state: TodoListState;

  constructor() {
    super();
    this.state = {
      todoList: [
        {
          id: `task1`,
          name: 'Task 1',
          completed: false,
          updateTime: new Date().toISOString(),
        },
        {
          id: `task2`,
          name: 'Task 2',
          completed: false,
          updateTime: new Date().toISOString(),
        },
      ],
    };
  }

  public addItem = (todoItem: string) => {
    const { todoList } = this.state;
    todoList.push({
      id: `todoList.${new Date().getTime()}`,
      name: `${todoItem}`,
      completed: false,
      updateTime: new Date().toString(),
    });

    this.setState({ todoList });
  };

  public removeItem = (id: string) => {
    const { todoList } = this.state;
    this.setState({ todoList: todoList.filter((item) => item.id !== id) });
  };

  public updateItem = (item: TodoItem) => {
    const { todoList } = this.state;
    const index = todoList.findIndex((i) => i.id === item.id);
    todoList[index] = item;
    this.setState({ todoList });
  };

  public getTodoItem = (id: string): TodoItem | undefined => {
    const { todoList } = this.state;
    return todoList.find((item) => item.id === id);
  };
}
