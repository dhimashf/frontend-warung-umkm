"use client";
import Accordion from "@/components/Accordion";
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { FadeIn } from "@/components/animations/FadeIn";

export default function TentangFrame() {
  return (
    <FadeIn className="max-w-6xl bg-foreground rounded-xl shadow-xl mx-auto min-h-screen flex flex-col text-black">
      <div className="flex-grow  container mx-auto px-8 py-8">
        <h1 className="text-center text-5xl font-bold">Tentang Kami</h1>
        {/* Contact Information */}
        <section className="mb-6 mt-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Siapa Kami</h2>
          <p className="text-gray-700 leading-relaxed">
            Selamat datang di Warung UMKM Riau. Kami hadir untuk mendukung sektor UMKM.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Layanan Kami</h2>
          <p className="text-gray-700 leading-relaxed">
            Kami menyediakan produk seperti booth container, meja, etalase, dan lainnya.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Kontak Kami</h2>
          <div className="text-gray-700 leading-relaxed">
            <p className="flex items-center mb-2">
              <FaMapMarkerAlt className="text-red-500 mr-2" />
              Perum Padi Mas Citra 1 Block B/4, Kelurahan Sialang Mungu, Kecamatan Tuah Madani, Kota Pekanbaru - Riau
            </p>
            <p className="flex items-center mb-2">
              <FaPhone className="text-green-500 mr-2" />
              [Masukkan Nomor Telepon Anda]
            </p>
            <p className="flex items-center">
              <FaEnvelope className="text-blue-500 mr-2" />
              [Masukkan Email Anda]
            </p>
          </div>
        </section>
      </div>

          {/* FAQ Section */}
          <div className="bg-white p-6 rounded-lg ">
            <h2 className="text-xl font-semibold mb-4">Pertanyaan Umum (FAQ)</h2>
            <Accordion
              items={[
                {
                  title: "Bagaimana cara melakukan pemesanan?",
                  content:
                    "Untuk melakukan pemesanan, anda dapat menghubungi kami melalui WhatsApp atau sosial media kami. Refrensi model yang dapat anda gunakan, bisa anda lihat pada halaman Produk",
                },
                {
                  title: "Bagaimana cara melakukan penyewaan booth?",
                  content:
                    "Untuk melakukan penyewaan, anda dapat beralih ke halaman Layanan dan memilih tab Sewa, setelah membaca aturan sewa, anda dapat melakukan penyewaan. Silakan hubungi kami untuk informasi lebih lanjut.",
                },
                {
                  title: "Apa metode pembayaran yang tersedia?",
                  content:
                    "Kami menerima pembayaran melalui transfer bank, pembayaran tunai, dan pembayaran online melalui platform pembayaran terkait. Silakan hubungi kami untuk informasi lebih lanjut.",
                },
                {
                  title: "Berapa lama waktu pembuatan dari pemesanan?",
                  content:
                    "Waktu pembuatan tergantung model dari desain produk yang diinginkan. Silakan hubungi kami untuk informasi lebih lanjut.",
                },
                {
                  title: "Berapa harga dari penyewaan ?",
                  content:
                    "Saat ini kami hanya menyedian jasa penyewaan Booth Container dengan harga perbulannya Rp, 300.000,00. Silakan hubungi kami untuk informasi lebih lanjut.",
                },
              ]}
            />
          </div>


    </FadeIn>
  );
}
