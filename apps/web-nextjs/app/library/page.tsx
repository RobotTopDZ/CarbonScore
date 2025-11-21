'use client';

import { useState } from 'react';
import SimpleNav from '../../components/layout/SimpleNav';

interface Product {
    id: string;
    name: string;
    category: string;
    brand: string;
    model: string;
    version: string;
    price: number;
    carbonEmission: number;
    energyClass: string;
    yearManufactured: number;
    specifications: {
        power?: string;
        capacity?: string;
        efficiency?: string;
    };
}

const PRODUCTS: Product[] = [
    // Refrigerateurs
    {
        id: 'ref-001',
        name: 'Refrigerateur',
        category: 'Electromenager',
        brand: 'Samsung',
        model: 'RF23R62E3SR',
        version: 'v2023',
        price: 1299,
        carbonEmission: 245,
        energyClass: 'A++',
        yearManufactured: 2023,
        specifications: { capacity: '617L', power: '350W', efficiency: '92%' }
    },
    {
        id: 'ref-002',
        name: 'Refrigerateur',
        category: 'Electromenager',
        brand: 'LG',
        model: 'GBB92STAXP',
        version: 'v2022',
        price: 1299,
        carbonEmission: 189,
        energyClass: 'A+++',
        yearManufactured: 2022,
        specifications: { capacity: '384L', power: '280W', efficiency: '95%' }
    },
    {
        id: 'ref-003',
        name: 'Refrigerateur',
        category: 'Electromenager',
        brand: 'Bosch',
        model: 'KGN39VLDA',
        version: 'v2021',
        price: 899,
        carbonEmission: 312,
        energyClass: 'A+',
        yearManufactured: 2021,
        specifications: { capacity: '366L', power: '420W', efficiency: '88%' }
    },
    {
        id: 'ref-004',
        name: 'Refrigerateur',
        category: 'Electromenager',
        brand: 'Whirlpool',
        model: 'W7X82OOX',
        version: 'v2023',
        price: 1150,
        carbonEmission: 198,
        energyClass: 'A+++',
        yearManufactured: 2023,
        specifications: { capacity: '527L', power: '295W', efficiency: '94%' }
    },

    // Machines a laver
    {
        id: 'wash-001',
        name: 'Machine a laver',
        category: 'Electromenager',
        brand: 'Miele',
        model: 'WEG665',
        version: 'v2023',
        price: 1599,
        carbonEmission: 156,
        energyClass: 'A+++',
        yearManufactured: 2023,
        specifications: { capacity: '9kg', power: '1400W', efficiency: '96%' }
    },
    {
        id: 'wash-002',
        name: 'Machine a laver',
        category: 'Electromenager',
        brand: 'Siemens',
        model: 'WM14T790FF',
        version: 'v2022',
        price: 899,
        carbonEmission: 223,
        energyClass: 'A++',
        yearManufactured: 2022,
        specifications: { capacity: '9kg', power: '1600W', efficiency: '91%' }
    },
    {
        id: 'wash-003',
        name: 'Machine a laver',
        category: 'Electromenager',
        brand: 'Samsung',
        model: 'WW90T4540AE',
        version: 'v2021',
        price: 599,
        carbonEmission: 287,
        energyClass: 'A+',
        yearManufactured: 2021,
        specifications: { capacity: '9kg', power: '1800W', efficiency: '87%' }
    },
    {
        id: 'wash-004',
        name: 'Machine a laver',
        category: 'Electromenager',
        brand: 'Bosch',
        model: 'WAX32EH0FF',
        version: 'v2023',
        price: 1099,
        carbonEmission: 167,
        energyClass: 'A+++',
        yearManufactured: 2023,
        specifications: { capacity: '10kg', power: '1350W', efficiency: '95%' }
    },

    // Climatiseurs
    {
        id: 'ac-001',
        name: 'Climatiseur',
        category: 'Climatisation',
        brand: 'Daikin',
        model: 'FTXM35R',
        version: 'v2023',
        price: 1450,
        carbonEmission: 412,
        energyClass: 'A+++',
        yearManufactured: 2023,
        specifications: { power: '3500W', capacity: '35m2', efficiency: '94%' }
    },
    {
        id: 'ac-002',
        name: 'Climatiseur',
        category: 'Climatisation',
        brand: 'Mitsubishi',
        model: 'MSZ-LN35VG',
        version: 'v2022',
        price: 1450,
        carbonEmission: 378,
        energyClass: 'A+++',
        yearManufactured: 2022,
        specifications: { power: '3200W', capacity: '35m2', efficiency: '96%' }
    },
    {
        id: 'ac-003',
        name: 'Climatiseur',
        category: 'Climatisation',
        brand: 'LG',
        model: 'S12EQ',
        version: 'v2021',
        price: 899,
        carbonEmission: 567,
        energyClass: 'A+',
        yearManufactured: 2021,
        specifications: { power: '4200W', capacity: '30m2', efficiency: '86%' }
    },
    {
        id: 'ac-004',
        name: 'Climatiseur',
        category: 'Climatisation',
        brand: 'Panasonic',
        model: 'CS-Z35XKEW',
        version: 'v2023',
        price: 1650,
        carbonEmission: 345,
        energyClass: 'A++++',
        yearManufactured: 2023,
        specifications: { power: '2900W', capacity: '35m2', efficiency: '97%' }
    },

    // Ordinateurs portables
    {
        id: 'laptop-001',
        name: 'Ordinateur portable',
        category: 'Informatique',
        brand: 'Dell',
        model: 'XPS 15 9530',
        version: 'v2023',
        price: 2199,
        carbonEmission: 289,
        energyClass: 'Energy Star',
        yearManufactured: 2023,
        specifications: { power: '130W', capacity: '15.6 pouces', efficiency: '89%' }
    },
    {
        id: 'laptop-002',
        name: 'Ordinateur portable',
        category: 'Informatique',
        brand: 'HP',
        model: 'EliteBook 850 G9',
        version: 'v2022',
        price: 1899,
        carbonEmission: 312,
        energyClass: 'Energy Star',
        yearManufactured: 2022,
        specifications: { power: '135W', capacity: '15.6 pouces', efficiency: '87%' }
    },
    {
        id: 'laptop-003',
        name: 'Ordinateur portable',
        category: 'Informatique',
        brand: 'Lenovo',
        model: 'ThinkPad X1 Carbon Gen 11',
        version: 'v2023',
        price: 2199,
        carbonEmission: 245,
        energyClass: 'Energy Star',
        yearManufactured: 2023,
        specifications: { power: '65W', capacity: '14 pouces', efficiency: '92%' }
    },
    {
        id: 'laptop-004',
        name: 'Ordinateur portable',
        category: 'Informatique',
        brand: 'Apple',
        model: 'MacBook Pro 16',
        version: 'M3 2023',
        price: 2899,
        carbonEmission: 198,
        energyClass: 'Energy Star',
        yearManufactured: 2023,
        specifications: { power: '96W', capacity: '16 pouces', efficiency: '95%' }
    },

    // Imprimantes
    {
        id: 'print-001',
        name: 'Imprimante',
        category: 'Bureautique',
        brand: 'HP',
        model: 'LaserJet Pro M404dn',
        version: 'v2022',
        price: 349,
        carbonEmission: 178,
        energyClass: 'Energy Star',
        yearManufactured: 2022,
        specifications: { power: '550W', capacity: '40ppm', efficiency: '85%' }
    },
    {
        id: 'print-002',
        name: 'Imprimante',
        category: 'Bureautique',
        brand: 'Canon',
        model: 'imageCLASS MF445dw',
        version: 'v2023',
        price: 449,
        carbonEmission: 156,
        energyClass: 'Energy Star',
        yearManufactured: 2023,
        specifications: { power: '480W', capacity: '40ppm', efficiency: '88%' }
    },
    {
        id: 'print-003',
        name: 'Imprimante',
        category: 'Bureautique',
        brand: 'Epson',
        model: 'EcoTank ET-4850',
        version: 'v2023',
        price: 349,
        carbonEmission: 123,
        energyClass: 'Energy Star',
        yearManufactured: 2023,
        specifications: { power: '320W', capacity: '25ppm', efficiency: '91%' }
    },

    // Vehicules electriques
    {
        id: 'ev-001',
        name: 'Vehicule electrique',
        category: 'Transport',
        brand: 'Tesla',
        model: 'Model 3',
        version: 'Long Range 2023',
        price: 52990,
        carbonEmission: 8900,
        energyClass: 'A',
        yearManufactured: 2023,
        specifications: { power: '346ch', capacity: '82kWh', efficiency: '14.4kWh/100km' }
    },
    {
        id: 'ev-002',
        name: 'Vehicule electrique',
        category: 'Transport',
        brand: 'Renault',
        model: 'Megane E-Tech',
        version: 'EV60 2023',
        price: 46000,
        carbonEmission: 7200,
        energyClass: 'A',
        yearManufactured: 2023,
        specifications: { power: '220ch', capacity: '60kWh', efficiency: '15.8kWh/100km' }
    },
    {
        id: 'ev-003',
        name: 'Vehicule electrique',
        category: 'Transport',
        brand: 'Volkswagen',
        model: 'ID.4',
        version: 'Pro 2022',
        price: 52990,
        carbonEmission: 9100,
        energyClass: 'A',
        yearManufactured: 2022,
        specifications: { power: '204ch', capacity: '77kWh', efficiency: '17.2kWh/100km' }
    },
    {
        id: 'ev-004',
        name: 'Vehicule electrique',
        category: 'Transport',
        brand: 'Hyundai',
        model: 'Ioniq 5',
        version: '2023',
        price: 48900,
        carbonEmission: 7800,
        energyClass: 'A',
        yearManufactured: 2023,
        specifications: { power: '229ch', capacity: '72.6kWh', efficiency: '16.8kWh/100km' }
    },

    // Chaudieres
    {
        id: 'boiler-001',
        name: 'Chaudiere',
        category: 'Chauffage',
        brand: 'Viessmann',
        model: 'Vitodens 200-W',
        version: 'v2023',
        price: 4500,
        carbonEmission: 1890,
        energyClass: 'A+++',
        yearManufactured: 2023,
        specifications: { power: '35kW', capacity: 'Condensation', efficiency: '98%' }
    },
    {
        id: 'boiler-002',
        name: 'Chaudiere',
        category: 'Chauffage',
        brand: 'De Dietrich',
        model: 'MCX 24/28 MI Plus',
        version: 'v2022',
        price: 3200,
        carbonEmission: 2340,
        energyClass: 'A++',
        yearManufactured: 2022,
        specifications: { power: '28kW', capacity: 'Condensation', efficiency: '94%' }
    },
    {
        id: 'boiler-003',
        name: 'Chaudiere',
        category: 'Chauffage',
        brand: 'Saunier Duval',
        model: 'ThemaPlus Condens',
        version: 'v2021',
        price: 2800,
        carbonEmission: 2670,
        energyClass: 'A+',
        yearManufactured: 2021,
        specifications: { power: '25kW', capacity: 'Condensation', efficiency: '91%' }
    },
    {
        id: 'boiler-004',
        name: 'Chaudiere',
        category: 'Chauffage',
        brand: 'Frisquet',
        model: 'Prestige Condensation',
        version: 'v2023',
        price: 4500,
        carbonEmission: 1750,
        energyClass: 'A+++',
        yearManufactured: 2023,
        specifications: { power: '32kW', capacity: 'Condensation', efficiency: '99%' }
    },

    // Machines industrielles
    {
        id: 'ind-001',
        name: 'Compresseur industriel',
        category: 'Machines industrielles',
        brand: 'Atlas Copco',
        model: 'GA 90 VSD',
        version: 'v2023',
        price: 45000,
        carbonEmission: 15600,
        energyClass: 'IE4',
        yearManufactured: 2023,
        specifications: { power: '90kW', capacity: '15.8m3/min', efficiency: '94%' }
    },
    {
        id: 'ind-002',
        name: 'Compresseur industriel',
        category: 'Machines industrielles',
        brand: 'Kaeser',
        model: 'DSD 238',
        version: 'v2022',
        price: 42000,
        carbonEmission: 17800,
        energyClass: 'IE3',
        yearManufactured: 2022,
        specifications: { power: '110kW', capacity: '18.2m3/min', efficiency: '89%' }
    },
    {
        id: 'ind-003',
        name: 'Tour CNC',
        category: 'Machines industrielles',
        brand: 'DMG MORI',
        model: 'NLX 2500',
        version: 'v2023',
        price: 125000,
        carbonEmission: 23400,
        energyClass: 'Standard',
        yearManufactured: 2023,
        specifications: { power: '35kW', capacity: 'Diametre 320mm', efficiency: '88%' }
    },
    {
        id: 'ind-004',
        name: 'Tour CNC',
        category: 'Machines industrielles',
        brand: 'Haas',
        model: 'ST-30',
        version: 'v2022',
        price: 89000,
        carbonEmission: 28900,
        energyClass: 'Standard',
        yearManufactured: 2022,
        specifications: { power: '45kW', capacity: 'Diametre 356mm', efficiency: '82%' }
    },
    {
        id: 'ind-005',
        name: 'Presse hydraulique',
        category: 'Machines industrielles',
        brand: 'Schuler',
        model: 'SMG 630',
        version: 'v2023',
        price: 280000,
        carbonEmission: 45600,
        energyClass: 'Standard',
        yearManufactured: 2023,
        specifications: { power: '250kW', capacity: '630 tonnes', efficiency: '91%' }
    },
    {
        id: 'ind-006',
        name: 'Presse hydraulique',
        category: 'Machines industrielles',
        brand: 'Amada',
        model: 'HFE 5020',
        version: 'v2021',
        price: 280000,
        carbonEmission: 52300,
        energyClass: 'Standard',
        yearManufactured: 2021,
        specifications: { power: '280kW', capacity: '500 tonnes', efficiency: '85%' }
    },
    {
        id: 'ind-007',
        name: 'Robot industriel',
        category: 'Machines industrielles',
        brand: 'ABB',
        model: 'IRB 6700',
        version: 'v2023',
        price: 95000,
        carbonEmission: 12800,
        energyClass: 'Energy Efficient',
        yearManufactured: 2023,
        specifications: { power: '8.5kW', capacity: 'Charge 150kg', efficiency: '93%' }
    },
    {
        id: 'ind-008',
        name: 'Robot industriel',
        category: 'Machines industrielles',
        brand: 'KUKA',
        model: 'KR 210 R3100',
        version: 'v2022',
        price: 88000,
        carbonEmission: 14500,
        energyClass: 'Standard',
        yearManufactured: 2022,
        specifications: { power: '10kW', capacity: 'Charge 210kg', efficiency: '88%' }
    },
    {
        id: 'ind-009',
        name: 'Fraiseuse CNC',
        category: 'Machines industrielles',
        brand: 'Mazak',
        model: 'VCN-530C',
        version: 'v2023',
        price: 145000,
        carbonEmission: 19800,
        energyClass: 'Standard',
        yearManufactured: 2023,
        specifications: { power: '30kW', capacity: 'Table 1050x530mm', efficiency: '90%' }
    },
    {
        id: 'ind-010',
        name: 'Fraiseuse CNC',
        category: 'Machines industrielles',
        brand: 'Fanuc',
        model: 'Robodrill D21MiA5',
        version: 'v2022',
        price: 125000,
        carbonEmission: 22400,
        energyClass: 'Standard',
        yearManufactured: 2022,
        specifications: { power: '35kW', capacity: 'Table 700x400mm', efficiency: '86%' }
    },
    {
        id: 'ind-011',
        name: 'Convoyeur industriel',
        category: 'Machines industrielles',
        brand: 'Siemens',
        model: 'SICONVEY TC800',
        version: 'v2023',
        price: 32000,
        carbonEmission: 8900,
        energyClass: 'IE4',
        yearManufactured: 2023,
        specifications: { power: '15kW', capacity: '800kg/h', efficiency: '95%' }
    },
    {
        id: 'ind-012',
        name: 'Convoyeur industriel',
        category: 'Machines industrielles',
        brand: 'Interroll',
        model: 'RollerDrive EC5000',
        version: 'v2021',
        price: 28000,
        carbonEmission: 11200,
        energyClass: 'IE3',
        yearManufactured: 2021,
        specifications: { power: '18kW', capacity: '750kg/h', efficiency: '88%' }
    },
    {
        id: 'ind-013',
        name: 'Soudeuse laser',
        category: 'Machines industrielles',
        brand: 'Trumpf',
        model: 'TruLaser Weld 5000',
        version: 'v2023',
        price: 185000,
        carbonEmission: 16700,
        energyClass: 'High Efficiency',
        yearManufactured: 2023,
        specifications: { power: '25kW', capacity: 'Laser 5kW', efficiency: '92%' }
    },
    {
        id: 'ind-014',
        name: 'Soudeuse laser',
        category: 'Machines industrielles',
        brand: 'IPG Photonics',
        model: 'LightWELD 2000',
        version: 'v2022',
        price: 165000,
        carbonEmission: 19300,
        energyClass: 'Standard',
        yearManufactured: 2022,
        specifications: { power: '28kW', capacity: 'Laser 4kW', efficiency: '87%' }
    },
    {
        id: 'ind-015',
        name: 'Chaudiere industrielle',
        category: 'Machines industrielles',
        brand: 'Bosch Thermotechnology',
        model: 'UT-L',
        version: 'v2023',
        price: 78000,
        carbonEmission: 34500,
        energyClass: 'A',
        yearManufactured: 2023,
        specifications: { power: '1000kW', capacity: 'Vapeur 1.5t/h', efficiency: '96%' }
    },
    {
        id: 'ind-016',
        name: 'Chaudiere industrielle',
        category: 'Machines industrielles',
        brand: 'Viessmann',
        model: 'Vitoplex 200',
        version: 'v2021',
        price: 78000,
        carbonEmission: 39800,
        energyClass: 'B',
        yearManufactured: 2021,
        specifications: { power: '1100kW', capacity: 'Vapeur 1.6t/h', efficiency: '92%' }
    }
];

export default function LibraryPage() {
    const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
    const [sortBy, setSortBy] = useState<'carbon-low' | 'carbon-high' | 'price' | 'name'>('carbon-low');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = ['Tous', ...Array.from(new Set(PRODUCTS.map(p => p.category)))];

    const filteredProducts = PRODUCTS
        .filter(p => selectedCategory === 'Tous' || p.category === selectedCategory)
        .filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.model.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'carbon-low') return a.carbonEmission - b.carbonEmission;
            if (sortBy === 'carbon-high') return b.carbonEmission - a.carbonEmission;
            if (sortBy === 'price') return a.price - b.price;
            return a.name.localeCompare(b.name);
        });

    const getCarbonBadgeColor = (emission: number) => {
        if (emission < 200) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        if (emission < 500) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        if (emission < 2000) return 'bg-orange-100 text-orange-800 border-orange-300';
        if (emission < 10000) return 'bg-red-100 text-red-800 border-red-300';
        return 'bg-purple-100 text-purple-800 border-purple-300';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <SimpleNav />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Bibliotheque de Produits
                        </h1>
                        <p className="text-gray-600">
                            Comparez les emissions carbone de differents produits et machines pour faire des choix eclaires
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rechercher
                                </label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Nom, marque, modele..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Categorie
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trier par
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="carbon-low">Emissions: Faible a Eleve</option>
                                    <option value="carbon-high">Emissions: Eleve a Faible</option>
                                    <option value="price">Prix</option>
                                    <option value="name">Nom</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col">
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="mb-3">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 leading-tight">{product.name}</h3>
                                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded whitespace-nowrap ml-2">
                                                {product.energyClass}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            <span className="font-medium">{product.brand}</span> {product.model}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {product.version} - {product.yearManufactured}
                                        </p>
                                    </div>

                                    <div className={`p-3 rounded-lg border-2 mb-3 ${getCarbonBadgeColor(product.carbonEmission)}`}>
                                        <p className="text-xs font-medium mb-1">Emissions carbone</p>
                                        <p className="text-xl font-bold">
                                            {product.carbonEmission.toLocaleString('fr-FR')} kg CO2e
                                        </p>
                                        <p className="text-xs mt-1">
                                            Sur cycle de vie
                                        </p>
                                    </div>

                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-3 flex-1">
                                        <p className="text-xs font-medium text-gray-700 mb-2">Specifications</p>
                                        <div className="space-y-1 text-xs text-gray-600">
                                            {product.specifications.power && (
                                                <p>Puissance: {product.specifications.power}</p>
                                            )}
                                            {product.specifications.capacity && (
                                                <p>Capacite: {product.specifications.capacity}</p>
                                            )}
                                            {product.specifications.efficiency && (
                                                <p>Efficacite: {product.specifications.efficiency}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        <p className="text-2xl font-bold text-gray-900 mb-3">
                                            {product.price.toLocaleString('fr-FR')} EUR
                                        </p>
                                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                                            Voir les details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <p className="text-gray-500">Aucun produit trouve</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
