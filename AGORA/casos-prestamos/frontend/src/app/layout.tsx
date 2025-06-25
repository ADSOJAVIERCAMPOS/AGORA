import './globals.css';

export const metadata = {
  title: 'Coordinacion ADSO - Gestión de casos',
  description: 'Sistema de Gestión de Casos - Coordinacion ADSO',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-white">
        {children}
      </body>
    </html>
  );
}