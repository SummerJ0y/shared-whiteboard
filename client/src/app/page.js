'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const createAndRedirect = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/create-canvas`);
        const data = await res.json();
        const canvasId = data.canvasId;
        router.push(`/id/${canvasId}`);
        window.location.href = `/id/${canvasId}`;
      } catch (err) {
        console.error("Failed to create canvas:", err);
      }
    };

    createAndRedirect();
  }, []);

  return <p>Creating your whiteboard, please wait a few seconds...</p>;
}