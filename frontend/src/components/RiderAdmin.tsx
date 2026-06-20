import toast from "react-hot-toast";
import { adminService } from "../main";
import axios from "axios";
import { FiPhone, FiCreditCard } from "react-icons/fi";
import { MdOutlineDirectionsBike } from "react-icons/md";

const RiderAdmin = ({
  rider,
  onVerify,
}: {
  rider: any;
  onVerify: () => void;
}) => {
  const verify = async () => {
    try {
      await axios.patch(
        `${adminService}/api/v1/verify/rider/${rider._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Rider is verified");
      onVerify();
    } catch (error) {
      toast.error("Failed to verify rider");
      console.log(error);
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
    >
      {/* Photo */}
      <div className="relative h-44 overflow-hidden" style={{ background: "#f3f4f6" }}>
        {rider.picture ? (
          <img
            src={rider.picture}
            className="w-full h-full object-cover"
            alt={rider.name || "Rider"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MdOutlineDirectionsBike size={56} style={{ color: "#d1d5db" }} />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          {rider.isVerified ? (
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

        {/* Name overlay */}
        {rider.name && (
          <div
            className="absolute bottom-0 left-0 right-0 px-4 py-2"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }}
          >
            <p className="text-white font-semibold text-sm">{rider.name}</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {rider.phoneNumber && (
          <div className="flex items-center gap-1.5 text-sm" style={{ color: "#6b7280" }}>
            <FiPhone size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />
            {rider.phoneNumber}
          </div>
        )}

        {rider.aadharNumber && (
          <div className="flex items-center gap-1.5 text-sm" style={{ color: "#6b7280" }}>
            <FiCreditCard size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />
            Aadhar: <span style={{ color: "#374151" }}>{rider.aadharNumber}</span>
          </div>
        )}

        {rider.drivingLicenseNumber && (
          <div className="flex items-center gap-1.5 text-sm" style={{ color: "#6b7280" }}>
            <MdOutlineDirectionsBike size={14} style={{ color: "#9ca3af", flexShrink: 0 }} />
            DL: <span style={{ color: "#374151" }}>{rider.drivingLicenseNumber}</span>
          </div>
        )}

        <div className="mt-auto pt-2">
          {!rider.isVerified ? (
            <button
              className="w-full py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-colors"
              style={{ background: "#10b981", color: "#ffffff" }}
              onClick={verify}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#059669")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#10b981")}
            >
              Verify Rider
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

export default RiderAdmin;