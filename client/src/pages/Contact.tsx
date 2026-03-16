import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createInquiryMutation = trpc.inquiry.create.useMutation();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createInquiryMutation.mutateAsync(formData);
      toast.success("Your inquiry has been received. We will contact you soon.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast.error("An error occurred while submitting your inquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold text-[#1e7e34] mb-12">Contact Us</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                  placeholder="Enter your subject"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                  placeholder="Enter your message"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1e7e34] hover:bg-[#0d5a1f] text-white font-bold py-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Inquiry"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          {/* Hours */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-[#1e7e34] mb-4 flex items-center gap-2">
              <Clock size={20} />
              Hours
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-semibold">Mon-Fri:</span> 11:00 - 20:00
              </p>
              <p>
                <span className="font-semibold">Sat:</span> 11:00 - 19:00
              </p>
              <p>
                <span className="font-semibold">Sun:</span> Closed
              </p>
            </div>
          </Card>

          {/* Phone */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-[#1e7e34] mb-4 flex items-center gap-2">
              <Phone size={20} />
              Phone
            </h3>
            <a
              href="tel:09-200-0772"
              className="text-[#1e7e34] hover:underline font-semibold"
            >
              09-200-0772
            </a>
          </Card>

          {/* Email */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-[#1e7e34] mb-4 flex items-center gap-2">
              <Mail size={20} />
              Email
            </h3>
            <a
              href="mailto:dosirocknz@gmail.com"
              className="text-[#1e7e34] hover:underline font-semibold break-all"
            >
              dosirocknz@gmail.com
            </a>
          </Card>

          {/* Location */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-[#1e7e34] mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Location
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              39 Chancery Street<br />
              Auckland CBD<br />
              Auckland 1010, NZ
            </p>
            <a
              href="https://maps.google.com/?q=39+Chancery+Street,+Auckland+CBD"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1e7e34] hover:underline font-semibold text-sm"
            >
              View on Map
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
