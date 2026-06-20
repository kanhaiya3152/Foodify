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
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: "#13161f", border: "1px solid #1f2231" }}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden" style={{ background: "#1a1d2a" }}>
        <img
          src={restaurant.image || ""}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        {/* Status badge top-right */}
        <div className="absolute top-3 right-3">
          {restaurant.isVerified ? (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "#052e16", color: "#4ade80", border: "1px solid #14532d" }}
            >
              ✓ Verified
            </span>
          ) : (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "#1c1500", color: "#fbbf24", border: "1px solid #3a2f0a" }}
            >
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-base text-white">{restaurant.name || "Unnamed Restaurant"}</h3>

        {restaurant.phone && (
          <div className="flex items-center gap-1.5 text-sm" style={{ color: "#9ca3af" }}>
            <FiPhone size={13} style={{ color: "#6b7280", flexShrink: 0 }} />
            {restaurant.phone}
          </div>
        )}

        {restaurant.autoLocation?.formattedAddress && (
          <div className="flex items-start gap-1.5 text-sm" style={{ color: "#9ca3af" }}>
            <FiMapPin size={13} style={{ color: "#6b7280", flexShrink: 0, marginTop: 2 }} />
            <span className="line-clamp-2">{restaurant.autoLocation.formattedAddress}</span>
          </div>
        )}

        <div className="mt-auto pt-2">
          {!restaurant.isVerified ? (
            <button
              onClick={verify}
              className="w-full py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-colors"
              style={{ background: "#10b981", color: "#fff" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#059669")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#10b981")}
            >
              Verify Restaurant
            </button>
          ) : (
            <div
              className="w-full py-2.5 text-sm font-semibold rounded-xl text-center"
              style={{ background: "#052e16", color: "#4ade80", border: "1px solid #14532d" }}
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
