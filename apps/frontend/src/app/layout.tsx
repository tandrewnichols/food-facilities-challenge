import '@tailwind/styles.css';
import '@fortawesome/fontawesome-svg-core/styles.css';

export const metadata = {
  title: 'Food Facilities Challenge',
  description: 'A RadAI Project',
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
