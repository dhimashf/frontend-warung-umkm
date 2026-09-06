import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import L from 'leaflet';

interface Location {
    boothId: string;
    name: string;
    lat: number;
    lng: number;
}

interface ApiLocation {
    booth_id_booth: string;
    nama: string;
    lokasi: string; // Format: "lat,lng"
}

// Properly set custom icon URLs without modifying _getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function LocationMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const [locations, setLocations] = useState<Location[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!mapRef.current) return;

        // Fetch data from the API
        const fetchLocations = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/penyewaan/lokasi', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success && Array.isArray(data.data)) {
                    const formattedLocations: Location[] = data.data.map((item: ApiLocation) => {
                        const [lat, lng] = item.lokasi.split(',').map(Number);
                        return {
                            boothId: item.booth_id_booth,
                            name: item.nama,
                            lat,
                            lng,
                        };
                    });
                    setLocations(formattedLocations);
                }
            } catch (error) {
                console.error('Error fetching locations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, []);

    useEffect(() => {
        if (!mapRef.current || !locations) return;

        // Initialize map
        const map = L.map(mapRef.current).setView([0.4547, 101.3824], 14);
        mapInstanceRef.current = map;

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Add markers to the map
        locations.forEach((location) => {
            const marker = L.marker([location.lat, location.lng]).addTo(map);

            // Add popup to marker
            marker.bindPopup(`
       
        <h3 class="text-lg font-semibold text-primary text-gray-800">Booth ID: ${location.boothId}</h3>
        <p class="text-sm text-gray-600">Penyewa: ${location.name}</p>
    
      `);
        });

        // Resize map when window is resized
        const handleResize = () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize();
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            // Clean up map instance and event listeners
            map.remove();
            window.removeEventListener('resize', handleResize);
        };
    }, [locations]);

    return (
        <div className="w-full bg-white rounded-lg shadow-md">
            <div className=" px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Lokasi Barang di Sewa</h2>
            </div>
            <div className="p-4">
                <div className="relative z-0 w-full h-[300px] md:h-[500px] rounded-lg overflow-hidden">
                    <div ref={mapRef} className="w-full h-full" />
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <FiLoader className="w-6 h-6 animate-spin" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default dynamic(() => Promise.resolve(LocationMap), { ssr: false });
