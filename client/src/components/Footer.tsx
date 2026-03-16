import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1e7e34] text-white mt-12">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">Dosirock</h3>
            <p className="text-sm text-gray-200">
              신선한 재료로 만든 한국 도시락을 제공합니다. 건강하고 맛있는 식사를 경험해보세요.
            </p>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock size={20} />
              영업시간
            </h4>
            <div className="text-sm text-gray-200 space-y-1">
              <p>월-금: 11:00 - 20:00</p>
              <p>토: 11:00 - 19:00</p>
              <p>일: 휴무</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">연락처</h4>
            <div className="text-sm text-gray-200 space-y-2">
              <p className="flex items-center gap-2">
                <Phone size={16} />
                09-200-0772
              </p>
              <p className="flex items-center gap-2">
                <Mail size={16} />
                dosirocknz@gmail.com
              </p>
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin size={20} />
              위치
            </h4>
            <p className="text-sm text-gray-200">
              39 Chancery Street<br />
              Auckland CBD<br />
              Auckland 1010, NZ
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-200">
            <p>&copy; {currentYear} Dosirock. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
