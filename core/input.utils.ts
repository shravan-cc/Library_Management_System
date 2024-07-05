import { emitKeypressEvents } from 'node:readline';
import { z } from 'zod';

export const readLine = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    process.stdout.write(question);
    const onData = async (key: Buffer) => {
      process.removeListener('data', onData);
      const input = key.toString('utf-8');
      resolve(input.trim());
    };
    process.stdin.addListener('data', onData);
  });
};

export const readChar = (question: string): Promise<string> => {
  process.stdout.write(`${question}\n`);
  return new Promise((resolve) => {
    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.setEncoding('utf8');

    const onData = (key: Buffer) => {
      process.stdin.setRawMode(false);
      process.stdin.removeListener('data', onData);
      const char = key.toString('utf-8');
      if (char.charCodeAt(0) === 3) {
        process.exit(0);
      }
      resolve(char);
    };

    process.stdin.addListener('data', onData);
  });
};

export async function promptForValidInput<T>(
  question: string,
  schema: z.ZodSchema<T>,
  defaultValue: T
): Promise<T> {
  let input;
  do {
    input = await readLine(question);
    try {
      if (!input && defaultValue !== undefined) {
        return defaultValue;
      }
      return schema.parse(
        schema instanceof z.ZodNumber ? Number(input) : input
      );
    } catch (e) {
      if (e instanceof z.ZodError) {
        console.log('Validation error:', e.errors[0].message);
      } else {
        console.log('An unknown error occurred:', e);
      }
    }
  } while (true);
}
