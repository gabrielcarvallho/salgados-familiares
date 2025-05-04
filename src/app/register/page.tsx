// app/register/page.tsx
export const dynamic = "force-dynamic";

import RegisterFormClient from "./RegisterFormClient";
import { Metadata } from "next";

// Define the correct props type for Next.js App Router pages
type PageProps = {
  params: { [key: string]: string | string[] };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function RegisterPage({ searchParams }: PageProps) {
  const token = searchParams.token as string || "";

  return <RegisterFormClient token={token} />;
}