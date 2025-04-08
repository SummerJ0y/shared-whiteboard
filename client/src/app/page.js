// "use client";
// import { useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation"; // for App Router
// import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
// import DrawPanel from "./draw/draw";
// import DrawToolBar from "./components/drawToolBar";
// import TextToolBar from "./components/textToolBar";
// import styles from "./page.module.css";

// export default function Home() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const canvasId = searchParams.get("canvas");

//   useEffect(() => {
//     if (canvasId) {
//       console.log("Joining existing canvas:", canvasId);
//       return;
//     }

//     const createCanvasAndRedirect = async () => {
//       try {
//         const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/create-canvas`);
//         const data = await res.json();
//         const canvasId = data.canvasId;
//         // Redirect to board page
//         router.push(`/?canvas=${canvasId}`); // query-style
//         // router.push(`/board/${canvasId}`); this is a better format but need to update backend to handle
//       } catch (err) {
//         console.error("Failed to create canvas:", err);
//       }
//     };

//     createCanvasAndRedirect();
//   }, [canvasId]);
//   return (
//     <div className={styles.main}>
//       <PanelGroup direction="horizontal">
//           <Panel defaultSize={50}>
//             <div className={styles.grid}>
//               <TextToolBar />
//               <div className={styles.canvasContainer} style={{borderRight: '1px solid lightgray'}}>
//                 <div style={{ margin: "auto", display: "flex", flexDirection: "column" }}>
//                   <div className={styles.canvasText}></div> {/* text canvas here */}
//                 </div>
//               </div>      
//             </div>
//           </Panel>
//           <PanelResizeHandle />
//           <Panel defaultSize={50}>
//             <div className={styles.grid}>
//               <DrawToolBar />
//               <div className={styles.canvasContainer} style={{borderLeft: '1px solid lightgray'}}>
//                 <div style={{ margin: "auto", display: "flex", flexDirection: "column" }}>
//                   <DrawPanel />
//                 </div>
//               </div>
//             </div>
//           </Panel>      
//       </PanelGroup>
//     </div>
//   );
// }

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

  return <p>Creating your whiteboard...</p>;
}