'use client';
import { type ReactElement, useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function HomePage(): ReactElement {

  const router = useRouter();

  useEffect(() => { router.push("/signin") }, []);

  return (<main></main>);
}
