import axios from 'axios';
import { SDL } from '@akashnetwork/akashjs/build/sdl';
import { v2Sdl } from '@akashnetwork/akashjs/build/sdl/types';

type NetworkType = 'beta2' | 'beta3';

export async function getCurrentHeight(apiEndpoint: string) {
  const response = await axios.get(`${apiEndpoint}/blocks/latest`);
  const data = response.data;

  const height = parseInt(data.block.header.height);
  return height;
}

function isString(value: unknown): value is string {
  return typeof value === 'object' && value !== null && value.constructor === String;
}

function getSdl(yamlJson: string | v2Sdl, networkType: NetworkType) {
  return isString(yamlJson) ? SDL.fromString(yamlJson, networkType) : new SDL(yamlJson, networkType);
}

export function DeploymentGroups(yamlJson: string | v2Sdl, networkType: NetworkType) {
  const sdl = getSdl(yamlJson, networkType);
  return sdl.groups();
}

export function Manifest(yamlJson: string | v2Sdl, networkType: NetworkType, asString = false) {
  const sdl = getSdl(yamlJson, networkType);
  return sdl.manifest(asString);
}

export async function ManifestVersion(yamlJson: string | v2Sdl, networkType: NetworkType) {
  const sdl = getSdl(yamlJson, networkType);
  return sdl.manifestVersion();
}

export function ManifestYaml(sdlConfig: v2Sdl, networkType: NetworkType) {
  const sdl = getSdl(sdlConfig, networkType);
  return sdl.manifestSortedJSON();
}
