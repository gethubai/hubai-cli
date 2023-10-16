export { default } from './extension';

if (module.hot) {
    module.hot.accept('./extension.ts', () => {
      // TODO: Find a way to reload the extension components
      console.log('HRM Updated');
    });

    module.hot.accept('./themes/colors.json', () => {
      console.log('HRM Updated');
    });
  }
  