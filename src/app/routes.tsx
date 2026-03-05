import { createBrowserRouter } from "react-router";
import { MapView } from "./components/MapView";
import { CaptureView } from "./components/CaptureView";
import { ProfileView } from "./components/ProfileView";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: MapView },
      { path: "capture", Component: CaptureView },
      { path: "profile", Component: ProfileView },
    ],
  },
]);
