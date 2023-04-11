export const myDeploymentFormat = async (result: any, value: any) => {
  const key = String(result?.deploymentId?.dseq);
  let image = 'n/a';
  let cpu: any = 'n/a';
  let memory = 'n/a';
  let storage = 'n/a';
  let count = 0;
  if (value?.sdl?.services) {
    for (const [key] of Object.entries(value.sdl.services)) {
      if (count === 0) {
        if (value.sdl.services[key] && value.sdl.services[key].image) {
          image = value.sdl.services[key].image;
        }
        if (value.sdl.profiles.compute[key] && value.sdl.profiles.compute[key].resources) {
          const resources = value.sdl.profiles.compute[key].resources;
          cpu = resources.cpu.units;
          memory = resources.memory.size;
          storage = resources.storage.size;
        }
      }
      count++;
    }
  }
  return {
    key,
    data: {
      dseq: key,
      name: value.appName,
      image,
      cpu,
      memory,
      storage,
      sdl: value.sdl,
    },
  };
};
