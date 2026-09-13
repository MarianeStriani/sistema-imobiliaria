export const metadata = {
  title: "Sistema Imobiliária",
  description: "Sistema de administração de imóveis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
