import { Link, Outlet, useLocation } from "react-router-dom";
import { IoIosHome } from "react-icons/io";

const PageLayout = () => {
  const { pathname } = useLocation();
  return (
    <div id="layout" className="container flex">
      <Link to="/">
        <IoIosHome size={20} />
      </Link>
      <h1>{pathname.split("/")[1]}</h1>
      <div className="container">
        <Outlet />
      </div>
    </div>
  );
};
export default PageLayout;
