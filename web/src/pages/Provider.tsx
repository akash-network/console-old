import { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import ProviderDetails from '../components/ProviderDetails';

export default function MyDeployments() {
  const { providerId } = useParams();

  return (
    <Suspense fallback={<div className="mt-8 ml-16">Loading...</div>}>
      {providerId && <ProviderDetails providerId={providerId} />}
    </Suspense>
  );
}
