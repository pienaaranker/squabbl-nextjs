import Link from 'next/link';
import { AnimatedIcon } from './components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-softwhite">
      <div className="w-full max-w-md card card-accent border-2 border-sky-300 p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 font-poppins">Page Not Found</h2>
        <div className="flex justify-center mb-6">
          <AnimatedIcon 
            icon="🔍" 
            color="sunny" 
            size="xl" 
            animation="bounce" 
          />
        </div>
        <p className="text-slate-700 mb-6 bg-white p-4 rounded-xl font-nunito">
          We couldn't find the page you're looking for.
        </p>
        <Link href="/" className="btn btn-primary inline-block w-full">
          Return Home
        </Link>
      </div>
    </div>
  );
} 