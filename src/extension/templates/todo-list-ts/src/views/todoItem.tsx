/* eslint-disable promise/catch-or-return */
import React from 'react';
import styled from 'styled-components';
import { component } from '@hubai/core';
import { FormItem } from './components/formItem';
import { TodoItem } from '../models/todoItem';

const { Button } = component;
const FormContainer = styled.div`
  width: 50%;
  margin: auto;
`;

const SubmitButton = styled(Button)`
  width: 120px;
  display: inline-block;
`;

export type Props = {
  item?: TodoItem;
  onSubmit?: (item: TodoItem) => void;
};

export class TodoItemView extends React.Component<Props> {
  state = {
    data: [],
    currentDataSource: undefined,
  };

  formRef: React.RefObject<HTMLFormElement>;

  constructor(props: any) {
    super(props);
    this.formRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.item) {
      const { name } = this.props.item;
      const form = this.formRef.current;
      if (form) {
        form.elements.name.value = name || '';
      }
    }
  }

  submit = async (e: React.FormEvent) => {
    const { item } = this.props;
    e.preventDefault();
    const form = new FormData(this.formRef.current || undefined);
    const updatedItem = {
      id: item?.id || new Date().getTime().toString(),
      name: form.get('name')?.toString() || '',
      completed: item ? !item.completed : false,
      updateTime: new Date().getTime().toString(),
    };

    this.props.onSubmit?.(updatedItem);
  };

  render() {
    const { item } = this.props;
    return (
      <FormContainer>
        <h2>TODO Item</h2>
        <form ref={this.formRef} onSubmit={this.submit}>
          <FormItem label="Name" name="name" />
          <FormItem style={{ textAlign: 'left' }}>
            {!item && (
              <SubmitButton style={{ marginLeft: 0 }} onClick={this.submit}>
                Add
              </SubmitButton>
            )}
            {!!item && (
              <SubmitButton style={{ marginLeft: 0 }} onClick={this.submit}>
                {item.completed ? 'Reopen' : 'Complete'}
              </SubmitButton>
            )}
          </FormItem>
        </form>
      </FormContainer>
    );
  }
}

export default TodoItemView;
