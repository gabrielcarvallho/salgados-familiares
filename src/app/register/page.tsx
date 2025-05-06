// app/register/page.tsx
export const dynamic = "force-dynamic";

import RegisterFormClient from "./RegisterFormClient";


export default function RegisterPage({ searchParams }: any) {
  const token = searchParams.token as string || "";

  return <RegisterFormClient token={token} />;
}