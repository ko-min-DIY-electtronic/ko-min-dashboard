import { useEffect, useState } from "react";
import { DeliveryConfigForm } from "./DeliConfigForm";
import { DeliveryConfigCard } from "./DeliConfigCard";
import { Plus, Search, ChevronDown } from "lucide-react";
import getAllDeliverZone from "../../api/deliveryApi/getAllDeliZone";
import updateDeliZone from "../../api/deliveryApi/updateDeliZone";
import deleteDeliZone from "../../api/deliveryApi/deleteDeliZone";
import ConfirmModal from "../ui/ConfirmModal";

export const DeliveryConfigManager = () => {
  const [configs, setConfigs] = useState([]);
  const [expandedCity, setExpandedCity] = useState(null); // Track which city is expanded

  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterReachable, setFilterReachable] = useState(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    configId: null,
    configName: "",
  });

  const getDeliverZone = async () => {
    try {
      const response = await getAllDeliverZone();
      console.log(response);
      if (response.status === "success") {
        setConfigs(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDeliverZone();
  }, []);

  const handleAddConfig = (newConfig) => {
    const configWithId = {
      ...newConfig,
      // id: Date.now().toString(),
    };
    setConfigs((prev) => [...prev, configWithId]);
    setShowForm(false);
  };

  const handleUpdateConfig = async (updatedConfig) => {
    try {
      // Call the API to update the delivery configuration with both new and original data
      const response = await updateDeliZone(
        editingConfig._id,
        updatedConfig,
        editingConfig,
      );

      // Update local state with the response data
      setConfigs((prev) =>
        prev.map((config) =>
          config._id === editingConfig._id
            ? { ...response.data, _id: config._id }
            : config,
        ),
      );
      setEditingConfig(null);

      // Refresh the data to ensure consistency
      getDeliverZone();
    } catch (error) {
      console.error("Error updating delivery config:", error);
      // Error is already handled by the API function with toast
    }
  };

  const handleEditConfig = (config) => {
    setEditingConfig(config);
    setShowForm(false);
  };

  const handleDeleteConfig = (id, city, township) => {
    setConfirmModal({
      isOpen: true,
      configId: id,
      configName: `${city}, ${township}`,
    });
  };

  const confirmDelete = async () => {
    try {
      // Call the API to delete the delivery configuration
      await deleteDeliZone(confirmModal.configId);

      // Remove from local state
      setConfigs((prev) =>
        prev.filter((config) => config._id !== confirmModal.configId),
      );

      // Refresh the data to ensure consistency
      getDeliverZone();

      // Close modal
      setConfirmModal({
        isOpen: false,
        configId: null,
        configName: "",
      });
    } catch (error) {
      console.error("Error deleting delivery config:", error);
      // Error is already handled by the API function with toast
      // Don't close modal on error so user can try again
    }
  };

  const cancelDelete = () => {
    setConfirmModal({
      isOpen: false,
      configId: null,
      configName: "",
    });
  };

  const handleCancelEdit = () => {
    setEditingConfig(null);
  };

  const filteredConfigs = configs.filter((config) => {
    const matchesSearch =
      config.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.township.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterReachable === null || config.reachable === filterReachable;
    return matchesSearch && matchesFilter;
  });

  // Group configurations by city
  const groupedConfigs = filteredConfigs.reduce((groups, config) => {
    const city = config.city;
    if (!groups[city]) {
      groups[city] = [];
    }
    groups[city].push(config);
    return groups;
  }, {});

  // Sort cities alphabetically
  const sortedCities = Object.keys(groupedConfigs).sort();

  const toggleCity = (city) => {
    setExpandedCity(expandedCity === city ? null : city);
  };

  return (
    <div className="px-4">
      <div className="overflow-y-auto h-[calc(100vh-50px)]">
        {/* Header */}
        <div className="md:mb-8 mb-2 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-2">
          <div className="">
            <h1 className="header ml-8 lg:ml-0">Delivery Configuration</h1>
            <p className="hidden md:block text-gray-600">
              Manage delivery pricing for different locations
            </p>
          </div>

          {/* Search */}
          <div className="flex flex-row md:items-center gap-2">
            <div className="relative  md:w-[400px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by city or township..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg font-medium focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingConfig(null);
              }}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden md:block">Add New Configuration</span>
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row items-center justify-end gap-4 mb-8">
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Filter */}
            {/* <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={
                  filterReachable === null ? "" : filterReachable.toString()
                }
                onChange={(e) =>
                  setFilterReachable(
                    e.target.value === "" ? null : e.target.value === "true"
                  )
                }
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg font-medium focus:outline-none bg-white"
              >
                <option value="">All Status</option>
                <option value="true">Reachable</option>
                <option value="false">Not Reachable</option>
              </select>
            </div> */}
          </div>
        </div>

        {/* Form */}
        {(showForm || editingConfig) && (
          <div className="mb-8">
            <DeliveryConfigForm
              onSubmit={editingConfig ? handleUpdateConfig : handleAddConfig}
              onCancel={
                editingConfig ? handleCancelEdit : () => setShowForm(false)
              }
              initialData={editingConfig || undefined}
              isEditing={!!editingConfig}
              refetch={getDeliverZone}
            />
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{sortedCities.length}</span>{" "}
            cities with{" "}
            <span className="font-semibold">{filteredConfigs.length}</span>{" "}
            configurations
          </p>
        </div>

        {/* Config Cards Grouped by City */}
        <div className="space-y-4">
          {sortedCities.map((city) => (
            <div
              key={city}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* City Header - Clickable Bar */}
              <div
                onClick={() => toggleCity(city)}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <h2 className="text-md md:text-xl font-semibold text-gray-900">
                      {city}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {groupedConfigs[city].length}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Active
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                        expandedCity === city ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* City Configurations - Collapsible */}
              {expandedCity === city && (
                <div className="p-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedConfigs[city].map((config) => (
                      <DeliveryConfigCard
                        key={config._id}
                        config={config}
                        onEdit={handleEditConfig}
                        onDelete={handleDeleteConfig}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredConfigs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No configurations found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterReachable !== null
                ? "Try adjusting your search or filter criteria"
                : "Create your first delivery configuration to get started"}
            </p>
            {!showForm && !editingConfig && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Configuration
              </button>
            )}
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Delete Delivery Configuration"
          message={`Are you sure you want to delete the delivery configuration for ${confirmModal.configName}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  );
};
