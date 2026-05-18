import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BannerList from "./BannerList";
import getAllBanners from "../../api/bannerApi/getAllBanners";
import Loading from "../utli/Loading";

function Banner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState([]);
  const [error, setError] = useState(null);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllBanners();
      // console.log("Banner response:", response);

      if (response.status === "success") {
        setBanners(response.data);
      } else {
        setError("Failed to fetch banners");
      }
    } catch (err) {
      console.error("Error fetching banners:", err);
      setError("An error occurred while fetching banners");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="w-full px-4">
      <div className="flex flex-col lg:flex-row items-center justify-between mb-6">
        <div>
          <h1 className="header ml-8 lg:ml-0">Banner Management</h1>
        </div>

        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <button
            onClick={fetchBanners}
            className="button border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="16px"
              viewBox="0 -960 960 960"
              width="16px"
              fill="currentColor"
            >
              <path d="M480-120 200-272v-240L40-600l440-240 440 240v320h-80v-276l-80 43v240L480-120Zm0-332 274-148-274-148-274 148 274 148Zm0 241 200-108v-151L480-360 280-470v151l200 108Zm0-241Zm0 90Zm0 0Z" />
            </svg>
            <span className="block text-[14px]">Refresh</span>
          </button>

          <button
            onClick={() => navigate("/banners/create")}
            className="button bg-primary text-white hover:bg-primary/80 transition-all duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="16px"
              viewBox="0 -960 960 960"
              width="16px"
              fill="currentColor"
            >
              <path d="M640-640h120-120Zm-440 0h338-18 14-334Zm16-80h528l-34-40H250l-34 40Zm184 270 80-40 80 40v-190H400v190Zm182 330H200q-33 0-56.5-23.5T120-200v-499q0-14 4.5-27t13.5-24l50-61q11-14 27.5-21.5T250-840h460q18 0 34.5 7.5T772-811l50 61q9 11 13.5 24t4.5 27v196q-19-7-39-11t-41-4v-122H640v153q-35 20-61 49.5T538-371l-58-29-160 80v-320H200v440h334q8 23 20 43t28 37Zm138 0v-120H600v-80h120v-120h80v120h120v80H800v120h-80Z" />
            </svg>
            <span className="block text-[14px]">Add Banner</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Banner List */}
      <BannerList
        banners={banners}
        loading={loading}
        onBannerUpdate={fetchBanners}
      />
    </div>
  );
}

export default Banner;
