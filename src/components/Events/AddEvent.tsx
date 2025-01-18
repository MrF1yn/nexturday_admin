import React, { useState } from "react";
import toast from "react-hot-toast";
import { CreateEvent } from "@/api/event";
import { useNavigate } from "react-router-dom";
import { Separator } from "../ui/separator";

//React icons
import { MdArrowBack, MdDelete, MdOutlineFileUpload } from "react-icons/md";
import { CiCirclePlus } from "react-icons/ci";
import { AiOutlineDelete } from "react-icons/ai";

type EventType = "ONLINE" | "OFFLINE";

interface VenueType {
  name: string;
  mapUrl: string;
}

interface DetailType {
  name: string;
  about: string;
  from: string;
  to: string;
  type: EventType;
  venue: VenueType;
}

interface FormDataType {
  eventName: string;
  about: string;
  guidelines: string[];
  eventType: EventType;
  fromDate: string;
  toDate: string;
  website?: string;
  emails: string[];
  contactNumbers: string[];
  registrationUrl?: string;
  isPaidEvent: boolean;
  price?: number;
  deadline: string;
  selectedFile: File | null;
  details: DetailType[];
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-96 rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800">Are you sure?</h2>
        <p className="text-sm text-gray-600 mt-2">{message}</p>
        <div className="mt-4 flex justify-end gap-4">
          <button
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const AddEvent: React.FC = () => {
  const [formData, setFormData] = useState<FormDataType>({
    eventName: "",
    about: "",
    guidelines: [""],
    eventType: "ONLINE",
    fromDate: "",
    toDate: "",
    website: "",
    emails: [""],
    contactNumbers: [""],
    registrationUrl: "",
    isPaidEvent: false,
    price: 0,
    deadline: "",
    selectedFile: null,
    details: [
      {
        name: "",
        about: "",
        from: "",
        to: "",
        type: "ONLINE",
        venue: {
          name: "",
          mapUrl: "",
        },
      },
    ],
  });

  const [isModalOpen, setModalOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value, type } = e.target;

    // Handle checkbox inputs
    const checked =
      type === "checkbox" && e.target instanceof HTMLInputElement
        ? e.target.checked
        : undefined;

    // Handle file inputs
    const file =
      type === "file" && e.target instanceof HTMLInputElement
        ? e.target.files?.[0] // Get the first selected file
        : undefined;

    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : type === "file" ? file : value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    const file = e.target.files?.[0] || null;

    // Reset the input value to allow re-selecting the same file
    e.target.value = "";

    setFormData((prev) => ({
      ...prev,
      [key]: file,
    }));
  };

  const handleAddGuideline = () => {
    setFormData((prev) => ({
      ...prev,
      guidelines: [...prev.guidelines, ""],
    }));
  };

  const handleGuidelineChange = (index: number, value: string) => {
    const updatedGuidelines = [...formData.guidelines];
    updatedGuidelines[index] = value; // Allow users to edit freely
    setFormData((prev) => ({
      ...prev,
      guidelines: updatedGuidelines,
    }));
  };

  const handleRemoveGuideline = (index: number) => {
    const updatedGuidelines = formData.guidelines.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      guidelines: updatedGuidelines.length > 0 ? updatedGuidelines : [""],
    }));
  };

  const handleAddContactNumber = () => {
    setFormData((prev) => ({
      ...prev,
      contactNumbers: [...prev.contactNumbers, ""],
    }));
  };

  const handleContactNumberChange = (index: number, value: string) => {
    const updatedContacts = [...formData.contactNumbers];
    updatedContacts[index] = value.trim(); // Remove leading/trailing spaces
    setFormData((prev) => ({
      ...prev,
      contactNumbers: updatedContacts,
    }));
  };

  const handleRemoveContactNumber = (index: number) => {
    const updatedContacts = formData.contactNumbers.filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({
      ...prev,
      contactNumbers: updatedContacts.length > 0 ? updatedContacts : [""], // Remove empty strings
    }));
  };

  const handleAddEmail = () => {
    setFormData((prev) => ({
      ...prev,
      emails: [...prev.emails, ""],
    }));
  };

  const handleEmailChange = (index: number, value: string) => {
    const updatedEmails = [...formData.emails];
    updatedEmails[index] = value.trim(); // Remove leading/trailing spaces
    setFormData((prev) => ({
      ...prev,
      emails: updatedEmails,
    }));
  };

  const handleRemoveEmail = (index: number) => {
    const updatedEmails = formData.emails.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      emails: updatedEmails.length > 0 ? updatedEmails : [""], // Remove empty strings
    }));
  };

  const handleDetailFieldChange = (
    index: number,
    field: keyof DetailType,
    value: string | EventType,
    subField?: keyof VenueType
  ) => {
    setFormData((prevState) => {
      const updatedDetails = [...prevState.details];

      if (field === "venue" && subField) {
        updatedDetails[index].venue[subField] = value as string;
      } else if (field === "type") {
        updatedDetails[index].type = value as EventType;
      } else if (field !== "venue") {
        updatedDetails[index][field] = value as DetailType[typeof field];
      }

      return { ...prevState, details: updatedDetails };
    });
  };

  const addSubEvent = () => {
    setFormData((prevState) => ({
      ...prevState,
      details: [
        ...prevState.details,
        {
          name: "",
          about: "",
          from: "",
          to: "",
          type: "ONLINE",
          venue: {
            name: "",
            mapUrl: "",
          },
        },
      ],
    }));
  };

  const removeSubEvent = (index: number) => {
    setFormData((prevState) => ({
      ...prevState,
      details: prevState.details.filter((_, i) => i !== index),
    }));
    setModalOpen(false);
  };

  const confirmDelete = (index: number) => {
    setDeleteIndex(index);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // console.log("formData", formData);
    const {
      eventName,
      about,
      guidelines,
      eventType,
      fromDate,
      toDate,
      emails,
      contactNumbers,
      isPaidEvent,
      price,
      deadline,
      details,
      website,
      registrationUrl,
    } = formData;

    if (
      !eventName.trim() ||
      !about.trim() ||
      !eventType.trim() ||
      !fromDate.trim() ||
      !toDate.trim() ||
      !deadline.trim() ||
      guidelines.some((g) => !g.trim()) ||
      emails.some((email) => !email.trim()) ||
      contactNumbers.some((number) => !number.trim()) ||
      !formData.selectedFile
    ) {
      toast.error("Please fill in all required fields!");
      return;
    }

    // Convert dates to ISO format
    const fromISO = new Date(formData.fromDate).toISOString();
    const toISO = new Date(formData.toDate).toISOString();

    if (fromISO > toISO) {
      toast.error("Event start date cannot be later than the end date!");
      return;
    }

    if (new Date(deadline).toISOString() >= toISO) {
      toast.error(
        "Registration deadline must be earlier than the event end date!"
      );
      return;
    }

    for (const [index, detail] of details.entries()) {
      if (!detail.name.trim() || !detail.about.trim()) {
        toast.error(`Sub Event ${index + 1} is missing required fields!`);
        return;
      }

      if (!detail.from.trim() || !detail.to.trim()) {
        toast.error(`Sub Event ${index + 1} must have valid dates!`);
        return;
      }
      const subEventFromDate = new Date(detail.from).toISOString();
      const subEventToDate = new Date(detail.to).toISOString();

      if (subEventFromDate > subEventToDate) {
        toast.error(
          `Sub Event ${index + 1} start date cannot be later than its end date!`
        );
        return;
      }

      if (subEventFromDate < fromISO || subEventToDate > toISO) {
        toast.error(
          `Sub Event ${
            index + 1
          }'s dates must be within the range of the main event dates!`
        );
        return;
      }
    }

    if (isPaidEvent) {
      if (!price || isNaN(price) || price <= 0) {
        toast.error(
          "Price is required and must be a valid positive number for paid events!"
        );
        return;
      }

      if (!website || !website.trim()) {
        toast.error("Website URL is required for paid events!");
        return;
      }

      if (!registrationUrl || !registrationUrl.trim()) {
        // Check for `undefined` or empty value
        toast.error("Registration URL is required for paid events!");
        return;
      }
    }

    // Create FormData
    const formDataToSend = new FormData();
    formDataToSend.append("name", eventName);
    formDataToSend.append("about", about);
    formDataToSend.append("websiteUrl", website || "");
    formDataToSend.append("registrationUrl", registrationUrl || "");

    formDataToSend.append("price", isPaidEvent ? String(price) : "0");
    formDataToSend.append("from", fromISO);
    formDataToSend.append("to", toISO);
    formDataToSend.append("paid", isPaidEvent.toString());
    formDataToSend.append(
      "deadline",
      new Date(formData.deadline).toISOString()
    );

    const validEmails = formData.emails.filter((email) => email.trim());
    const validGuidelines = formData.guidelines.filter((g) => g.trim());
    const validContactNumbers = formData.contactNumbers.filter((n) => n.trim());

    validEmails.forEach((email, index) => {
      formDataToSend.append(`emails[${index}]`, email);
    });
    validGuidelines.forEach((g, index) =>
      formDataToSend.append(`guidlines[${index}]`, g)
    );
    validContactNumbers.forEach((n, index) =>
      formDataToSend.append(`phoneNumbers[${index}]`, n)
    );

    const formattedDetails = formData.details.map((detail) => ({
      ...detail,
      from: new Date(detail.from).toISOString(),
      to: new Date(detail.to).toISOString(),
    }));

    // Append formatted details to FormData
    formDataToSend.append("details", JSON.stringify(formattedDetails));
    formDataToSend.append("images", formData.selectedFile);

    // Show loader toast
    const toastId = toast.loading("Submitting form...");

    try {
      const response = await CreateEvent(formDataToSend);

      toast.dismiss(toastId);
      toast.success("Event Added successfully!");

      // console.log("Response:", response);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Error submitting form. Please try again.");
      console.error("Error:", error);
      throw error;
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center items-center px-6 lg:px-16 py-8">
      <div className="w-full max-w-5xl p-8 lg:p-12">
        <div className="bg-gray-800 p-6 lg:p-8 rounded-t-lg">
          <button
            type="button"
            className="flex items-center text-white font-semibold mb-4 hover:text-blue-300 transition-all duration-300 focus:outline-none"
            onClick={() => {
              navigate("/admin-dashboard");
            }}
          >
            <MdArrowBack className="mr-2" size={24} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-white">Add New Event</h1>
        </div>
        {/* Form Section */}
        <div className="bg-white shadow-lg rounded-b-lg p-6 lg:p-8">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Event Name */}
            <div className="flex flex-col gap-2">
              <label
                className="text-gray-700 text-sm font-bold"
                htmlFor="eventName"
              >
                Event Name <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="eventName"
                placeholder="Enter event name"
                value={formData.eventName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
              />
            </div>

            {/* Event Image */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 text-sm font-bold">
                Event Image <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => document.getElementById("eventImage")?.click()}
                  className="bg-blue-500 flex items-center justify-center gap-2 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200"
                >
                  <MdOutlineFileUpload size={20} /> <span>Upload Image</span>
                </button>
                {formData.selectedFile && (
                  <>
                    <span className="text-gray-600 text-sm">
                      {formData.selectedFile.name}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          selectedFile: null,
                        }))
                      }
                      className="text-red-500 hover:text-red-600"
                    >
                      <MdDelete size={20} />
                    </button>
                  </>
                )}
              </div>
              <input
                type="file"
                id="eventImage"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, "selectedFile")}
              />
            </div>

            {/* Display Image Preview */}
            {formData.selectedFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-700">Selected Image:</p>
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(formData.selectedFile)}
                    alt="Selected Event"
                    className="w-full h-64 object-contain"
                  />
                </div>
              </div>
            )}

            {/* About */}
            <div className="flex flex-col gap-2">
              <label
                className="text-gray-700 text-sm font-bold"
                htmlFor="about"
              >
                About <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                id="about"
                rows={4}
                placeholder="Enter event description"
                value={formData.about}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 focus:outline-none resize-none"
              ></textarea>
            </div>

            {/* Guidelines Section */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 text-sm font-bold">
                Guidelines <span className="text-red-500 ml-1">*</span>
              </label>
              {formData.guidelines.map((guideline, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={guideline}
                    onChange={(e) =>
                      handleGuidelineChange(index, e.target.value)
                    }
                    placeholder={`Guideline ${index + 1}`}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveGuideline(index)}
                      className="p-2 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200"
                      aria-label="Delete guideline"
                    >
                      <AiOutlineDelete size={20} />
                    </button>
                  )}
                </div>
              ))}
              <div
                onClick={handleAddGuideline}
                className="inline-flex items-center gap-1.5 text-blue-500 hover:text-violet-400 cursor-pointer transition-all duration-300 ease-in-out"
              >
                <CiCirclePlus size={24} />
                <span className="text-sm font-medium">Add Guideline</span>
              </div>
            </div>

            {/* Emails Section */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 text-sm font-bold">
                Emails <span className="text-red-500 ml-1">*</span>
              </label>
              {formData.emails.map((email, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    placeholder={`Email ${index + 1}`}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(index)}
                      className="p-2 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200"
                      aria-label="Delete guideline"
                    >
                      <AiOutlineDelete size={20} />
                    </button>
                  )}
                </div>
              ))}

              <div
                onClick={handleAddEmail}
                className="inline-flex items-center gap-1.5 text-blue-500 hover:text-violet-400 cursor-pointer transition-all duration-300 ease-in-out"
              >
                <CiCirclePlus size={24} />
                <span className="text-sm font-medium">Add Email</span>
              </div>
            </div>

            {/* Contact Numbers Section */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 text-sm font-bold">
                Contact Numbers <span className="text-red-500 ml-1">*</span>
              </label>
              {formData.contactNumbers.map((contact, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="number"
                    value={contact}
                    onChange={(e) =>
                      handleContactNumberChange(index, e.target.value)
                    }
                    placeholder={`Contact Number ${index + 1}`}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveContactNumber(index)}
                      className="p-2 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200"
                      aria-label="Delete guideline"
                    >
                      <AiOutlineDelete size={20} />
                    </button>
                  )}
                </div>
              ))}
              <div
                onClick={handleAddContactNumber}
                className="inline-flex items-center gap-1.5 text-blue-500 hover:text-violet-400 cursor-pointer transition-all duration-300 ease-in-out"
              >
                <CiCirclePlus size={24} />
                <span className="text-sm font-medium"> Add Contact Number</span>
              </div>
            </div>

            {/* Registration URL */}
            <div className="flex flex-col gap-2">
              <label
                className="text-gray-700 text-sm font-bold"
                htmlFor="registrationUrl"
              >
                Registration URL
              </label>
              <input
                type="url"
                id="registrationUrl"
                value={formData.registrationUrl}
                onChange={handleInputChange}
                placeholder="Enter registration URL"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
              />
            </div>

            {/* Event Dates */}
            <div className="flex flex-col gap-2 md:flex-row md:gap-4">
              <div className="flex flex-col gap-2 flex-grow">
                <label
                  className="text-gray-700 text-sm font-bold"
                  htmlFor="fromDate"
                >
                  From <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="fromDate"
                  value={formData.fromDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-2 flex-grow">
                <label
                  className="text-gray-700 text-sm font-bold"
                  htmlFor="toDate"
                >
                  To <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="toDate"
                  value={formData.toDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Paid Event Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPaidEvent"
                checked={formData.isPaidEvent}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-500 focus:ring focus:ring-blue-200 focus:outline-none"
              />
              <label htmlFor="isPaidEvent" className="text-gray-700 font-bold">
                Is this a paid event?
              </label>
            </div>

            {/* Price and Participant Count */}
            <div className="flex flex-col gap-2 md:flex-row md:gap-4">
              {/* Conditional Price Input */}
              {formData.isPaidEvent && (
                <div className="flex flex-col gap-2 flex-grow">
                  <label
                    className="text-gray-700 text-sm font-bold"
                    htmlFor="price"
                  >
                    Price <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2 flex-grow">
                <label
                  className="text-gray-700 text-sm font-bold"
                  htmlFor="participantCount"
                >
                  Registration Deadline{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  placeholder="Enter  Registration Deadline  "
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Website */}
            <div className="flex flex-col gap-2">
              <label
                className="text-gray-700 text-sm font-bold"
                htmlFor="website"
              >
                Website
              </label>
              <input
                type="url"
                id="website"
                placeholder="Enter website URL"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
              />
            </div>

            {/* Details Section */}
            {formData.details.map((detail, index) => (
              <>
                <div key={index} className="flex flex-col gap-4 relative">
                  {formData.details.length > 1 && index !== 0 && (
                    <button
                      type="button"
                      onClick={() => confirmDelete(index)}
                      className="absolute top-2 right-2 p-2 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200"
                      aria-label="Delete guideline"
                    >
                      <AiOutlineDelete size={20} />
                    </button>
                  )}
                  <h4 className="text-gray-700 text-lg font-bold">
                    Details (Sub Event {index + 1})
                  </h4>
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm font-bold">
                      Name <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={`Enter name for Sub Event ${index + 1}`}
                      value={detail.name}
                      onChange={(e) =>
                        handleDetailFieldChange(index, "name", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm font-bold">
                      About <span className="text-red-500 ml-1">*</span>
                    </label>
                    <textarea
                      placeholder={`Enter description for Sub Event ${
                        index + 1
                      }`}
                      value={detail.about}
                      onChange={(e) =>
                        handleDetailFieldChange(index, "about", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 focus:outline-none resize-none"
                    ></textarea>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm font-bold">
                      From <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={detail.from}
                      onChange={(e) =>
                        handleDetailFieldChange(index, "from", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm font-bold">
                      To <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={detail.to}
                      onChange={(e) =>
                        handleDetailFieldChange(index, "to", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm font-bold">
                      Type <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      value={detail.type}
                      onChange={(e) =>
                        handleDetailFieldChange(index, "type", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
                    >
                      <option value="ONLINE">ONLINE</option>
                      <option value="OFFLINE">OFFLINE</option>
                    </select>
                  </div>
                  {detail.type === "OFFLINE" && (
                    <>
                      <div className="flex flex-col gap-2">
                        <label className="text-gray-700 text-sm font-bold">
                          Venue Name
                        </label>
                        <input
                          type="text"
                          placeholder={`Enter venue name for Sub Event ${
                            index + 1
                          }`}
                          value={detail.venue.name}
                          onChange={(e) =>
                            handleDetailFieldChange(
                              index,
                              "venue",
                              e.target.value,
                              "name"
                            )
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-gray-700 text-sm font-bold">
                          Venue Map URL
                        </label>
                        <input
                          type="text"
                          placeholder={`Enter venue map URL for Sub Event ${
                            index + 1
                          }`}
                          value={detail.venue.mapUrl}
                          onChange={(e) =>
                            handleDetailFieldChange(
                              index,
                              "venue",
                              e.target.value,
                              "mapUrl"
                            )
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
                        />
                      </div>
                      {detail.venue.mapUrl && (
                        <div className="mt-4">
                          <label className="text-gray-600 text-sm font-semibold">
                            Map Preview:
                          </label>
                          <iframe
                            src={detail.venue.mapUrl}
                            title={`Map Preview for Sub Event ${index + 1}`}
                            className="w-full h-64 border border-gray-300 rounded-lg mt-2"
                            allowFullScreen
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                <Separator />
              </>
            ))}

            <div
              onClick={addSubEvent}
              className="inline-flex items-center gap-1.5 text-blue-500 hover:text-violet-400 cursor-pointer transition-all duration-300 ease-in-out"
            >
              <CiCirclePlus size={24} />
              <span className="text-sm font-medium">Add More Sub-Event</span>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
              isOpen={isModalOpen}
              onClose={() => setModalOpen(false)}
              onConfirm={() => {
                if (deleteIndex !== null) {
                  removeSubEvent(deleteIndex);
                }
              }}
              message="This action cannot be undone. Do you want to proceed?"
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Add Event
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default AddEvent;
