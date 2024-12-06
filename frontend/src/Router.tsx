import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Chatting from "./pages/Chatting";
import Slack from "./pages/Slack";
import PageLayout from "./components/PageLayout";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    element: <PageLayout />,
    children: [
      {
        path: "chatting",
        element: <Chatting />,
      },
      {
        path: "slack",
        element: <Slack />,
      },
    ],
  },
]);

export default Router;
