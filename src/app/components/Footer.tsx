import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-neutral-light py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Branding */}
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:scale-105 transition-transform">
            Squabbl
          </Link>

          {/* Navigation */}
          <Link 
            href="/" 
            className="text-sm text-neutral-dark hover:text-primary transition-colors hover:scale-105 transition-transform"
          >
            Back to Home
          </Link>

          {/* Copyright */}
          <p className="text-sm text-neutral-dark">
            © {currentYear} Squabbl. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}