import readline from 'node:readline';

readline.emitKeypressEvents(process.stdin);

if (process.stdin.setRawMode !== null) {
  process.stdin.setRawMode(true);
}

const memory = new Map<string, number>();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const readLine = (question: string): Promise<string> => {
  rl.write(null, { ctrl: true, name: 'u' });
  return new Promise((resolve) => {
    rl.question(question, (input: string) => {
      resolve(input);
    });
  });
};

export const readChar = (question: string): Promise<string> => {
  console.log(question);
  return new Promise((resolve) => {
    process.stdin.once('keypress', (str) => {
      resolve(str);
    });
  });
};
