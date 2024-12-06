import { Link, Outlet } from "react-router-dom";
import { IoIosHome } from "react-icons/io";

const PageLayout = () => {
  return (
    <>
      <Link to="/">
        <IoIosHome size={20} />
      </Link>
      <Outlet />
    </>
  );
};
export default PageLayout;
