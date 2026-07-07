import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { BiUpload } from "react-icons/bi";
import type { IOrder } from "../types";
import audio from "../assets/quack.mp3";
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOrderMap";

interface IRider {
  _id: string;
  phoneNumber: string;
  aadharNumber: string;
  drivingLicenseNumber: string;
  picture: string;
  isVerified: boolean;
  isAvailble: boolean;
  lastActiveAt?: string;
  createdAt?: string;
}

const RiderDashboard = () => {
  const navigate = useNavigate();
  const { user, setUser, setIsAuth } = useAppData();
  const { socket } = useSocket();

  const [profile, setProfile] = useState<IRider | null>(null);
  const [loading, setLoading] = useState(true);

  const [toggling, setToggling] = useState(false);

  const [incomingOrders, setIncomingOrders] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);

  const [activeTab, setActiveTab] = useState<"dashboard" | "history" | "profile">("dashboard");
  const [historyOrders, setHistoryOrders] = useState<IOrder[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const logoutHandler = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuth(false);
    toast.success("Logout Successfully");
    navigate("/login");
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const { data } = await axios.get(`${riderService}/api/rider/order/history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setHistoryOrders(data.orders || []);
    } catch (error) {
      console.log(error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchHistory();
    }
  }, [profile]);


  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audio);
    audioRef.current.preload = "auto";
  }, []);

  const unlockAudio = async () => {
    try {
      if (!audioRef.current) return;
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioUnlocked(true);
      toast.success("Sound Enabled");
    } catch (error) {
      console.log(error);
      toast.error("Tap again to enable sound");
    }
  };

  useEffect(() => {
    if (!socket) return;

    const onOrderAvailable = ({ orderId }: { orderId: string }) => {
      setIncomingOrders((prev) =>
        prev.includes(orderId) ? prev : [...prev, orderId]
      );

      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      setTimeout(() => {
        setIncomingOrders((prev) => prev.filter((id) => id !== orderId));
      }, 10000);
    };

    socket.on("order:available", onOrderAvailable);

    return () => {
      socket.off("order:available", onOrderAvailable);
    };
  }, [socket, audioUnlocked]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${riderService}/api/rider/myprofile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setProfile(data || null);
    } catch (error) {
      console.log(error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "rider") fetchProfile();
    else setLoading(false);
  }, [user]);

  const fetchCurrentOrder = async () => {
    try {
      const { data } = await axios.get(
        `${riderService}/api/rider/order/current`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setCurrentOrder(data.order);
    } catch (error) {
      console.log(error);
      setCurrentOrder(null);
    }
  };

  useEffect(() => {
    fetchCurrentOrder();
  }, []);

  const toggleAvailiblity = async () => {
    if (!navigator.geolocation) {
      toast.error("Location Access Required");
      return;
    }

    setToggling(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await axios.patch(
          `${riderService}/api/rider/toggle`,
          {
            isAvailble: !profile?.isAvailble,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        toast.success(
          profile?.isAvailble ? "You are offline" : "You are online"
        );
        fetchProfile();
      } catch (error: any) {
        toast.error(error.response.data.message);
      } finally {
        setToggling(false);
      }
    });
  };

  const [phoneNumber, setPhoneNumber] = useState("");
  const [aadharNumber, setaadharNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!navigator.geolocation) {
      toast.error("Location Access Required");
      return;
    }

    setSubmitting(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const formData = new FormData();

      formData.append("phoneNumber", phoneNumber);
      formData.append("aadharNumber", aadharNumber);
      formData.append("drivingLicenseNumber", drivingLicenseNumber);
      formData.append("latitude", pos.coords.latitude.toString());
      formData.append("longitude", pos.coords.longitude.toString());

      if (image) {
        formData.append("file", image);
      }

      try {
        const { data } = await axios.post(
          `${riderService}/api/rider/new`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        toast.success(data.message);
        fetchProfile();
      } catch (error: any) {
        toast.error(error.response.data.message);
      } finally {
        setSubmitting(false);
      }
    });
  };

  if (user?.role !== "rider") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        You are not registered as a rider
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        Loading rider details...
      </div>
    );
  }

  if (!profile)
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm space-y-5">
          <h1 className="text-xl font-semibold">Add Your Profile</h1>
          <input
            type="number"
            placeholder="Aadhar number"
            value={aadharNumber}
            onChange={(e) => setaadharNumber(e.target.value)}
            className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
          />
          <input
            type="number"
            placeholder="Contact Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
          />

          <input
            type="text"
            placeholder="driving Licence"
            value={drivingLicenseNumber}
            onChange={(e) => setDrivingLicenseNumber(e.target.value)}
            className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
          />

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm text-gray-600 hover:bg-gray-50">
            <BiUpload className="h-5 w-5 text-red-500" />
            {image ? image.name : "Upload your image"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </label>

          <button
            className="w-full rounded-lg py-3 text-sm font-semibold text-white bg-[#e23744]"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting..." : "Add Profile"}
          </button>
        </div>
      </div>
    );
  const deliveredOrders = historyOrders.filter((o) => o.status === "delivered");
  const totalRevenue = deliveredOrders.reduce(
    (acc, o) => acc + (o.riderAmount || 0),
    0
  );
  const totalDistance = deliveredOrders.reduce(
    (acc, o) => acc + (o.distance || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-4 px-4 space-y-6">
      {/* 3-Tab Navigation Header */}
      <div className="bg-white rounded-xl shadow-sm p-1.5 flex justify-around border border-gray-100 max-w-2xl mx-auto">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 py-2.5 px-3 rounded-lg font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 ${
            activeTab === "dashboard"
              ? "bg-[#e23744] text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span>🛵</span> Active Delivery
        </button>
        <button
          onClick={() => {
            setActiveTab("history");
            fetchHistory();
          }}
          className={`flex-1 py-2.5 px-3 rounded-lg font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 ${
            activeTab === "history"
              ? "bg-[#e23744] text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span>📊</span> Earnings & History
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-2.5 px-3 rounded-lg font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 ${
            activeTab === "profile"
              ? "bg-[#e23744] text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span>👤</span> My Profile
        </button>
      </div>

      {/* TAB 1: ACTIVE DELIVERY DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Quick status card */}
          <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={profile.picture}
                  className="h-14 w-14 rounded-full object-cover border-2 border-red-500 shadow-sm"
                  alt=""
                />
                <div>
                  <p className="font-bold text-gray-800 text-base">{user?.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-100 text-green-700 font-semibold border border-green-200">
                      {profile.isVerified ? "✓ Verified Partner" : "Pending"}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-full font-semibold ${
                        profile.isAvailble
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {profile.isAvailble ? "● Online" : "○ Offline"}
                    </span>
                  </div>
                </div>
              </div>

              {profile.isVerified && !currentOrder && (
                <button
                  onClick={toggleAvailiblity}
                  disabled={toggling}
                  className={`px-4 py-2 rounded-lg text-white text-xs sm:text-sm font-semibold transition shadow-sm ${
                    toggling
                      ? "bg-gray-400"
                      : profile.isAvailble
                      ? "bg-gray-700 hover:bg-gray-800"
                      : "bg-[#e23744] hover:bg-red-600"
                  }`}
                >
                  {toggling
                    ? "Updating..."
                    : profile.isAvailble
                    ? "Go Offline"
                    : "Go Online"}
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              💡 Keep your status Online to receive incoming food delivery requests from nearby restaurants in real-time.
            </p>
          </div>

          {!audioUnlocked && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <p className="font-semibold text-blue-900 text-sm">
                    Enable Sound Notification
                  </p>
                  <p className="text-xs text-blue-700">
                    Get alerted instantly when new orders arrive
                  </p>
                </div>
              </div>

              <button
                onClick={unlockAudio}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm"
              >
                Enable sound
              </button>
            </div>
          )}

          {profile.isAvailble && incomingOrders.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                <span className="animate-bounce">🚨</span> New Incoming Order Requests
              </h3>
              {incomingOrders.map((id) => (
                <RiderOrderRequest
                  key={id}
                  orderId={id}
                  onAccepted={() => {
                    fetchProfile();
                    fetchCurrentOrder();
                    fetchHistory();
                  }}
                />
              ))}
            </div>
          )}

          {currentOrder ? (
            <div className="space-y-4">
              <RiderCurrentOrder
                order={currentOrder}
                onStatusUpdate={() => {
                  fetchCurrentOrder();
                  fetchHistory();
                }}
              />
              <RiderOrderMap order={currentOrder} />
            </div>
          ) : (
            profile.isAvailble &&
            incomingOrders.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100 space-y-3">
                <div className="text-4xl animate-pulse">🛵</div>
                <h3 className="font-bold text-gray-800 text-base">
                  Waiting for Delivery Requests...
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  You are online and active. As soon as a restaurant nearby prepares an order and marks it ready, you will receive a notification here!
                </p>
              </div>
            )
          )}
        </div>
      )}

      {/* TAB 2: EARINGS & HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Earnings Summary Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-4 text-white shadow-sm">
              <p className="text-xs font-semibold opacity-90">Total Revenue</p>
              <p className="text-2xl font-black mt-1">₹{totalRevenue}</p>
              <p className="text-[10px] opacity-80 mt-1">Lifetime Earnings</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500">Delivered</p>
              <p className="text-2xl font-black text-gray-800 mt-1">
                {deliveredOrders.length}
              </p>
              <p className="text-[10px] text-green-600 font-semibold mt-1">
                Completed Orders
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500">Distance</p>
              <p className="text-2xl font-black text-gray-800 mt-1">
                {totalDistance.toFixed(1)}{" "}
                <span className="text-sm font-normal text-gray-500">km</span>
              </p>
              <p className="text-[10px] text-blue-600 font-semibold mt-1">
                Total Travelled
              </p>
            </div>
          </div>

          {/* Orders History List */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 space-y-3">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <span>📜</span> Delivery Order History
              </h3>
              <button
                onClick={fetchHistory}
                className="text-xs text-[#e23744] hover:underline font-semibold"
              >
                Refresh List
              </button>
            </div>

            {historyLoading ? (
              <div className="py-12 text-center text-sm text-gray-500">
                Loading your delivery history...
              </div>
            ) : historyOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-500 space-y-2">
                <p className="text-4xl">📭</p>
                <p className="font-bold text-gray-700">No past deliveries yet</p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Once you accept and deliver orders to customers, they will be archived here along with your earnings breakdown.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {historyOrders.map((ord) => (
                  <div
                    key={ord._id}
                    className="border border-gray-100 rounded-xl p-3.5 hover:border-gray-300 transition bg-gray-50/50 space-y-2.5 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-gray-800">
                          {ord.restaurantName}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">
                          Order #{ord._id.slice(-6)} •{" "}
                          {new Date(ord.createdAt).toLocaleDateString()}{" "}
                          {new Date(ord.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                          ord.status === "delivered"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : ord.status === "cancelled"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {ord.status.replaceAll("_", " ")}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 bg-white p-2 rounded-lg border border-gray-100 font-medium">
                      {ord.items
                        ?.map((i) => `${i.name} x${i.quauntity}`)
                        .join(", ") || "Food items"}
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-gray-200/60 text-xs">
                      <span className="text-gray-500 font-medium">
                        📍 Distance:{" "}
                        {ord.distance ? ord.distance.toFixed(1) : 0} km
                      </span>
                      <span className="font-black text-green-700 text-sm bg-green-50 px-2 py-0.5 rounded border border-green-200">
                        +₹{ord.riderAmount || 0} Earned
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RIDER PROFILE & PARTNER ID */}
      {activeTab === "profile" && (
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#e23744] to-red-600 h-28 relative">
              <div className="absolute top-3 right-4 text-white/80 text-xs font-mono font-semibold">
                PARTNER ID: #{profile._id.slice(-8).toUpperCase()}
              </div>
            </div>

            {/* Profile Photo & Basic Info */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-14 mb-6 gap-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                  <img
                    src={profile.picture}
                    className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-md bg-white"
                    alt=""
                  />
                  <div className="mb-1">
                    <h2 className="text-2xl font-black text-gray-800">
                      {user?.name}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                      Foodify Delivery Partner
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="px-3 py-1 text-xs rounded-full font-bold bg-green-100 text-green-700 border border-green-300 shadow-sm">
                    {profile.isVerified
                      ? "✓ Verified Partner"
                      : "Pending Verification"}
                  </span>
                </div>
              </div>

              {/* Status Toggle Card */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center justify-between border border-gray-200 shadow-sm">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Current Duty Status
                  </p>
                  <p className="font-bold text-gray-800 mt-0.5 flex items-center gap-2 text-sm">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        profile.isAvailble ? "bg-green-500 animate-pulse" : "bg-gray-400"
                      }`}
                    ></span>
                    {profile.isAvailble
                      ? "Online"
                      : "Offline"}
                  </p>
                </div>
                {profile.isVerified && (
                  <button
                    onClick={toggleAvailiblity}
                    disabled={toggling}
                    className={`px-4 py-2 rounded-lg text-white text-xs font-bold transition shadow ${
                      toggling
                        ? "bg-gray-400"
                        : profile.isAvailble
                        ? "bg-gray-700 hover:bg-gray-800"
                        : "bg-[#e23744] hover:bg-red-600"
                    }`}
                  >
                    {toggling
                      ? "Updating..."
                      : profile.isAvailble
                      ? "Go Offline"
                      : "Go Online"}
                  </button>
                )}
              </div>

              {/* Document Details Grid */}
              <h3 className="font-bold text-gray-800 text-sm mb-3 border-b pb-2 flex items-center gap-1.5">
                <span>📋</span> Partner Documents & Personal Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <p className="text-[11px] text-gray-400 font-semibold">
                    Contact Phone
                  </p>
                  <p className="font-bold text-gray-800 mt-0.5 text-sm">
                    +91 {profile.phoneNumber}
                  </p>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <p className="text-[11px] text-gray-400 font-semibold">
                    Aadhar Number (Masked)
                  </p>
                  <p className="font-bold text-gray-800 mt-0.5 font-mono text-sm">
                    XXXX-XXXX-{profile.aadharNumber.slice(-4)}
                  </p>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <p className="text-[11px] text-gray-400 font-semibold">
                    Driving License Number
                  </p>
                  <p className="font-bold text-gray-800 mt-0.5 font-mono text-sm">
                    {profile.drivingLicenseNumber}
                  </p>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <p className="text-[11px] text-gray-400 font-semibold">
                    Account Status
                  </p>
                  <p className="font-bold text-green-600 mt-0.5 text-sm flex items-center gap-1">
                    <span>●</span> Active
                  </p>
                </div>
              </div>

              {/* Guidelines Box */}
              <div className="mt-6 flex justify-start">
                <button
                  className="px-4 py-2 text-white cursor-pointer rounded-lg text-lg font-bold transition shadow bg-[#e23744] hover:bg-red-600"
                  onClick={logoutHandler}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;
