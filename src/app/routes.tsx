import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";

// Lazy-load all route components so the initial bundle is small and the splash shows immediately.
const Layout = lazy(() => import("./components/Layout").then((m) => ({ default: m.Layout })));
const MapView = lazy(() => import("./components/MapView").then((m) => ({ default: m.MapView })));
const ProfileView = lazy(() => import("./components/ProfileView").then((m) => ({ default: m.ProfileView })));
const CaptureView = lazy(() => import("./components/CaptureView").then((m) => ({ default: m.CaptureView })));

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="text-[15px]" style={{ color: "#A39B94" }}>Loading...</div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    Component: () => (
      <Suspense fallback={<PageLoader />}>
        <Layout />
      </Suspense>
    ),
    children: [
      { index: true, Component: () => <Suspense fallback={<PageLoader />}><MapView /></Suspense> },
      { path: "capture", Component: () => <Suspense fallback={<PageLoader />}><CaptureView /></Suspense> },
      { path: "profile", Component: () => <Suspense fallback={<PageLoader />}><ProfileView /></Suspense> },
    ],
  },
], {
  basename: "/emotionsapp",
});
