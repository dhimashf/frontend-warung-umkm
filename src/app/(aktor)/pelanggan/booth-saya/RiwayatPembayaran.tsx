import ImageModal from '@/components/ImageModal'; // Import ImageModal
import React, { useState } from 'react';
import { AiOutlineFileImage } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";

interface PaymentRecord {
  date: string;
  amount: string;
  image: string;
}

interface PaymentHistoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  payments: PaymentRecord[];
}

const formatCurrency = (amount: string | number) => {
  const number = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `Rp ${number.toLocaleString('id-ID')}`;
};

const PaymentHistoryPopup: React.FC<PaymentHistoryPopupProps> = ({ isOpen, onClose, payments }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Pop-up utama */}
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative overflow-hidden mx-4">
        <div className="bg-foreground p-4 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-lg font-semibold text-primary">Riwayat Pembayaran</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <RxCross2 size={24} />
          </button>
        </div>
        <div
          className="p-4 overflow-y-auto"
          style={{ maxHeight: '400px' }} // Batasi tinggi maksimal pop-up
        >
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left font-semibold text-gray-600 pb-2">Tanggal</th>
                <th className="text-center font-semibold text-gray-600 pb-2">Jumlah</th>
                <th className="text-right font-semibold text-gray-600 pb-2">Bukti</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={`${payment.date}-${payment.amount}-${index}`} className="border-b border-gray-100 last:border-b-0">
                  <td className="py-3 text-gray-800">{payment.date}</td>
                  <td className="py-3 text-center text-gray-800">{formatCurrency(payment.amount)}</td>
                  <td className="py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setSelectedImage(payment.image)}
                        className="flex items-center bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-green-900 transition-colors"
                      >
                        <AiOutlineFileImage size={20} className="mr-2" />
                        Lihat
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={!!selectedImage} 
        imageSrc={selectedImage || ''}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default PaymentHistoryPopup;
