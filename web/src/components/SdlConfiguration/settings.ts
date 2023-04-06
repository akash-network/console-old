import { Endpoint } from "@akashnetwork/akashjs/build/protobuf/akash/base/v1beta2/endpoint";
import { Attribute } from "@akashnetwork/akashjs/build/protobuf/akash/base/v1beta2/attribute";

export interface InitialValuesProps {
  folderName?: string | undefined,
  appName: string,
  sdl: SDLSpec | undefined,
  depositor: string | undefined,
}

export interface Template {
  title: string,
  description: string,
  url: string
}

export const initialValues: InitialValuesProps = {
  folderName: undefined,
  appName: "",
  sdl: undefined,
  depositor: undefined,
}

export enum SdlConfigurationType {
  Create = "Create",
  Update = "Update",
  ReDeploy = "ReDeploy"
}

export interface Service {
  Name: string;
  Image: string;
  Command: string[] | null;
  Args: string[] | null;
  Env: string[] | null;
  Resources: ResourceUnits
  Count: number;
  Expose: ServiceExpose[] | null
}

export interface ServiceExpose {
  Port: number; // Port on the container
  ExternalPort?: number; // Port on the service definition (default 0?)
  Proto: ServiceProtocol // 
  Service: string; // default ""
  Global: boolean; // default false
  Hosts: string[] | null;
}

export type ServiceProtocol = "TCP" | "UDP";

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

export interface SDLSpec {
  version: "2.0";
  services: {
    [key: string]: { // Service Name
      image: string;
      depends_on?: string[];
      command?: string[] | null;
      args?: string[] | null;
      env?: string[] | null;
      expose: {
        port: number;
        as?: number;
        accept?: string[] | null;
        proto?: "http" | "https" | "tcp";
        to?: {
          service?: string;
          global?: boolean;
        }[]
      }[];
      params?: {
        storage: {
          [key: string]: {
            mount: string
          }
        }
      }
    }
  };
  profiles: {
    compute: {
      [key: string]: { // Service Name
        resources: {
          cpu: {
            units: number | string,
          }
          memory: {
            size: string
          }
          storage: {
            size: string
          }
        }
      }
    }
    placement: {
      [key: string]: { // Group Name
        attributes?: Record<Attribute["key"], Attribute["value"]>;
        signedBy?: {
          allOf?: string[],
          anyOf?: string[]
        }
        pricing: {
          [key: string]: { // Service Name
            denom: string,
            amount: number
          }
        }
      }
    }
  };
  deployment: {
    [key: string]: { // Service Name
      [key: string]: { // Group Name
        profile: string // Service Name
        count: number
      }
    }
  };
}

// Quick and dirty type guard for SDL like objects
export function isSDLSpec(sdl: unknown): sdl is SDLSpec {
  const sdlSpec = sdl as SDLSpec;

  return sdlSpec.version === "2.0" &&
    typeof sdlSpec.services === "object" &&
    typeof sdlSpec.profiles === "object" &&
    typeof sdlSpec.deployment === "object";
}