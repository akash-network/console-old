interface leaseID {
  dseq: string;
  gseq: string;
  oseq: string;
}

export function versionPath(): string {
  return 'version';
}

export function statusPath(): string {
  return 'status';
}

export function validatePath(): string {
  return 'validate';
}

export function leasePath(id: leaseID): string {
  return `lease/${id.dseq}/${id.gseq}/${id.oseq}`;
}

export function submitManifestPath(dseq: string): string {
  return `deployment/${dseq}/manifest`;
}

export function leaseStatusPath(id: leaseID): string {
  return `${leasePath(id)}/status`;
}

export function leaseShellPath(id: leaseID): string {
  return `${leasePath(id)}/shell`;
}

export function leaseEventsPath(id: leaseID): string {
  return `${leasePath(id)}/kubeevents`;
}

export function serviceStatusPath(id: leaseID, service: string): string {
  return `${leasePath(id)}/service/${service}/status`;
}

export function serviceLogsPath(id: leaseID): string {
  return `${leasePath(id)}/logs`;
}
