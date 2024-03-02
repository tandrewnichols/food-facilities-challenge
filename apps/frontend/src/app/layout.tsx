import './styles.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Nav from '@components/navbar/nav';

export const metadata = {
  title: 'Food Facilities Challenge',
  description: 'A RadAI Project',
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/radai.jpeg" sizes="any" />
      </head>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
