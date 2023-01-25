// @ts-nocheck
import axios from "axios";
import { SDL } from "@akashnetwork/akashjs/build/sdl";

export async function getCurrentHeight(apiEndpoint) {
  const response = await axios.get(`${apiEndpoint}/blocks/latest`);
  const data = response.data;

  const height = parseInt(data.block.header.height);
  return height;
}

function isString(value: object): value is string {
  return value.constructor === String;
}

function getSdl(yamlJson: string | v2Sdl) {
  return isString(yamlJson)
    ? SDL.fromString(yamlJson)
    : new SDL(yamlJson);
}

export function DeploymentGroups(yamlJson: string | v2Sdl) {
  const sdl = getSdl(yamlJson);
  return sdl.groups();
}

export function Manifest(yamlJson: string | v2Sdl, asString = false) {
  const sdl = getSdl(yamlJson);
  return sdl.manifest(asString);
}

export async function ManifestVersion(yamlJson: string | v2Sdl) {
  const sdl = getSdl(yamlJson);
  return sdl.manifestVersion();
}