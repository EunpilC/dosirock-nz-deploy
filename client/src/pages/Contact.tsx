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
      toast.success("문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast.error("문의 접수 중 오류가 발생했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold text-[#1e7e34] mb-12">문의하기</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    이름 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                    placeholder="이름을 입력해주세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                    placeholder="이메일을 입력해주세요"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  전화번호
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                  placeholder="전화번호를 입력해주세요"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                  placeholder="문의 제목을 입력해주세요"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  메시지 *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                  placeholder="문의 내용을 입력해주세요"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1e7e34] hover:bg-[#0d5a1f] text-white font-bold py-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "전송 중..." : "문의 전송"}
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
              영업시간
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-semibold">월-금:</span> 11:00 - 20:00
              </p>
              <p>
                <span className="font-semibold">토:</span> 11:00 - 19:00
              </p>
              <p>
                <span className="font-semibold">일:</span> 휴무
              </p>
            </div>
          </Card>

          {/* Phone */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-[#1e7e34] mb-4 flex items-center gap-2">
              <Phone size={20} />
              전화
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
              이메일
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
              위치
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
              지도에서 보기
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
