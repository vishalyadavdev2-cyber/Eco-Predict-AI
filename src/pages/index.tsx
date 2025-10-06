import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the Dashboard when the component mounts
    router.push('/dashboard');
  }, [router]);

  // Optional: Show a loading state or blank page while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Dashboard...</p>
      </div>
    </div>
  );
};

export default Home;
