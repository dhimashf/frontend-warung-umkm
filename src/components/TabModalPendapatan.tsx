'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCreditCard, FaMoneyBillWave, FaKey } from 'react-icons/fa';

type Transaction = {
    id: number;
    date: string;
    amount: number;
    description: string;
    buktiUrl: string;
    productName?: string;
};

type TabModalPendapatanProps = {
    isOpen: boolean;
    onClose: () => void;
};

type Pembelian = {
    id: number;
    jenis_pembayaran: 'CREDIT' | 'CASH';
};

type Bukti = {
    id: number;
    id_pembelian: number;
    tanggal: string;
    jumlah: number;
    bukti: string;
};

type Produk = {
    id: number;
    id_pembelian: number;
    jenis_produk: string;
};

type Sewa = {
    id: number;
    tanggal: string;
    jumlah: number;
    bukti: string;
};

const TabModalPendapatan: React.FC<TabModalPendapatanProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'kredit' | 'cash' | 'sewa'>('kredit');
    const [transactions, setTransactions] = useState<Record<string, Transaction[]>>({
        kredit: [],
        cash: [],
        sewa: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const currentDate = new Date();
                const currentMonth = currentDate.getMonth();
                const currentYear = currentDate.getFullYear();

                // Fetch pembelian data
                const pembelianResponse = await axios.get<{ success: boolean; data: Pembelian[] }>(
                    process.env.NEXT_PUBLIC_API_URL + '/api/pembelian', config
                );
                const pembelianData = pembelianResponse.data;

                if (!pembelianData.success) return;

                const kreditIds = pembelianData.data
                    .filter((item) => item.jenis_pembayaran === 'CREDIT')
                    .map((item) => item.id);

                const cashIds = pembelianData.data
                    .filter((item) => item.jenis_pembayaran === 'CASH')
                    .map((item) => item.id);

                // Fetch bukti data
                const buktiResponse = await axios.get<{ success: boolean; data: Bukti[] }>(
                    process.env.NEXT_PUBLIC_API_URL + '/api/bukti', config
                );
                const buktiData = buktiResponse.data;

                if (!buktiData.success) return;

                // Fetch produk data
                const produkResponse = await axios.get<{ success: boolean; data: Produk[] }>(
                    process.env.NEXT_PUBLIC_API_URL + '/api/produk', config
                );
                const produkData = produkResponse.data;

                if (!produkData.success) return;

                // Fetch sewa data
                const sewaResponse = await axios.get<{ success: boolean; data: Sewa[] }>(
                    process.env.NEXT_PUBLIC_API_URL + '/api/sewa', config
                );
                const sewaData = sewaResponse.data;

                if (!sewaData.success) return;

                const kreditTransactions: Transaction[] = [];
                const cashTransactions: Transaction[] = [];
                const sewaTransactions: Transaction[] = [];

                buktiData.data.forEach((item) => {
                    const transactionDate = new Date(item.tanggal);
                    if (
                        transactionDate.getMonth() === currentMonth &&
                        transactionDate.getFullYear() === currentYear
                    ) {
                        const product = produkData.data.find((prod) => prod.id_pembelian === item.id_pembelian);

                        const transaction: Transaction = {
                            id: item.id,
                            date: transactionDate.toLocaleDateString(),
                            amount: item.jumlah,
                            description: kreditIds.includes(item.id_pembelian)
                                ? 'Pembelian Kredit'
                                : cashIds.includes(item.id_pembelian)
                                    ? 'Pembelian Cash'
                                    : 'Pembayaran Lainnya',
                            buktiUrl: item.bukti,
                            productName: product ? product.jenis_produk : 'Tidak Diketahui',
                        };

                        if (kreditIds.includes(item.id_pembelian)) {
                            kreditTransactions.push(transaction);
                        }

                        if (cashIds.includes(item.id_pembelian)) {
                            cashTransactions.push(transaction);
                        }
                    }
                });

                // Map sewa data to transactions
                sewaData.data.forEach((item) => {
                    const transactionDate = new Date(item.tanggal);
                    if (
                        transactionDate.getMonth() === currentMonth &&
                        transactionDate.getFullYear() === currentYear
                    ) {
                        const transaction: Transaction = {
                            id: item.id,
                            date: transactionDate.toLocaleDateString(),
                            amount: item.jumlah,
                            description: 'Pembayaran Sewa',
                            buktiUrl: item.bukti,
                        };
                        sewaTransactions.push(transaction);
                    }
                });

                setTransactions({
                    kredit: kreditTransactions,
                    cash: cashTransactions,
                    sewa: sewaTransactions,
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    if (!isOpen) return null;

    const calculateTotal = (type: 'kredit' | 'cash' | 'sewa') => {
        return transactions[type].reduce((total, transaction) => total + transaction.amount, 0);
    };

    const renderTransactions = (type: 'kredit' | 'cash' | 'sewa') => {
        return transactions[type].map((transaction) => (
            <div
                key={transaction.id}
                className="flex py-2 border-b border-gray-200 last:border-b-0"
            >
                <span className="w-1/5 text-center bg-slate-300 py-1">{transaction.date}</span>
                <span className="w-1/5 text-center py-1">Rp {transaction.amount.toLocaleString()}</span>
                <span className="w-1/5 text-center py-1">{transaction.description}</span>
                <span className="w-1/5 text-center py-1">{transaction.productName || '-'}</span>
                <span className="w-1/5 text-center py-1">
                    {transaction.buktiUrl ? <a href={transaction.buktiUrl} target="_blank" rel="noopener noreferrer">Lihat Bukti</a> : '-'}
                </span>
            </div>
        ));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg md:max-w-7xl w-full mx-auto overflow-hidden">
                {/* Close Button */}
                <button
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                    onClick={onClose}
                >
                    ✕
                </button>
                <div className="flex bg-gray-100">
                    {(['kredit', 'cash', 'sewa'] as const).map((tab) => (
                        <button
                            key={tab}
                            className={`flex-1 py-3 px-4 text-primary text-center font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === tab ? 'bg-white' : 'hover:bg-gray-200'
                                }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'kredit' && <FaCreditCard />}
                            {tab === 'cash' && <FaMoneyBillWave />}
                            {tab === 'sewa' && <FaKey />}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="md:p-6 p-2">
                    <h2 className="text-2xl font-bold mb-4 text-primary">
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Transaksi
                    </h2>
                    <div className="space-y-2 text-black">{renderTransactions(activeTab)}</div>
                    <div className="mt-4 text-lg font-semibold text-primary">
                        Total: Rp {calculateTotal(activeTab).toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TabModalPendapatan;
