import { Endpoint } from '@akashnetwork/akashjs/build/protobuf/akash/base/v1beta2/endpoint';
import { Attribute } from '@akashnetwork/akashjs/build/protobuf/akash/base/v1beta2/attribute';
import { v2Sdl } from '@akashnetwork/akashjs/build/sdl/types';

export interface InitialValuesProps {
  folderName?: string | undefined;
  appName: string;
  sdl: SDLSpec | undefined;
  depositor: string | undefined;
}

export interface Template {
  title: string;
  description: string;
  url: string;
}

export const initialValues: InitialValuesProps = {
  folderName: undefined,
  appName: '',
  sdl: undefined,
  depositor: undefined,
};

export enum SdlConfigurationType {
  Create = 'Create',
  Update = 'Update',
  ReDeploy = 'ReDeploy',
}

export interface Service {
  Name: string;
  Image: string;
  Command: string[] | null;
  Args: string[] | null;
  Env: string[] | null;
  Resources: ResourceUnits;
  Count: number;
  Expose: ServiceExpose[] | null;
}

export interface ServiceExpose {
  Port: number; // Port on the container
  ExternalPort?: number; // Port on the service definition (default 0?)
  Proto: ServiceProtocol; //
  Service: string; // default ""
  Global: boolean; // default false
  Hosts: string[] | null;
}

export type ServiceProtocol = 'TCP' | 'UDP';

export interface ResourceUnits {
  cpu: CPU;
  memory: Memory;
  storage: Storage;
  endpoints: Endpoint[] | null;
}

export interface CPU {
  units: ResourceValue;
  attributes?: Attribute[];
}

export interface Memory {
  size: ResourceValue;
  attributes?: Attribute[];
}

export interface Storage {
  size: ResourceValue;
  attributes?: Attribute[];
}

export interface ResourceValue {
  val: string;
}

export type SDLSpec = v2Sdl & {
  version: '2.0';
};

// Quick and dirty type guard for SDL like objects
export function isSDLSpec(sdl: unknown): sdl is SDLSpec {
  const sdlSpec = sdl as SDLSpec;

  return (
    sdlSpec.version === '2.0' &&
    typeof sdlSpec.services === 'object' &&
    typeof sdlSpec.profiles === 'object' &&
    typeof sdlSpec.deployment === 'object'
  );
}
