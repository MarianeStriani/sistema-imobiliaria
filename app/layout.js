import "bootstrap/dist/css/bootstrap.min.css";
import LogoutButton from "./components/LogoutButton";

export const metadata = {
  title: "ImobGest",
  description: "Sistema de administração de imóveis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}