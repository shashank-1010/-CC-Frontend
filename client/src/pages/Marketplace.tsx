import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import PostCard from "../components/PostCard";
import api from "../api/api";

interface Item {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  whatsapp?: string;
  status: string;
  type: "sale" | "rent";
  userId: { _id: string; name: string; email: string };
  createdAt: string;
}

interface FormProps {
  form: any;
  setForm: any;
  submit: any;
  uploading: boolean;
  previewUrl: any;
  uploadProgress: number;
  handleInputChange: any;
  handleWhatsAppChange: any;
  handleImageUpload: any;
  validateWhatsApp: any;
  whatsappError: string;
  setShowForm: any;
  setPreviewUrl: any;
  setWhatsappError: any;
  editItem: any;
}

/* ---------------- FORM COMPONENT ---------------- */

function MarketplaceForm({
  form,
  setForm,
  submit,
  uploading,
  previewUrl,
  uploadProgress,
  handleInputChange,
  handleWhatsAppChange,
  handleImageUpload,
  validateWhatsApp,
  whatsappError,
  setShowForm,
  setPreviewUrl,
  setWhatsappError,
  editItem,
}: FormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800 text-base sm:text-lg">
          {editItem ? "Edit Item" : "Post New Item"}
        </h2>
        <button
          onClick={() => {
            setShowForm(false);
            setForm({
              title: "",
              description: "",
              price: "",
              imageUrl: "",
              whatsapp: "",
              status: "available",
              type: "sale",
            });
            setPreviewUrl(null);
            setWhatsappError("");
          }}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TITLE */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="e.g. MacBook Pro 2023"
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="Detailed description of your item..."
            required
          />
        </div>

        {/* PRICE & TYPE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (₹)
          </label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="999"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>

        {/* STATUS & WHATSAPP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            {["available", "reserved", "sold", "removed"].map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp <span className="text-gray-400">(10 digits)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500 text-sm">+91</span>
            <input
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleWhatsAppChange}
              className="w-full pl-12 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="9876543210"
              maxLength={10}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
          {whatsappError && (
            <p className="text-xs text-red-600 mt-1">{whatsappError}</p>
          )}
        </div>

{/* IMAGE URL INPUT - UPLOAD KI JAGAH */}
<div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Product Image URL <span className="text-red-600">*</span>
  </label>
  
  <div className="space-y-3">
    {/* URL Input Field */}
    <input
      type="url"
      name="imageUrl"
      value={form.imageUrl}
      onChange={handleInputChange}
      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
      placeholder="https://i.imgur.com/abc123.jpg"
      required
    />
    
    {/* Help Section - PostImage Link */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-xs text-blue-800">
          <p className="font-medium mb-1">📸 How to get image URL:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>
              <a 
                href="https://postimages.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
              >
                Open PostImage.org 
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </li>
            <li>Upload your image (free, no account needed)</li>
            <li>Copy the <span className="font-semibold">"Direct link"</span></li>
            <li>Paste it above</li>
          </ol>
        </div>
      </div>
    </div>

    {/* Alternative Image Hosting Options */}
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-gray-500">Other free hosts:</span>
      <a href="https://www.imageurlgenerator.com/image-to-url/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 hover:underline">imageurlgenerator</a>
      <span className="text-gray-300">|</span>
      <a href="https://www.image2url.com/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 hover:underline">image2url.com</a>
    </div>

    {/* Image Preview */}
    {form.imageUrl && (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs font-medium text-gray-700">Preview:</span>
        </div>
        <div className="relative inline-block">
          <img
            src={form.imageUrl}
            alt="Preview"
            className="h-20 w-20 object-cover rounded-lg border border-gray-200 shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
            }}
          />
          {form.imageUrl && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
              ✓
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2 break-all bg-gray-100 p-2 rounded">
          <span className="font-medium text-gray-500">URL:</span> {form.imageUrl.substring(0, 60)}...
        </p>
      </div>
    )}
  </div>
</div>

{/* BUTTONS */}
<div className="md:col-span-2 flex gap-3 pt-2">
  <button
    type="submit"
    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
    disabled={
      !form.imageUrl ||  // 👈 Sirf URL check karo (uploading hata diya)
      (form.whatsapp ? !validateWhatsApp(form.whatsapp) : false)
    }
  >
    {editItem ? "Update Item" : "Post Item"}  {/* 👈 Uploading text hata diya */}
  </button>
</div>
      </form>
    </div>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function Marketplace() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    imageUrl: "",
    whatsapp: "",
    status: "available",
    type: "sale",
  });

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [whatsappError, setWhatsappError] = useState("");

  const user = JSON.parse(localStorage.getItem("cc_user") || "null");

  // Load items from API
  const load = async () => {
    try {
      let url = "/marketplace";
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      if (filterType) params.append("type", filterType);
      if (params.toString()) url += "?" + params.toString();

      const { data } = await api.get(url);
      setItems(data.items || data);
    } catch (error) {
      console.error("Failed to load items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filterStatus, filterType]);

  // Validate WhatsApp number
  const validateWhatsApp = (num: string) => {
    return num.replace(/\D/g, "").length === 10;
  };

  // Handle input changes
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setForm((p: any) => ({ ...p, [name]: value }));
  };

  // Handle WhatsApp input
  const handleWhatsAppChange = (e: any) => {
    const numbers = e.target.value.replace(/\D/g, "");

    if (numbers.length <= 10) {
      setForm((p: any) => ({ ...p, whatsapp: numbers }));

      if (numbers.length !== 10 && numbers.length !== 0)
        setWhatsappError("Must be 10 digits");
      else setWhatsappError("");
    }
  };

  // Image Upload
  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setForm((p: any) => ({ ...p, imageUrl: data.imageUrl }));

      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (error: any) {
      console.error("Upload failed:", error);
      setPreviewUrl(null);
      setUploadProgress(0);
      alert(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Submit form
  const submit = async (e: any) => {
    e.preventDefault();

    if (!form.imageUrl) {
      alert("Please upload an image first!");
      return;
    }

    if (form.whatsapp && !validateWhatsApp(form.whatsapp)) {
      setWhatsappError("WhatsApp number must be exactly 10 digits");
      return;
    }

    const payload = {
      ...form,
      price: parseFloat(form.price),
      whatsapp: form.whatsapp || undefined,
    };

    try {
      if (editItem) {
        await api.put(`/marketplace/${editItem._id}`, payload);
        alert("Item updated successfully!");
      } else {
        await api.post("/marketplace", payload);
        alert("Item posted successfully!");
      }

      setShowForm(false);
      setEditItem(null);
      setForm({
        title: "",
        description: "",
        price: "",
        imageUrl: "",
        whatsapp: "",
        status: "available",
        type: "sale",
      });
      setPreviewUrl(null);
      setWhatsappError("");

      load();
    } catch (error: any) {
      console.error("Submit failed:", error);
      alert(error.response?.data?.message || "Failed to save item");
    }
  };

  // Edit item
  const startEdit = (item: Item) => {
    setEditItem(item);
    setForm({
      title: item.title,
      description: item.description,
      price: String(item.price),
      imageUrl: item.imageUrl || "",
      whatsapp: item.whatsapp || "",
      status: item.status,
      type: item.type,
    });
    setPreviewUrl(item.imageUrl || null);
    setShowForm(true);
  };

  // Delete item
  const deleteItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await api.delete(`/marketplace/${id}`);
      alert("Item deleted successfully");
      load();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete item");
    }
  };

  // Handle card click
  const handleCardClick = (item: Item) => {
    setSelectedItem(item);
    setShowSellerModal(true);
  };

  // Open WhatsApp
  const openWhatsApp = (whatsapp: string, itemTitle: string, sellerName: string) => {
    const cleanNumber = whatsapp.replace(/\D/g, "");
    const fullNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    const message = encodeURIComponent(
      `Hi ${sellerName}, I'm interested in your item: ${itemTitle}`
    );
    window.open(`https://wa.me/${fullNumber}?text=${message}`, "_blank");
  };

  // Get image URL
  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    return `http://localhost:5000${imageUrl}`;
  };

  // WhatsApp Button Component
  const WhatsAppButton = ({ item }: { item: Item }) => {
    if (!item.whatsapp || !validateWhatsApp(item.whatsapp)) return null;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          openWhatsApp(item.whatsapp!, item.title, item.userId.name);
        }}
        className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-green-600 hover:bg-green-700 text-white p-2.5 sm:p-3 rounded-full shadow-sm transition-colors z-10"
        title={`Chat with ${item.userId.name} on WhatsApp`}
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.001 2.00195C6.477 2.00195 2.00195 6.477 2.00195 12.001C2.00195 14.1 2.70195 16.073 3.96695 17.645L2.25195 21.999L6.69895 20.305C8.23495 21.325 10.069 21.999 12.001 21.999C17.525 21.999 22 17.525 22 12.001C22 6.477 17.525 2.00195 12.001 2.00195Z" />
        </svg>
      </button>
    );
  };

  // Seller Details Modal
  const SellerModal = () => {
    if (!selectedItem) return null;

    return (
      <div
        className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
        onClick={() => setShowSellerModal(false)}
      >
        <div
          className="bg-white rounded-t-xl sm:rounded-xl max-w-md w-full p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowSellerModal(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Item Details</h3>

            {selectedItem.imageUrl && (
              <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(selectedItem.imageUrl)}
                  alt={selectedItem.title}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-800">{selectedItem.title}</h4>
              <p className="text-gray-600 text-sm mt-1">{selectedItem.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl font-bold text-red-600">₹{selectedItem.price}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                selectedItem.type === "rent" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
              }`}>
                {selectedItem.type === "rent" ? "For Rent" : "For Sale"}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                selectedItem.status === "available" ? "bg-green-100 text-green-700" :
                selectedItem.status === "reserved" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                {selectedItem.status}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <p className="text-sm text-gray-600 mb-1">Seller:</p>
              <p className="font-medium text-gray-800">{selectedItem.userId?.name}</p>
              <p className="text-sm text-gray-500">{selectedItem.userId?.email}</p>
            </div>

            {selectedItem.whatsapp && validateWhatsApp(selectedItem.whatsapp) && (
              <button
                onClick={() => openWhatsApp(selectedItem.whatsapp!, selectedItem.title, selectedItem.userId.name)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.001 2.00195C6.477 2.00195 2.00195 6.477 2.00195 12.001C2.00195 14.1 2.70195 16.073 3.96695 17.645L2.25195 21.999L6.69895 20.305C8.23495 21.325 10.069 21.999 12.001 21.999C17.525 21.999 22 17.525 22 12.001C22 6.477 17.525 2.00195 12.001 2.00195Z" />
                </svg>
                Contact on WhatsApp
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      title="Marketplace"
      subtitle="Buy, sell or rent items with fellow students"
      action={
        <button
          onClick={() => {
            setShowForm(true);
            setEditItem(null);
            setForm({
              title: "",
              description: "",
              price: "",
              imageUrl: "",
              whatsapp: "",
              status: "available",
              type: "sale",
            });
            setPreviewUrl(null);
            setWhatsappError("");
          }}
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 sm:py-2 rounded-lg text-sm transition-colors whitespace-nowrap" >
          + Post Item
        </button>
      }
    >
      {/* About Marketplace - Simple & Professional */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-1">About Marketplace</h3>
            <p className="text-sm text-gray-600">
              A platform for students to buy, sell, or rent items within the campus community. 
              Post your items for free and connect with buyers via WhatsApp.
            </p>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span>✓ 100% student community</span>
              <span>✓ Direct WhatsApp chat</span>
              <span>✓ Free to post</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          className="text-sm py-1.5 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All types</option>
          <option value="sale">Sale</option>
          <option value="rent">Rent</option>
        </select>
        <select
          className="text-sm py-1.5 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All status</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      {/* Form - Shows at top when open */}
      {showForm && (
        <MarketplaceForm
          form={form}
          setForm={setForm}
          submit={submit}
          uploading={uploading}
          previewUrl={previewUrl}
          uploadProgress={uploadProgress}
          handleInputChange={handleInputChange}
          handleWhatsAppChange={handleWhatsAppChange}
          handleImageUpload={handleImageUpload}
          validateWhatsApp={validateWhatsApp}
          whatsappError={whatsappError}
          setShowForm={setShowForm}
          setPreviewUrl={setPreviewUrl}
          setWhatsappError={setWhatsappError}
          editItem={editItem}
        />
      )}

      {showSellerModal && <SellerModal />}

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item._id} className="relative cursor-pointer">
              <div onClick={() => handleCardClick(item)}>
                <PostCard
                  title={item.title}
                  description={item.description}
                  status={item.status}
                  meta={
                    <div>
                      <p className="font-semibold text-red-600">₹{item.price}</p>
                      <p className="text-xs text-gray-500">Seller: {item.userId?.name}</p>
                    </div>
                  }
                  extra={
                    item.imageUrl ? (
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.title}
                        className="w-full h-28 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-28 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )
                  }
                  onEdit={
                    user && (String(item.userId?._id) === user._id || user.role === "admin")
                      ? () => startEdit(item)
                      : undefined
                  }
                  onDelete={
                    user && (String(item.userId?._id) === user._id || user.role === "admin")
                      ? () => deleteItem(item._id)
                      : undefined
                  }
                />
              </div>
              <WhatsAppButton item={item} />
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <p className="text-gray-400">No items yet. Be the first to post!</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}