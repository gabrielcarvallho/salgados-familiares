// NÃO coloque "use client" aqui
export const dynamic = "force-dynamic"; // garante que a página seja sempre dinâmica

import RegisterFormClient from "./RegisterFormClient";

interface RegisterPageProps {
  searchParams: {
    token?: string
  }
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  const token = searchParams.token || "";

  return <RegisterFormClient token={token} />;
}
