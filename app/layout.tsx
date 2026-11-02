import './globals.css';

export const metadata = { title: 'BassPath', description: 'A steady four-string bass learning path.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
