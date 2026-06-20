import axios from "axios";
import { adminService } from "../main";
import toast from "react-hot-toast";
import { FiMapPin, FiPhone } from "react-icons/fi";

const AdminRestaurantCard = ({
  restaurant,
  onVerify,
}: {
  restaurant: any;
  onVerify: () => void;
}) => {
  const verify = async () => {
    try {
      await axios.patch(
        `${adminService}/api/v1/verify/restaurant/${restaurant._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Restaurant verified");
      onVerify();
    } catch (error) {
      console.log(error);
      toast.error("Failed to verify restaurant");
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden" style={{ background: "#f3f4f6" }}>
        <img
          src={restaurant.image || ""}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          {restaurant.isVerified ? (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0" }}
            >
              ✓ Verified
            </span>
          ) : (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}
            >
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-base" style={{ color: "#111827" }}>
          {restaurant.name || "Unnamed Restaurant"}
        </h3>

        {restaurant.phone && (
          <div className="flex items-center gap-1.5 text-sm" style={{ color: "#6b7280" }}>
            <FiPhone size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />
            {restaurant.phone}
          </div>
        )}

        {restaurant.autoLocation?.formattedAddress && (
          <div className="flex items-start gap-1.5 text-sm" style={{ color: "#6b7280" }}>
            <FiMapPin size={13} style={{ color: "#9ca3af", flexShrink: 0, marginTop: 2 }} />
            <span className="line-clamp-2">{restaurant.autoLocation.formattedAddress}</span>
          </div>
        )}

        <div className="mt-auto pt-2">
          {!restaurant.isVerified ? (
            <button
              onClick={verify}
              className="w-full py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-colors"
              style={{ background: "#10b981", color: "#ffffff" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#059669")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#10b981")}
            >
              Verify Restaurant
            </button>
          ) : (
            <div
              className="w-full py-2.5 text-sm font-semibold rounded-xl text-center"
              style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
            >
              ✓ Already Verified
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRestaurantCard;
