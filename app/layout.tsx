import '../globals.css'
export const metadata = { title: 'HakiTally - Mumias East', description: 'Live 34A Tally' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
