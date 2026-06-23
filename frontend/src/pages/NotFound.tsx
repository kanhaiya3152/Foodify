import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "#f9fafb" }}
    >
      {/* Big 404 number */}
      <div className="relative select-none mb-2">
        <p
          className="font-black leading-none"
          style={{
            fontSize: "clamp(8rem, 25vw, 18rem)",
            color: "#f3f4f6",
            letterSpacing: "-0.05em",
          }}
        >
          404
        </p>

        {/* Floating food emoji */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
        >
          🍕
        </div>
      </div>

      {/* Heading */}
      <h1
        className="font-bold mb-3"
        style={{
          fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
          color: "#111827",
        }}
      >
        Oops! Page not found
      </h1>

      {/* Subtitle */}
      <p
        className="max-w-md mb-8 leading-relaxed"
        style={{ color: "#6b7280", fontSize: "1rem" }}
      >
        Looks like this page went out for delivery and never came back.
        The URL you entered doesn't exist.
      </p>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer"
          style={{ background: "#6366f1", color: "#ffffff" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#4f46e5")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#6366f1")
          }
        >
          🏠 Go to Home
        </button>

        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer"
          style={{
            background: "#ffffff",
            color: "#374151",
            border: "1px solid #e5e7eb",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
          }}
        >
          ← Go Back
        </button>
      </div>

      {/* Bottom hint */}
      <p className="mt-10 text-xs" style={{ color: "#d1d5db" }}>
        Foodify © {new Date().getFullYear()}
      </p>
    </div>
  );
};

export default NotFound;
