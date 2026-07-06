import axios from "axios";
import { useEffect, useState } from "react";
import { adminService } from "../main";
import AdminRestaurantCard from "../components/AdminRestaurantCard";
import RiderAdmin from "../components/RiderAdmin";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiLogOut,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiGrid,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";
import { MdOutlineRestaurant, MdOutlineDirectionsBike } from "react-icons/md";

type Tab = "dashboard" | "restaurant" | "rider";
type Filter = "all" | "verified" | "pending";

interface Stats {
  totalRestaurants: number;
  verifiedRestaurants: number;
  pendingRestaurants: number;
  totalRiders: number;
  verifiedRiders: number;
  pendingRiders: number;
}

const ACCENT_CLASSES: Record<string, { bg: string; text: string }> = {
  "#6366f1": { bg: "bg-indigo-100", text: "text-indigo-600" },
  "#10b981": { bg: "bg-emerald-100", text: "text-emerald-600" },
  "#f59e0b": { bg: "bg-amber-100", text: "text-amber-600" },
};

const getAccentClasses = (accent: string) => ACCENT_CLASSES[accent] ?? { bg: "bg-slate-100", text: "text-slate-700" };

// Shape of each unassigned-order alert
interface UnassignedAlert {
  id: string;          // orderId used as unique key
  orderId: string;
  restaurantId: string;
  message: string;
  timestamp: string;
}

const Admin = () => {
  const { setIsAuth, setUser, user } = useAppData();
  const { socket } = useSocket();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [restaurantFilter, setRestaurantFilter] = useState<Filter>("all");
  const [riderFilter, setRiderFilter] = useState<Filter>("all");
  // Alerts for orders with no rider found after all retries
  const [unassignedAlerts, setUnassignedAlerts] = useState<UnassignedAlert[]>([]);

  const navigate = useNavigate();

  const authHeader = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      // Restaurants — try /all, fallback to /pending
      let restaurantList: any[] = [];
      try {
        const { data } = await axios.get(
          `${adminService}/api/v1/admin/restaurant/all`,
          authHeader
        );
        restaurantList = data.restaurants ?? [];
      } catch {
        const { data } = await axios.get(
          `${adminService}/api/v1/admin/restaurant/pending`,
          authHeader
        );
        restaurantList = data.restaurants ?? [];
      }

      // Riders — try /all, fallback to /pending
      let riderList: any[] = [];
      try {
        const { data } = await axios.get(
          `${adminService}/api/v1/admin/rider/all`,
          authHeader
        );
        riderList = data.riders ?? [];
      } catch {
        const { data } = await axios.get(
          `${adminService}/api/v1/admin/rider/pending`,
          authHeader
        );
        riderList = data.riders ?? [];
      }

      setRestaurants(restaurantList);
      setRiders(riderList);

      // Stats — try endpoint, fallback to compute from data
      try {
        const { data } = await axios.get(
          `${adminService}/api/v1/admin/stats`,
          authHeader
        );
        setStats(data);
      } catch {
        const verifiedR = restaurantList.filter((r) => r.isVerified).length;
        const verifiedRi = riderList.filter((r) => r.isVerified).length;
        setStats({
          totalRestaurants: restaurantList.length,
          verifiedRestaurants: verifiedR,
          pendingRestaurants: restaurantList.length - verifiedR,
          totalRiders: riderList.length,
          verifiedRiders: verifiedRi,
          pendingRiders: riderList.length - verifiedRi,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Listen for "no rider found" alerts from the backend after all retries exhausted
  useEffect(() => {
    if (!socket) return;

    const handleNoRider = (payload: { orderId: string; restaurantId: string; message: string; timestamp: string }) => {
      toast.error(`No rider found for order!`, { duration: 6000 });
      setUnassignedAlerts((prev) => [
        // Put newest alert at the top, avoid duplicates
        { id: payload.orderId, ...payload },
        ...prev.filter((a) => a.id !== payload.orderId),
      ]);
    };

    socket.on("admin:no_rider_found", handleNoRider);

    return () => {
      socket.off("admin:no_rider_found", handleNoRider);
    };
  }, [socket]);

  const logoutHandler = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
    toast.success("Logout Successfully");
  };

  const filteredRestaurants = restaurants.filter((r) => {
    if (restaurantFilter === "verified") return r.isVerified === true;
    if (restaurantFilter === "pending") return !r.isVerified;
    return true;
  });

  const filteredRiders = riders.filter((r) => {
    if (riderFilter === "verified") return r.isVerified === true;
    if (riderFilter === "pending") return !r.isVerified;
    return true;
  });

  const navItems = [
    { id: "dashboard" as Tab, label: "Dashboard", icon: <FiGrid size={17} /> },
    { id: "restaurant" as Tab, label: "Restaurants", icon: <MdOutlineRestaurant size={18} /> },
    { id: "rider" as Tab, label: "Riders", icon: <MdOutlineDirectionsBike size={18} /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-950">

      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-white border-r-2 border-slate-200">
        {/* Logo */}
        <div className="px-5 py-5 border-b-2 border-slate-200">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-bold text-3xl text-[#E23744] leading-none">Foodify</p>
            </div>
          </div>
        </div>

        {/* Admin info */}
        <div className="px-4 py-4 border-b-2 border-slate-200">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-100">
            {user?.image ? (
              <img src={user.image} className="w-8 h-8 rounded-lg object-cover" alt="admin" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200">
                <FiUsers size={14} className="text-slate-400" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-slate-950">{user?.name || "Admin"}</p>
              <p className="text-xs truncate text-slate-400">{user?.email || ""}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer text-left ${isActive ? "bg-gray-100 text-slate-500 border border-gray-200" : "bg-transparent text-slate-500 border border-transparent"}`}
              >
                {item.icon}
                {item.label}
                {item.id === "restaurant" && stats && stats.pendingRestaurants > 0 && (
                  <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                    {stats.pendingRestaurants}
                  </span>
                )}
                {item.id === "rider" && stats && stats.pendingRiders > 0 && (
                  <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                    {stats.pendingRiders}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-200">
          <button
            onClick={logoutHandler}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer text-slate-500 hover:text-red-500 hover:bg-red-50"
          >
            <FiLogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto">

        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-white backdrop-blur border-b-2 border-slate-200">
          <div>
            <h2 className="font-bold text-2xl text-slate-850">
              {tab === "dashboard" && "Dashboard"}
              {tab === "restaurant" && "Restaurants"}
              {tab === "rider" && "Riders"}
            </h2>
            <p className="text-xs mt-0.5 text-slate-400">
              {tab === "dashboard" && "Platform overview"}
              {tab === "restaurant" && `${restaurants.length} total registered`}
              {tab === "rider" && `${riders.length} total registered`}
            </p>
          </div>
        </div>

        <div className="px-8 py-6">

          {/* ══ UNASSIGNED ORDER ALERTS ══ */}
          {unassignedAlerts.length > 0 && (
            <div className="mb-5 space-y-2">
              {unassignedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50"
                >
                  <FiAlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-700">
                      Manual Assignment Required
                    </p>
                    <p className="text-xs text-red-500 mt-0.5">
                      Order <span className="font-mono font-bold">{alert.orderId}</span> —
                      no rider found within 2km after 3 attempts.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setUnassignedAlerts((prev) => prev.filter((a) => a.id !== alert.id))
                    }
                    title="Dismiss alert"
                    aria-label="Dismiss alert"
                    className="text-red-400 hover:text-red-600 cursor-pointer flex-shrink-0"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ══ DASHBOARD ══ */}
          {tab === "dashboard" && stats && (
            <div className="space-y-5">
              {/* Stats grid */}
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                <StatCard icon={<MdOutlineRestaurant size={20} />} label="Total Restaurants"    value={stats.totalRestaurants}    accent="#6366f1" />
                <StatCard icon={<FiCheckCircle size={18} />}       label="Verified Restaurants" value={stats.verifiedRestaurants} accent="#10b981" />
                <StatCard icon={<FiClock size={18} />}             label="Pending Restaurants"  value={stats.pendingRestaurants}  accent="#f59e0b" alert={stats.pendingRestaurants > 0} />
                <StatCard icon={<MdOutlineDirectionsBike size={20} />} label="Total Riders"     value={stats.totalRiders}         accent="#6366f1" />
                <StatCard icon={<FiCheckCircle size={18} />}       label="Verified Riders"      value={stats.verifiedRiders}      accent="#10b981" />
                <StatCard icon={<FiClock size={18} />}             label="Pending Riders"       value={stats.pendingRiders}       accent="#f59e0b" alert={stats.pendingRiders > 0} />
              </div>              
            </div>
          )}

          {/* ══ RESTAURANTS ══ */}
          {tab === "restaurant" && (
            <div className="space-y-4">
              <FilterBar
                filter={restaurantFilter}
                setFilter={setRestaurantFilter}
                counts={{
                  all: restaurants.length,
                  verified: restaurants.filter((r) => r.isVerified).length,
                  pending: restaurants.filter((r) => !r.isVerified).length,
                }}
              />
              {filteredRestaurants.length === 0 ? (
                <EmptyState label={restaurantFilter} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredRestaurants.map((r) => (
                    <AdminRestaurantCard key={r._id} restaurant={r} onVerify={() => fetchData(true)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ RIDERS ══ */}
          {tab === "rider" && (
            <div className="space-y-4">
              <FilterBar
                filter={riderFilter}
                setFilter={setRiderFilter}
                counts={{
                  all: riders.length,
                  verified: riders.filter((r) => r.isVerified).length,
                  pending: riders.filter((r) => !r.isVerified).length,
                }}
              />
              {filteredRiders.length === 0 ? (
                <EmptyState label={riderFilter} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredRiders.map((r) => (
                    <RiderAdmin key={r._id} rider={r} onVerify={() => fetchData(true)} />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

/* ── StatCard ── */
const StatCard = ({
  icon, label, value, accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
  alert?: boolean;
}) => {
  const accentClass = getAccentClasses(accent);
  return (
    <div className={`rounded-2xl p-5 border-2 flex items-center gap-4 transition-all duration-200 bg-white border-slate-200`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accentClass.bg} ${accentClass.text}`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-850">{value}</p>
        <p className="text-xs mt-0.5 text-slate-500">{label}</p>
      </div>
    </div>
  );
};

/* ── FilterBar ── */
const FilterBar = ({
  filter, setFilter, counts,
}: {
  filter: Filter;
  setFilter: (v: Filter) => void;
  counts: Record<Filter, number>;
}) => (
  <div className="flex gap-2">
    {(["all", "verified", "pending"] as Filter[]).map((f) => (
      <button
        key={f}
        onClick={() => setFilter(f)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all duration-150 capitalize ${filter === f ? "bg-gray-100 text-slate-600 border border-slate-200" : "bg-white text-slate-500 border border-slate-200"}`}
      >
        {f}
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === f ? "bg-slate-200 text-slate-600" : "bg-slate-100 text-slate-400"}`}>
          {counts[f]}
        </span>
      </button>
    ))}
  </div>
);

/* ── EmptyState ── */
const EmptyState = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-slate-100 border border-slate-200">
      <FiUsers size={26} className="text-slate-300" />
    </div>
    <p className="font-medium text-slate-500">No {label === "all" ? "" : label} entries found</p>
    <p className="text-sm mt-1 text-slate-300">Nothing to display here.</p>
  </div>
);

export default Admin;
