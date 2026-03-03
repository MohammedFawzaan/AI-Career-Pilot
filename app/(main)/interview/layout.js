import { Suspense } from "react";

export default function Layout({ children }) {
  return (
    <div className="px-5">
      <Suspense>
        {children}
      </Suspense>
    </div>
  );
}
