import axios from "axios";
import { useEffect, useState } from "react";
import { adminService } from "../main";
import AdminRestaurantCard from "../components/AdminRestaurantCard";
import RiderAdmin from "../components/RiderAdmin";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiLogOut,
  FiHome,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiGrid,
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

const Admin = () => {
  const { setIsAuth, setUser, user } = useAppData();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [restaurantFilter, setRestaurantFilter] = useState<Filter>("all");
  const [riderFilter, setRiderFilter] = useState<Filter>("all");

  const navigate = useNavigate();

  const authHeader = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f9fafb" }}>
        <div className="text-center space-y-4">
          <div
            className="w-10 h-10 rounded-full border-4 animate-spin mx-auto"
            style={{ borderColor: "#e5e7eb", borderTopColor: "#6366f1" }}
          />
          <p style={{ color: "#6b7280" }} className="text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#f9fafb", color: "#111827" }}>

      {/* ── Sidebar ── */}
      <aside
        className="w-60 flex-shrink-0 flex flex-col"
        style={{ background: "#ffffff", borderRight: "1px solid #e5e7eb" }}
      >
        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: "1px solid #e5e7eb" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#6366f1" }}
            >
              <FiHome size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-base leading-none" style={{ color: "#111827" }}>Foodify</p>
              <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Admin info */}
        <div className="px-4 py-4" style={{ borderBottom: "1px solid #e5e7eb" }}>
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: "#f3f4f6" }}
          >
            {user?.image ? (
              <img src={user.image} className="w-8 h-8 rounded-lg object-cover" alt="admin" />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "#e5e7eb" }}
              >
                <FiUsers size={14} style={{ color: "#9ca3af" }} />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "#111827" }}>{user?.name || "Admin"}</p>
              <p className="text-xs truncate" style={{ color: "#9ca3af" }}>{user?.email || ""}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer text-left"
              style={
                tab === item.id
                  ? { background: "#eef2ff", color: "#4f46e5", border: "1px solid #c7d2fe" }
                  : { background: "transparent", color: "#6b7280", border: "1px solid transparent" }
              }
            >
              {item.icon}
              {item.label}
              {item.id === "restaurant" && stats && stats.pendingRestaurants > 0 && (
                <span
                  className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "#f59e0b", color: "#fff" }}
                >
                  {stats.pendingRestaurants}
                </span>
              )}
              {item.id === "rider" && stats && stats.pendingRiders > 0 && (
                <span
                  className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "#f59e0b", color: "#fff" }}
                >
                  {stats.pendingRiders}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4" style={{ borderTop: "1px solid #e5e7eb" }}>
          <button
            onClick={logoutHandler}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer"
            style={{ color: "#6b7280" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
              (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#6b7280";
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            <FiLogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto">

        {/* Top bar */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-8 py-4"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div>
            <h2 className="font-bold text-lg" style={{ color: "#111827" }}>
              {tab === "dashboard" && "Dashboard"}
              {tab === "restaurant" && "Restaurants"}
              {tab === "rider" && "Riders"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
              {tab === "dashboard" && "Platform overview"}
              {tab === "restaurant" && `${restaurants.length} total registered`}
              {tab === "rider" && `${riders.length} total registered`}
            </p>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
            style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", color: "#6b7280" }}
          >
            <FiRefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="px-8 py-6">

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

              {/* Progress bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProgressCard
                  title="Restaurant Verification"
                  icon={<MdOutlineRestaurant size={15} />}
                  verified={stats.verifiedRestaurants}
                  total={stats.totalRestaurants}
                  barColor="#6366f1"
                />
                <ProgressCard
                  title="Rider Verification"
                  icon={<MdOutlineDirectionsBike size={15} />}
                  verified={stats.verifiedRiders}
                  total={stats.totalRiders}
                  barColor="#10b981"
                />
              </div>

              {/* Pending alert */}
              {(stats.pendingRestaurants > 0 || stats.pendingRiders > 0) && (
                <div
                  className="px-5 py-4 rounded-xl flex items-start gap-3"
                  style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
                >
                  <FiClock size={18} style={{ color: "#f59e0b", marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#92400e" }}>
                      Pending verifications need attention
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#b45309" }}>
                      {stats.pendingRestaurants > 0 && `${stats.pendingRestaurants} restaurant${stats.pendingRestaurants > 1 ? "s" : ""} `}
                      {stats.pendingRestaurants > 0 && stats.pendingRiders > 0 && "and "}
                      {stats.pendingRiders > 0 && `${stats.pendingRiders} rider${stats.pendingRiders > 1 ? "s" : ""} `}
                      awaiting approval.
                    </p>
                  </div>
                </div>
              )}
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
  icon, label, value, accent, alert,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
  alert?: boolean;
}) => (
  <div
    className="rounded-2xl p-5 flex items-center gap-4 transition-all duration-200"
    style={{
      background: "#ffffff",
      border: `1px solid ${alert ? "#fde68a" : "#e5e7eb"}`,
    }}
  >
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: accent + "18", color: accent }}
    >
      {icon}
    </div>
    <div>
      <p className="text-3xl font-bold" style={{ color: "#111827" }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>{label}</p>
    </div>
  </div>
);

/* ── ProgressCard ── */
const ProgressCard = ({
  title, icon, verified, total, barColor,
}: {
  title: string;
  icon: React.ReactNode;
  verified: number;
  total: number;
  barColor: string;
}) => {
  const pct = total > 0 ? Math.round((verified / total) * 100) : 0;
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span style={{ color: barColor }}>{icon}</span>
        <p className="text-sm font-semibold" style={{ color: "#111827" }}>{title}</p>
        <span className="ml-auto text-lg font-bold" style={{ color: barColor }}>{pct}%</span>
      </div>
      <div className="w-full h-2 rounded-full" style={{ background: "#f3f4f6" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      <div className="flex justify-between mt-3 text-xs" style={{ color: "#9ca3af" }}>
        <span><span style={{ color: "#111827" }} className="font-medium">{verified}</span> verified</span>
        <span><span style={{ color: "#111827" }} className="font-medium">{total}</span> total</span>
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
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all duration-150 capitalize"
        style={
          filter === f
            ? { background: "#6366f1", color: "#ffffff", border: "1px solid #6366f1" }
            : { background: "#ffffff", color: "#6b7280", border: "1px solid #e5e7eb" }
        }
      >
        {f}
        <span
          className="text-xs px-1.5 py-0.5 rounded-full font-bold"
          style={
            filter === f
              ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
              : { background: "#f3f4f6", color: "#9ca3af" }
          }
        >
          {counts[f]}
        </span>
      </button>
    ))}
  </div>
);

/* ── EmptyState ── */
const EmptyState = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: "#f3f4f6", border: "1px solid #e5e7eb" }}
    >
      <FiUsers size={26} style={{ color: "#d1d5db" }} />
    </div>
    <p style={{ color: "#6b7280" }} className="font-medium">No {label === "all" ? "" : label} entries found</p>
    <p style={{ color: "#d1d5db" }} className="text-sm mt-1">Nothing to display here.</p>
  </div>
);

export default Admin;
