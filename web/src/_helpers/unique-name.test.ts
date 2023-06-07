import { uniqueName } from './unique-name';

test('uniqueName: A unique name generated from a Keplr address and a deployment DSEQ', () => {
  const address = 'akash1annwm34rgxtkmt9tk32tj0shy5jtm3tzdsqvrj';
  const dseqNumber = 7720576;
  const dseqString = '7720576';

  const uniqueNameNumber = uniqueName(address, dseqNumber);
  const uniqueNameString = uniqueName(address, dseqString);

  console.log('uniqueNameNumber: ', uniqueNameNumber); // Typical Skunk
  console.log('uniqueNameString: ', uniqueNameString); // Typical Skunk

  expect(uniqueNameNumber).toEqual(uniqueNameString);
  expect(uniqueNameNumber).toEqual('Typical Skunk');
  expect(uniqueNameString).toEqual('Typical Skunk');
});
