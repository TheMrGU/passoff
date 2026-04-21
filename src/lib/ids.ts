import { customAlphabet } from 'nanoid';

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const gen = customAlphabet(alphabet, 8);

export function newHandoffId(): string {
  return `ph_${gen()}`;
}
