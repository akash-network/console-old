export const nameToURI = (name: string) =>
  typeof name === 'string' ? name.toLowerCase().replaceAll(' ', '_') : '';

export const uriToName = (uriName: string) =>
  typeof uriName === 'string' ? uriName.replaceAll('_', ' ') : '';
