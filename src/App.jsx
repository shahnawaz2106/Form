import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Check,
  Clock,
  CreditCard,
  User,
  IndianRupee,
  Shield,
  Zap,
  ArrowRight,
  Loader2,
  Smartphone,
  Building,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function PaymentForm() {
  const [formData, setFormData] = useState({
    accountNumber: "",
    senderName: "",
    paymentType: "UPI",
    adminFee: "10.00",
    amount: "",
    paymentStatus: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [countdown, setCountdown] = useState(60); // 1 minute countdown

  const dropdownRef = useRef(null);

  // Payment type options with icons
  const paymentTypes = [
    {
      value: "UPI",
      label: "UPI Payment",
      icon: <Smartphone size={20} />,
      color: "from-purple-500 to-pink-500",
      speed: "Instant",
    },
    {
      value: "IMPS",
      label: "IMPS Transfer",
      icon: <Zap size={20} />,
      color: "from-blue-500 to-cyan-500",
      speed: "Fast",
    },
    {
      value: "NEFT",
      label: "NEFT Transfer",
      icon: <Building size={20} />,
      color: "from-green-500 to-emerald-500",
      speed: "2-4 hours",
    },
    {
      value: "RTGS",
      label: "RTGS Transfer",
      icon: <IndianRupee size={20} />,
      color: "from-orange-500 to-red-500",
      speed: "Real-time",
    },
  ];

  // Status options for dropdown
  const statusOptions = [
    {
      value: "Success",
      label: "Success",
      color: "bg-green-500",
      borderColor: "border-green-500",
      gradient: "from-green-500 to-emerald-500",
      icon: <Check size={18} />,
      description: "Payment completed successfully",
    },
    {
      value: "Failed",
      label: "Failed",
      color: "bg-red-500",
      borderColor: "border-red-500",
      gradient: "from-red-500 to-pink-500",
      icon: <X size={18} />,
      description: "Payment failed to process",
    },
    {
      value: "Processing",
      label: "Processing",
      color: "bg-orange-500",
      borderColor: "border-orange-500",
      gradient: "from-orange-500 to-amber-500",
      icon: <Clock size={18} />,
      description: "Payment is being processed",
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-calculate admin fee based on amount
  useEffect(() => {
    if (formData.amount && parseFloat(formData.amount) > 0) {
      const amount = parseFloat(formData.amount);
      let fee = 0;

      // Fixed fee calculation: Higher amount = higher fee
      if (amount <= 1000) fee = 10.0; // ₹10 for amounts up to ₹1000
      else if (amount <= 5000) fee = 15.0; // ₹15 for amounts up to ₹5000
      else if (amount <= 10000) fee = 20.0; // ₹20 for amounts up to ₹10000
      else if (amount <= 50000) fee = 25.0; // ₹25 for amounts up to ₹50000
      else fee = 30.0; // ₹30 for amounts above ₹50000

      setFormData((prev) => ({
        ...prev,
        adminFee: fee.toFixed(2),
      }));
    } else {
      // Reset to default fee when amount is empty or 0
      setFormData((prev) => ({
        ...prev,
        adminFee: "10.00",
      }));
    }
  }, [formData.amount]);

  // Countdown timer for processing state
  useEffect(() => {
    let timer;
    if (formData.paymentStatus === "Processing" && showModal && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handlePaymentCompletion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [formData.paymentStatus, showModal, countdown]);

  // Simulate payment processing progress
  useEffect(() => {
    if (formData.paymentStatus === "Processing" && showModal) {
      const timer = setInterval(() => {
        setPaymentProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + (Math.random() * 10 + 5);
        });
      }, 300);

      return () => clearInterval(timer);
    }
  }, [formData.paymentStatus, showModal]);

  const convertNumberToWords = (num) => {
    if (!num || isNaN(num) || num === 0) return "";

    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convertLessThanThousand = (n) => {
      if (n === 0) return "";

      let words = "";

      // Hundreds
      if (n >= 100) {
        words += ones[Math.floor(n / 100)] + " Hundred ";
        n %= 100;
      }

      // Tens and ones
      if (n >= 20) {
        words += tens[Math.floor(n / 10)] + " ";
        n %= 10;
      }

      if (n >= 10) {
        words += teens[n - 10] + " ";
        n = 0;
      }

      if (n > 0) {
        words += ones[n] + " ";
      }

      return words.trim();
    };

    const convertToIndianNumbering = (n) => {
      if (n === 0) return "zero";

      let words = "";
      const crore = Math.floor(n / 10000000);
      n %= 10000000;

      const lakh = Math.floor(n / 100000);
      n %= 100000;

      const thousand = Math.floor(n / 1000);
      n %= 1000;

      const hundred = Math.floor(n / 100);
      const remainder = (n %= 100);

      if (crore > 0) {
        words += convertLessThanThousand(crore) + " Crore ";
      }

      if (lakh > 0) {
        words += convertLessThanThousand(lakh) + " Lakh ";
      }

      if (thousand > 0) {
        words += convertLessThanThousand(thousand) + " Thousand ";
      }

      if (hundred > 0) {
        words += convertLessThanThousand(hundred) + " Hundred ";
      }

      if (remainder > 0) {
        if (words !== "") words += "and ";
        words += convertLessThanThousand(remainder);
      }

      return words.trim();
    };

    return convertToIndianNumbering(num);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField("");
  };

  const handleStatusSelect = (status) => {
    setFormData((prev) => ({ ...prev, paymentStatus: status.value }));
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getSelectedStatus = () => {
    return statusOptions.find(
      (option) => option.value === formData.paymentStatus
    );
  };

  // Validate account number - only show checkmark for valid account numbers
  const isValidAccountNumber = () => {
    return (
      formData.accountNumber.length >= 10 && formData.accountNumber.length <= 16
    );
  };

  const validateForm = () => {
    if (!formData.accountNumber || !isValidAccountNumber()) {
      return false;
    }
    if (!formData.senderName || formData.senderName.length < 3) {
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return false;
    }
    if (!formData.paymentStatus) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call with loading animation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsLoading(false);
    setShowModal(true);
    // Reset countdown when showing modal
    setCountdown(60);
  };

  const handlePaymentCompletion = () => {
    setTimeout(() => {
      setShowModal(false);
      resetForm();
    }, 2000);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      accountNumber: "",
      senderName: "",
      paymentType: "UPI",
      adminFee: "10.00",
      amount: "",
      paymentStatus: "",
    });
    setPaymentProgress(0);
    setCurrentStep(1);
    setIsDropdownOpen(false);
    setCountdown(60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getModalConfig = (status) => {
    switch (status) {
      case "Success":
        return {
          icon: <Check size={40} strokeWidth={3} />,
          iconBg: "bg-gradient-to-br from-green-500 to-emerald-500",
          title: "Payment Success!",
          message:
            "Your payment has been processed successfully. The funds will be transferred instantly.",
          buttonText: "Done",
          buttonBg:
            "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
        };
      case "Failed":
        return {
          icon: <X size={40} strokeWidth={3} />,
          iconBg: "bg-gradient-to-br from-red-500 to-pink-500",
          title: "Payment Failed",
          message:
            "There was an issue processing your payment. Your amount will be refunded within 24 hours.",
          buttonText: "Try Again",
          buttonBg:
            "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600",
        };
      case "Processing":
        return {
          icon: (
            <div className="relative">
              {/* <Loader2 size={40} className="animate-spin" /> */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-2xl ">
                  {formatTime(countdown)}
                </span>
              </div>
            </div>
          ),
          iconBg: "bg-gradient-to-br from-orange-500 to-amber-500",
          title: "Processing Payment...",
          message:
            "Please wait while we process your payment. Do not refresh the page.",
          buttonText: "Processing...",
          buttonBg:
            "bg-gradient-to-r from-orange-500 to-amber-500 cursor-not-allowed",
        };
      default:
        return {
          icon: <Check size={40} />,
          iconBg: "bg-gradient-to-br from-gray-500 to-gray-600",
          title: "Payment Details",
          message: "",
          buttonText: "Close",
          buttonBg:
            "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700",
        };
    }
  };

  const modalConfig = getModalConfig(formData.paymentStatus);
  const currentDate = new Date()
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(",", "");

  const totalAmount = (
    parseFloat(formData.amount || 0) + parseFloat(formData.adminFee || 0)
  ).toFixed(2);
  const isFormValid = validateForm();
  const selectedStatus = getSelectedStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-4xl">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform hover:scale-[1.01] transition-all duration-500">
          {/* Header */}
          <div className="relative p-8 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  Secure Payment
                </h1>
                <p className="text-gray-300 mt-2 text-lg">
                  Fast, secure, and reliable payment processing
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <IndianRupee className="text-white" size={32} />
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="px-8 pt-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-500 ${
                      currentStep >= step
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-110"
                        : "bg-white/10 text-gray-400 border border-white/20"
                    }`}
                  >
                    {step}
                  </div>
                </div>
              ))}
            </div>
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-1000 ease-out"
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>Details</span>
              <span>Review</span>
              <span>Payment</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Account Number */}
                <div className="group">
                  <label className="flex items-center text-sm font-semibold text-cyan-200 mb-3">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Account Number
                    <span className="text-xs text-gray-400 ml-2">
                      (10-16 digits)
                    </span>
                  </label>
                  <div
                    className={`relative transition-all duration-300 ${
                      focusedField === "accountNumber"
                        ? "transform scale-105"
                        : ""
                    }`}
                  >
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      onFocus={() => handleFocus("accountNumber")}
                      onBlur={handleBlur}
                      required
                      maxLength={16}
                      className="w-full px-6 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all duration-300 backdrop-blur-sm"
                      placeholder="Enter 10-16 digit account number"
                    />
                    {/* Only show checkmark for valid account numbers */}
                    {formData.accountNumber && isValidAccountNumber() && (
                      <Check
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400"
                        size={20}
                      />
                    )}
                    {/* Show warning for invalid but non-empty account numbers */}
                    {formData.accountNumber && !isValidAccountNumber() && (
                      <Clock
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-400"
                        size={20}
                      />
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>Enter valid account number</span>
                    <span>{formData.accountNumber.length}/16</span>
                  </div>
                </div>

                {/* Sender Name */}
                <div className="group">
                  <label className="flex items-center text-sm font-semibold text-cyan-200 mb-3">
                    <User className="w-5 h-5 mr-2" />
                    Sender Name
                  </label>
                  <div
                    className={`relative transition-all duration-300 ${
                      focusedField === "senderName" ? "transform scale-105" : ""
                    }`}
                  >
                    <input
                      type="text"
                      name="senderName"
                      value={formData.senderName}
                      onChange={handleChange}
                      onFocus={() => handleFocus("senderName")}
                      onBlur={handleBlur}
                      required
                      className="w-full px-6 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all duration-300 backdrop-blur-sm"
                      placeholder="Enter sender name"
                    />
                    {formData.senderName && formData.senderName.length >= 3 && (
                      <Check
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400"
                        size={20}
                      />
                    )}
                    {formData.senderName && formData.senderName.length < 3 && (
                      <Clock
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-400"
                        size={20}
                      />
                    )}
                  </div>
                </div>

                {/* Payment Type */}
                <div>
                  <label className="flex items-center text-sm font-semibold text-cyan-200 mb-3">
                    <Zap className="w-5 h-5 mr-2" />
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            paymentType: type.value,
                          }))
                        }
                        className={`p-4 border-2 rounded-xl text-left transition-all duration-300 transform hover:scale-105 backdrop-blur-sm ${
                          formData.paymentType === type.value
                            ? `border-cyan-500 bg-gradient-to-r ${type.color} text-white shadow-lg`
                            : "border-white/10 bg-white/5 text-gray-300 hover:border-cyan-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`p-2 rounded-lg ${
                              formData.paymentType === type.value
                                ? "bg-white/20"
                                : "bg-white/10"
                            }`}
                          >
                            {type.icon}
                          </div>
                        </div>
                        <div className="font-semibold text-sm">
                          {type.label}
                        </div>
                        <div className="text-xs opacity-80 mt-1">
                          {type.speed}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Amount */}
                <div className="group">
                  <label className="flex items-center text-sm font-semibold text-cyan-200 mb-3">
                    <IndianRupee className="w-5 h-5 mr-2" />
                    Amount
                  </label>
                  <div
                    className={`relative transition-all duration-300 ${
                      focusedField === "amount" ? "transform scale-105" : ""
                    }`}
                  >
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      onFocus={() => handleFocus("amount")}
                      onBlur={handleBlur}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-6 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all duration-300 backdrop-blur-sm text-2xl font-bold"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-cyan-300 text-lg">₹</span>
                    </div>
                  </div>
                </div>

                {/* Amount Breakdown */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Amount:</span>
                      <span className="text-white font-semibold">
                        ₹ {formData.amount || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Admin Fee:</span>
                      <span className="text-white font-semibold">
                        ₹ {formData.adminFee}
                      </span>
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-cyan-200 font-bold">Total:</span>
                        <span className="text-white font-bold text-xl">
                          ₹ {totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Status Dropdown - Mobile Optimized */}
                <div className="relative" ref={dropdownRef}>
                  <label className="flex items-center text-sm font-semibold text-cyan-200 mb-3">
                    <Shield className="w-5 h-5 mr-2" />
                    Payment Status
                  </label>

                  {/* Dropdown Trigger */}
                  <button
                    type="button"
                    onClick={toggleDropdown}
                    className={`w-full p-4 border-2 rounded-2xl text-left transition-all duration-300 backdrop-blur-sm ${
                      selectedStatus
                        ? `border-${
                            selectedStatus.color.split("-")[1]
                          }-500 bg-${
                            selectedStatus.color.split("-")[1]
                          }-500/10 text-white`
                        : "border-white/10 bg-white/5 text-gray-300 hover:border-cyan-500"
                    } ${
                      isDropdownOpen
                        ? "border-cyan-500 ring-2 ring-cyan-500/20"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        {selectedStatus ? (
                          <>
                            <div
                              className={`p-2 rounded-lg ${selectedStatus.color} text-white mr-3 flex-shrink-0`}
                            >
                              {selectedStatus.icon}
                            </div>
                            <div className="text-left min-w-0 flex-1">
                              <div className="font-semibold truncate">
                                {selectedStatus.label}
                              </div>
                              <div className="text-xs text-gray-300 mt-1 truncate">
                                {selectedStatus.description}
                              </div>
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-400 truncate">
                            Select payment status
                          </span>
                        )}
                      </div>
                      {isDropdownOpen ? (
                        <ChevronUp
                          className="text-cyan-400 flex-shrink-0 ml-2"
                          size={20}
                        />
                      ) : (
                        <ChevronDown
                          className="text-gray-400 flex-shrink-0 ml-2"
                          size={20}
                        />
                      )}
                    </div>
                  </button>

                  {/* Dropdown Menu - Responsive */}
                  {isDropdownOpen && (
                    <>
                      {/* Mobile Backdrop */}
                      <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsDropdownOpen(false)}
                      />

                      {/* Dropdown Content */}
                      <div className="fixed lg:absolute inset-x-4 lg:inset-x-0 top-1/2 lg:top-full lg:mt-2 transform -translate-y-1/2 lg:translate-y-0 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto lg:max-h-60">
                        <div className="p-2">
                          {statusOptions.map((status, index) => (
                            <button
                              key={status.value}
                              type="button"
                              onClick={() => handleStatusSelect(status)}
                              className={`w-full p-4 rounded-xl text-left transition-all duration-300 hover:bg-white/5 ${
                                formData.paymentStatus === status.value
                                  ? `bg-gradient-to-r ${status.gradient} text-white shadow-lg`
                                  : "text-gray-300 hover:text-white"
                              } ${
                                index < statusOptions.length - 1 ? "mb-2" : ""
                              }`}
                            >
                              <div className="flex items-center">
                                <div
                                  className={`p-2 rounded-lg ${status.color} text-white mr-3 flex-shrink-0`}
                                >
                                  {status.icon}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                  <div className="font-semibold">
                                    {status.label}
                                  </div>
                                  <div className="text-xs opacity-80 mt-1">
                                    {status.description}
                                  </div>
                                </div>
                                {formData.paymentStatus === status.value && (
                                  <Check
                                    className="text-white ml-2 flex-shrink-0"
                                    size={16}
                                  />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-8">
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="group relative w-full max-w-md bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Button content */}
                <div className="relative flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-3" size={24} />
                      <span className="text-lg">Processing...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">Process Payment</span>
                      <ArrowRight
                        className={`ml-3 transition-transform duration-500 ${
                          isHovering ? "translate-x-2" : ""
                        }`}
                        size={20}
                      />
                    </>
                  )}
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000">
                  <div className="w-1/2 h-full bg-white/20"></div>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="rounded-3xl w-full max-w-md relative overflow-visible animate-fadeIn">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition z-10"
            >
              <X size={24} />
            </button>

            {/* TOP CARD */}
            <div className="bg-white pt-8 pb-10 px-6 text-center rounded-3xl">
              <div
                className={`w-20 h-20 ${modalConfig.iconBg} rounded-full flex items-center justify-center mx-auto mb-4 text-white`}
              >
                {modalConfig.icon}
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {modalConfig.title}
              </h2>
              <p className="text-gray-500 text-sm px-4 leading-relaxed">
                {modalConfig.message}
              </p>
              {/* Progress bar for processing state */}
              {/* {formData.paymentStatus === "Processing" && (
                <div className="mt-4 px-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${paymentProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Processing...</span>
                    <span>{Math.round(paymentProgress)}%</span>
                  </div>
                </div>
              )} */}
            </div>

            {/* RECEIPT COMING OUT */}
            <div className="w-[90%] mx-auto flex justify-center -mt-9 h-0 overflow-hidden border-10 border-gray-300 rounded-4xl"></div>
            <div className="w-[82%] mx-auto pb-6 -mt-4 overflow-hidden bg-transparent relative">
            <div className="absolute -top-3 left-0 right-0 h-6 bg-white/30 shadow-[0_-4px_20px_0_rgba(255,255,255,0.5)] blur-md z-0 rounded-t-3xl"></div>
            <div className="absolute -top-2 left-0 right-0 h-4 bg-white/40 shadow-[0_-2px_15px_0_rgba(255,255,255,0.6)] blur-sm z-0 rounded-t-3xl"></div>
              {/* Zigzag at top (where it comes out of card) */}
              <svg
                className="relative top-5 left-0 right-0 mx-auto"
                width="100%"
                height="9"
                viewBox="0 0 100 6"
                preserveAspectRatio="none"
              >
                <polyline
                  points="
              0,0 2,6 4,0 6,6 8,0 10,6 12,0 14,6 16,0 18,6
              20,0 22,6 24,0 26,6 28,0 30,6 32,0 34,6 36,0 38,6
              40,0 42,6 44,0 46,6 48,0 50,6 52,0 54,6 56,0 58,6
              60,0 62,6 64,0 66,6 68,0 70,6 72,0 74,6 76,0 78,6
              80,0 82,6 84,0 86,6 88,0 90,6 92,0 94,6 96,0 98,6 100,0
            "
                  stroke="#e0dadaff"
                  fill="none"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Receipt content - removed horizontal padding */}
              <div className="bg-white">
                {/* Amount */}
                <div className="text-center mb-6 p-6 pb-0">
                  <div className="text-4xl font-bold text-gray-800">
                    ₹{formData.amount}
                  </div>
                  <div className="text-gray-500 text-sm mt-1 font-bold text-gray-800">
                    Rupees{" "}
                    {formData.amount
                      ? convertNumberToWords(formData.amount)
                      : ""}{" "}
                    Only
                  </div>
                </div>

                {/* Border that touches edges */}
                <div className="border-t-3 border-t-gray-200 mx-0"></div>

                {/* Details - removed horizontal padding */}
                <div className="space-y-4 text-sm p-6 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">
                      Account number
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {formData.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">
                      Payment time
                    </span>
                    <span className="text-gray-800 font-medium font-semibold">
                      {currentDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">
                      Sender&apos;s name
                    </span>
                    <span className="text-gray-800 font-medium font-semibold">
                      {formData.senderName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">
                      Payment type
                    </span>
                    <span className="text-gray-800 font-medium font-semibold">
                      {formData.paymentType}
                    </span>
                  </div>
                  {/* <div className="border-t-2 border-t-gray-300 mx-0"></div> */}
                  <div className="border-t-3 border-t-gray-200 mx-[-24px]"></div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">
                      Admin fee
                    </span>
                    <span className="text-gray-800 font-medium font-semibold">
                      ₹ {formData.adminFee}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">Amount</span>
                    <span className="text-gray-800 font-medium font-semibold">
                      ₹ {formData.amount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom zigzag of the receipt */}
              <svg
                className="rotate-180"
                width="100%"
                height="7"
                viewBox="0 0 100 12"
                preserveAspectRatio="none"
              >
                <polygon
                  points="
              0,6 2,0 4,6 6,0 8,6 10,0 12,6 14,0 16,6 18,0
              20,6 22,0 24,6 26,0 28,6 30,0 32,6 34,0 36,6 38,0
              40,6 42,0 44,6 46,0 48,6 50,0 52,6 54,0 56,6 58,0
              60,6 62,0 64,6 66,0 68,6 70,0 72,6 74,0 76,6 78,0
              80,6 82,0 84,6 86,0 88,6 90,0 92,6 94,0 96,6 98,0 100,6
              100,12 0,12
            "
                  fill="white"
                  stroke="#e0dadaff"
                  strokeWidth="0.5"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Add custom animations */}
      <style jsx global>{`
        @keyframes modalEnter {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes dropdownFade {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-modalEnter {
          animation: modalEnter 0.3s ease-out;
        }

        .animate-bounceIn {
          animation: bounceIn 0.6s ease-out;
        }

        .animate-dropdownFade {
          animation: dropdownFade 0.2s ease-out;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}