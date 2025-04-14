import Link from 'next/link';

export default function Layout({ children, title, backLink = '/' }) {
  return (
    <div className="min-h-screen bg-background-dark text-text-primary">
      <header className="bg-background-card py-4 mb-8 border-b border-border-primary shadow-sm">
        <div className="container mx-auto px-4">
          <Link href={backLink} className="inline-flex items-center mb-2 text-primary-500 hover:text-primary-400 transition-colors">
            <span className="mr-1">←</span> Home
          </Link>
          <h1 className="text-2xl font-bold text-primary-500">{title}</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 pb-12">
        {children}
      </main>
    </div>
  );
}