import { redirect } from "next/navigation";

export default function RootPage() {
  // O middleware intercepta e redireciona automaticamente para /dashboard ou /login
  // Esta diretiva atua como fallback garantido em nível de componente de rota
  redirect("/dashboard");
}
