"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";

// Tipe untuk data yang diterima dari API
interface APIProduct {
  id: number;
  jenis: string;
  ukuran: string;
  harga: string;
  foto: string | null;
}

// Tipe untuk produk yang digunakan di aplikasi
interface Product {
  id: number;
  name: string;
  price: number;
  dimensions: string;
  image: string;
  deskripsi: string;
}

const ProdukPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          process.env.NEXT_PUBLIC_API_URL + "/api/dokumentasi"
        );
        const data = response.data;
        if (data.success) {
          // Transform API data to match Product type
          const transformedProducts = data.data.map(
            (item: APIProduct): Product => ({
              id: item.id,
              name: item.jenis,
              price: parseInt(item.harga, 10) || 0, // Convert harga to number
              dimensions: item.ukuran,
              image: item.foto || "https://via.placeholder.com/150", // Placeholder if no image
              deskripsi: `Produk ${item.jenis} dengan ukuran ${item.ukuran}`,
            })
          );
          setProducts(transformedProducts);
        } else {
          console.error("Failed to fetch products: ", data.message);
        }
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchProducts();
  }, []);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <main className="p-8">
        <div className="max-w-full mx-auto justify-center lg:max-w-6xl">
          <h1 className="text-3xl font-semibold mb-6 text-black">
            Produk - produk yang kami buat di Warung UMKM Riau
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <div key={product.id} className="shadow-lg hover:shadow-xl">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  dimensions={product.dimensions}
                  image={product.image}
                  onClick={() => openModal(product)}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          isOpen={isModalOpen}
          onClose={closeModal}
          product={selectedProduct}
        />
      )}
    </>
  );
};

export default ProdukPage;
