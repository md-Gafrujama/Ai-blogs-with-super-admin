"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import { baseURL } from "@/config/api";

export default function EditBlogPage() {
  const { id } = useParams();
  const { axios } = useAppContext();
  const router = useRouter();

  // state aligned with BlogModel schema
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    author: "",
    image: "",
    company: "",

  });

  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchBlog = async () => {
    try {
      const { data } = await axios.get(`${baseURL}/api/blog/getBlogById/${id}`);
      
      if (data) {
        setFormData({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          author: data.author || "",
          image: data.image || "",
          company: data.company || "",
        });
      } else {
        toast.error("Blog not found");
      }
    } catch (error) {
      toast.error("Failed to fetch blog");
    } finally {
      setLoading(false);
    }
  };
  
  if (id) fetchBlog();
}, [id]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `${baseURL}/api/admin/editBlog/${id}`,
        formData
      );
      if (data.message) {
        toast.success("Blog updated successfully");
        router.push("/admin/blogList");
      }
    } catch (error) {
      toast.error("Error updating blog");
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading blog...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Blog</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="border p-2 rounded"
          placeholder="Blog Title"
        />

        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="border p-2 rounded"
          placeholder="Blog Description"
          rows={6}
        />

        <input
          type="text"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="border p-2 rounded"
          placeholder="Category"
        />

        <input
          type="text"
          value={formData.author}
          onChange={(e) =>
            setFormData({ ...formData, author: e.target.value })
          }
          className="border p-2 rounded"
          placeholder="Author"
        />

        <input
          type="text"
          value={formData.company}
          onChange={(e) =>
            setFormData({ ...formData, company: e.target.value })
          }
          className="border p-2 rounded"
          placeholder="Company"
        />



        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Update Blog
        </button>
      </form>
    </div>
  );
}
