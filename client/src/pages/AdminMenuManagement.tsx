import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface MenuItem {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: number;
  displayOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface FormData {
  categoryId: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
}

export default function AdminMenuManagement() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    categoryId: 1,
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  const { data: categories } = trpc.menu.categories.useQuery();
  const { data: allMenuItems, refetch: refetchMenuItems } = trpc.menu.all.useQuery();

  const createMutation = trpc.menu.create.useMutation({
    onSuccess: () => {
      toast.success("Menu item created successfully");
      refetchMenuItems();
      resetForm();
      setShowDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create menu item");
    },
  });

  const updateMutation = trpc.menu.update.useMutation({
    onSuccess: () => {
      toast.success("Menu item updated successfully");
      refetchMenuItems();
      resetForm();
      setShowDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update menu item");
    },
  });

  const deleteMutation = trpc.menu.delete.useMutation({
    onSuccess: () => {
      toast.success("Menu item deleted successfully");
      refetchMenuItems();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete menu item");
    },
  });

  const resetForm = () => {
    setFormData({
      categoryId: 1,
      name: "",
      description: "",
      price: "",
      imageUrl: "",
    });
    setEditingId(null);
  };

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        categoryId: item.categoryId,
        name: item.name,
        description: item.description || "",
        price: item.price,
        imageUrl: item.imageUrl || "",
      });
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast.error("Please fill in required fields");
      return;
    }

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        ...formData,
      });
    } else {
      await createMutation.mutateAsync({
        ...formData,
        categoryId: parseInt(formData.categoryId.toString()),
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1e7e34]">Menu Management</h2>
        <Button
          className="bg-[#1e7e34] hover:bg-[#0d5a1f]"
          onClick={() => handleOpenDialog()}
        >
          <Plus size={16} className="mr-2" />
          Add Menu Item
        </Button>
      </div>

      <div className="grid gap-4">
        {allMenuItems?.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-[#1e7e34]">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className="font-semibold text-[#1e7e34]">${item.price}</span>
                  <span className="text-gray-500">
                    Category ID: {item.categoryId}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    item.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(item)}
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Menu Item" : "Add New Menu Item"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Category *</label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
              >
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                placeholder="Menu item name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                placeholder="Item description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Price *</label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                placeholder="e.g., 12.99"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Image URL</label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#1e7e34] hover:bg-[#0d5a1f]"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
