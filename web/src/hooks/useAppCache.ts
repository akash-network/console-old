import { useEffect, useState } from 'react';
import { SDLSpec } from '../components/SdlConfiguration/settings';

type Application = {
  name: string;
  sdl: SDLSpec;
};

function useAppCache(dseq: string | undefined) {
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    const cachedValue = dseq ? localStorage.getItem(dseq) : null;

    const app = cachedValue ? (JSON.parse(cachedValue) as Application) : null;

    setApplication(app);
  }, [dseq]);

  return application;
}

export default useAppCache;
