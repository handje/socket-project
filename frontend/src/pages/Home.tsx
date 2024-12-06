import { useNavigate } from "react-router-dom";
import "../styles/home.css";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="flex" id="home">
      <h1>Socket Exercise</h1>
      <div className="flex container">
        <button
          onClick={() => {
            navigate("/chatting");
          }}
        >
          Chatting
        </button>
        <button
          onClick={() => {
            navigate("/slack");
          }}
        >
          Slack
        </button>
      </div>
    </div>
  );
};
export default Home;
