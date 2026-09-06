"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal"; // Import modal
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer, StaggerItem } from "@/components/animations/Stagger";

// Define the interface for the API response item
interface APIProduct {
  id: number;
  jenis: string;
  ukuran: string;
  harga: number;
  foto?: string; // Optional if null
}

interface Product {
  id: number;
  jenis: string;
  ukuran: string;
  harga: number;
  foto: string;
  description?: string; // Optional description
}

const ProdukFrame: React.FC = () => {
  // State for product data
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // Modal state

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://backend-umkm-riau.vercel.app/api/dokumentasi"
        );
        const result = await response.json();
        if (result.success) {
          // Format data to match the Product interface
          const formattedData = result.data
            .slice(0, 4)
            .map((item: APIProduct) => ({
              id: item.id,
              jenis: item.jenis,
              ukuran: item.ukuran,
              harga: item.harga,
              foto: item.foto || "https://via.placeholder.com/150", // Placeholder if foto is null
              description: `Produk ${item.jenis} dengan ukuran ${item.ukuran} dan harga Rp ${item.harga}.`,
            }));
          setProducts(formattedData);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchData();
  }, []);

  // Handle product click to open modal
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  return (
    <section className="py-12">
      <FadeIn className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between mb-8 gap-4">
          <div className="max-w-xl text-black">
            <h2 className="text-3xl md:text-5xl font-bold mb-2">
              Katalog Produk
            </h2>
            <p className="text-muted-foreground md:text-xl">
              Kami membuat produk yang berkualitas dengan harga yang terjangkau
            </p>
            <p className="text-muted-foreground md:text-xl">
              Klik selengkapnya jika ingin melihat produk lainnya.
            </p>
          </div>
          {/* Responsive button */}
          <div className="items-center">
            <Link href="../produk">
            <button className="hover:bg-foreground bg-primary text-white hover:text-primary md:px-12 md:py-5 px-6 py-3 rounded-full shadow-lg self-start">
              Selengkapnya {">>"}
            </button>
            </Link>
          </div>
        </div>

        {/* Product grid */}
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 text-black">
          {products.map((product) => (
            <StaggerItem
              key={product.id}
              className="w-full shadow-lg hover:shadow-xl bg-white rounded-lg"
            >
              <ProductCard
                id={product.id} // Maps to id in ProductCard
                name={product.jenis} // Maps 'jenis' to 'name'
                price={product.harga} // Maps 'harga' to 'price'
                dimensions={product.ukuran} // Maps 'ukuran' to 'dimensions'
                image={product.foto} // Maps 'foto' to 'image'
                onClick={() => handleProductClick(product)} // Maps the click handler
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </FadeIn>

      {/* Show modal when a product is selected */}
      {selectedProduct && (
        <ProductDetailModal
          isOpen={!!selectedProduct}
          onClose={handleCloseModal}
          product={{
            id: selectedProduct.id,
            name: selectedProduct.jenis, // Map 'jenis' to 'name'
            price: selectedProduct.harga, // Map 'harga' to 'price'
            dimensions: selectedProduct.ukuran, // Map 'ukuran' to 'dimensions'
            image: selectedProduct.foto, // Map 'foto' to 'image'
            deskripsi: selectedProduct.description || "", // Map 'description'
          }}
        />
      )}
    </section>
  );
};

export default ProdukFrame;
