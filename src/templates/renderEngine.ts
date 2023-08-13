import ejs from 'ejs';

function toPascalCase(str: string): string {
  return str
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

export interface TemplateData {
  projectName: string;
  [key: string]: any;
}

export function render(content: string, data: TemplateData): string {
  return ejs.render(content, { ...data, toPascalCase });
}
