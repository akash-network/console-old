//const stableStringify = require("json-stable-stringify");

import { cloneDeep, find, toArray } from 'lodash';
import { SDLSpec } from '../components/SdlConfiguration/settings';

const specSuffixes = {
  Ki: 1024,
  Mi: 1024 * 1024,
  Gi: 1024 * 1024 * 1024,
  Ti: 1024 * 1024 * 1024 * 1024,
  Pi: 1024 * 1024 * 1024 * 1024 * 1024,
  Ei: 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
  K: 1000,
  M: 1000 * 1000,
  G: 1000 * 1000 * 1000,
  T: 1000 * 1000 * 1000 * 1000,
  P: 1000 * 1000 * 1000 * 1000 * 1000,
  E: 1000 * 1000 * 1000 * 1000 * 1000 * 1000,
  Kb: 1000,
  Mb: 1000 * 1000,
  Gb: 1000 * 1000 * 1000,
  Tb: 1000 * 1000 * 1000 * 1000,
  Pb: 1000 * 1000 * 1000 * 1000 * 1000,
  Eb: 1000 * 1000 * 1000 * 1000 * 1000 * 1000,
};

export function ParseServiceProtocol(input: string) {
  let result;

  // This is not a case sensitive parse, so make all input
  // uppercase
  if (input) {
    input = input.toUpperCase();
  }

  switch (input) {
    case 'TCP':
    case '':
    case undefined: // The empty string (no input) implies TCP
      result = 'TCP';
      break;
    case 'UDP':
      result = 'UDP';
      break;
    default:
      throw new Error('ErrUnsupportedServiceProtocol');
  }

  return result;
}

export function parseSizeStr(str: any) {
  try {
    const suffix = (Object.keys(specSuffixes) as Array<keyof typeof specSuffixes>).find((s) =>
      str.toString().toLowerCase().endsWith(s.toLowerCase())
    );

    if (suffix) {
      const suffixPos = str.length - suffix.length;
      const numberStr = str.substring(0, suffixPos);

      return (parseFloat(numberStr) * specSuffixes[suffix]).toString();
    } else {
      return parseFloat(str);
    }
  } catch (err) {
    console.error(err);
    throw new Error('Error while parsing size: ' + str);
  }
}

export function shouldBeIngress(expose: any) {
  return expose.proto === 'TCP' && expose.global && 80 === exposeExternalPort(expose);
}

function exposeExternalPort(expose: any) {
  if (expose.externalPort === 0) {
    return expose.port;
  }

  return expose.externalPort;
}

/**
 * We need to make storage property of SDL as array to be able to manipulate with ephemeral and persistent storage
 * Here we clone whole SDL, transform storage and then return new SDL
 * @param sdl = {}
 * @return transformed SDL
 */
export const transformSdl = (sdl: SDLSpec) => {
  const transformedSdl = cloneDeep(sdl);
  const profiles = toArray(sdl.deployment)
    .map((x: any) => find(x, 'profile'))
    .map((t: any) => t.profile);
  profiles.map((profile: any) => {
    const isStorageArray = Array.isArray(
      transformedSdl.profiles.compute[profile].resources.storage
    );
    if (!isStorageArray) {
      // There's no better way than mutating it here directly 🤷
      transformedSdl.profiles.compute[profile].resources.storage = [
        transformedSdl.profiles.compute[profile].resources.storage,
      ];
      return true;
    }
    return true;
  });
  return transformedSdl;
};

export const wait = async (time = 3000) => {
  return new Promise<void>((res, rej) => {
    setTimeout(() => {
      res();
    }, time);
  });
};
