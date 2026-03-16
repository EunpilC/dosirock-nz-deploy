import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const { data: images } = trpc.gallery.all.useQuery();

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold text-[#1e7e34] mb-4">갤러리</h1>
      <p className="text-gray-600 mb-12">
        Dosirock의 신선한 음식과 매장 분위기를 확인해보세요.
      </p>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images?.map((image) => (
          <Card
            key={image.id}
            className="food-card cursor-pointer overflow-hidden group"
            onClick={() => setSelectedImage(image)}
          >
            <div className="relative h-64 overflow-hidden bg-gray-200">
              {image.imageUrl ? (
                <img
                  src={image.imageUrl}
                  alt={image.title || "Gallery image"}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span>이미지 없음</span>
                </div>
              )}
            </div>
            {image.title && (
              <div className="p-4">
                <h3 className="font-semibold text-[#1e7e34]">{image.title}</h3>
                {image.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {image.description}
                  </p>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.title || "Gallery image"}
              className="w-full h-auto rounded-lg"
            />
            {selectedImage.title && (
              <div className="mt-4 text-white">
                <h2 className="text-2xl font-bold">{selectedImage.title}</h2>
                {selectedImage.description && (
                  <p className="text-gray-300 mt-2">{selectedImage.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
