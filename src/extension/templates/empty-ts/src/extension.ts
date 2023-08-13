<% const className = toPascalCase(extensionName) + (extensionName.toLowerCase().endsWith('extension') ? '' : 'Extension'); %>

import { AppContext, IExtension, UniqueId } from '@hubai/core';

export class <%= className %> implements IExtension {
  id: UniqueId = '<%= extensionName %>';

  name: string = '<%= displayName %>';

  activate(extensionCtx: AppContext): void {
    console.log('activating test extension!');
  }
  dispose(extensionCtx: AppContext): void {
    console.log('disposing test extension!');
  }
}

const extension = new <%= className %>();
export default extension;
