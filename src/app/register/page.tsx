// app/register/page.tsx
// NÃO coloque "use client" aqui
export const dynamic = "force-dynamic";

import RegisterFormClient from "./RegisterFormClient";

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token ?? "";

  return <RegisterFormClient token={token} />;
}
