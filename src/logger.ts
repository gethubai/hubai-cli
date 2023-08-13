import chalk from 'chalk';
import { ValidationError } from 'joi';

export class Logger {
  verboseEnabled = false;

  info(message?: string, ...additional: any[]): void {
    console.log(chalk.blue('INFO:'), message, ...additional);
  }

  debug(message?: string, ...additional: any[]): void {
    if (this.verboseEnabled)
      console.log(chalk.magenta('DEBUG:'), message, ...additional);
  }

  warn(message?: string, ...additional: any[]): void {
    console.log(chalk.yellow('WARN:'), message, ...additional);
  }

  error(message?: string, ...additional: any[]): void {
    console.log(chalk.red('ERROR:'), message, ...additional);
  }

  success(message?: string, ...additional: any[]): void {
    console.log(chalk.green(message), ...additional);
  }

  validationError(message: string, error: ValidationError): void {
    this.error(message);
    this.error('Validation Error:');
    error.details.forEach((detail, index) => {
      console.log(chalk.yellow(`  Error ${index + 1}:`));
      console.log(chalk.cyan('    Message:'), detail.message);
      console.log(chalk.cyan('    Path:'), detail.path.join('.'));
      console.log(chalk.cyan('    Type:'), detail.type);
      console.log(
        chalk.cyan('    Context:'),
        JSON.stringify(detail.context, null, 2)
      );
    });
  }

  enableVerbose(): void {
    this.verboseEnabled = true;
  }
}

const logger = new Logger();
export default logger;
