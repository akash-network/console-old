import { uniqueNamesGenerator, Config, adjectives, animals } from 'unique-names-generator';
import stringHash from 'string-hash';

export function uniqueName(address: string, dseq: string | number) {
  const seed = stringHash(`${address}${dseq}`);
  const customConfig: Config = {
    dictionaries: [adjectives, animals],
    separator: ' ',
    length: 2,
    style: 'capital',
    seed,
  };

  return uniqueNamesGenerator(customConfig);
}
