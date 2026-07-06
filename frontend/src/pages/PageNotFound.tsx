import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gray-50">
      <div className="relative select-none mb-2">
        <p
          className="font-black leading-none text-gray-600 tracking-tighter"
          style={{
            fontSize: "clamp(8rem, 25vw, 18rem)",
          }}
        >
          404
        </p>
      </div>

      <h1
        className="font-bold mb-3 text-gray-900"
        style={{
          fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
        }}
      >
        Oops! Page not found
      </h1>

      <p className="max-w-md mb-8 leading-relaxed text-gray-500 text-base">
        Looks like this page went out for delivery and never came back.
        The URL you entered doesn't exist.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer bg-indigo-500 text-white hover:bg-indigo-600"
        >
          Go to Home
        </button>

        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
        >
          ← Go Back
        </button>
      </div>

      <p className="mt-10 text-xs text-gray-400">
        Foodify © {new Date().getFullYear()}
      </p>
    </div>
  );
};

export default PageNotFound;
