// src/data/mockData.js

// Usuario actual
export const mockUser = {
  id: "1",
  name: "Juan Pérez",
  email: "juan@ejemplo.com",
  role: "Owner", // (platform role mock por ahora)
  businesses: [
    {
      id: "b1",
      name: "Café Central",
      plan: "Pro",
      cardsIssued: 12,
      cardsLimit: 30,
      branches: [
        { id: "br-b1-1", name: "Matriz" },
        { id: "br-b1-2", name: "Sucursal Miraflores" },
        { id: "br-b1-3", name: "Sucursal San Isidro" },
      ],
    },
    {
      id: "b2",
      name: "Panadería La Esquina",
      plan: "Pequeño Negocio",
      cardsIssued: 45,
      cardsLimit: 100,
      branches: [{ id: "br-b2-1", name: "Matriz" }], // solo 1 sucursal
    },
  ],
  currentBusinessId: "b1",
};

// Clientes / membresías
export const mockMemberships = [
  {
    id: "m1",
    phone: "+54 9 11 1234-5678",
    name: "María González",
    points: 250,
    qrToken: "QR-M1-ABC123",
    createdAt: new Date("2024-01-15"),
    status: "active",
  },
  {
    id: "m2",
    phone: "+54 9 11 8765-4321",
    name: "Carlos Rodríguez",
    points: 150,
    qrToken: "QR-M2-DEF456",
    createdAt: new Date("2024-01-20"),
    status: "active",
  },
  {
    id: "m3",
    phone: "+54 9 11 2468-1357",
    name: "Ana Martínez",
    points: 75,
    qrToken: "QR-M3-GHI789",
    createdAt: new Date("2024-02-01"),
    status: "active",
  },
  {
    id: "m4",
    phone: "+54 9 11 9876-5432",
    name: "Luis Fernández",
    points: 320,
    qrToken: "QR-M4-JKL012",
    createdAt: new Date("2024-02-10"),
    status: "active",
  },
];

// Movimientos de puntos
export const mockTransactions = [
  {
    id: "t1",
    membershipId: "m1",
    type: "earn",
    points: 50,
    description: "Compra - $5000",
    date: new Date("2024-03-15"),
    operatorName: "Juan Pérez",
  },
  {
    id: "t2",
    membershipId: "m1",
    type: "redeem",
    points: -100,
    description: "Canje: Café gratis",
    date: new Date("2024-03-10"),
    operatorName: "Juan Pérez",
  },
  {
    id: "t3",
    membershipId: "m2",
    type: "earn",
    points: 30,
    description: "Compra - $3000",
    date: new Date("2024-03-14"),
    operatorName: "Juan Pérez",
  },
  {
    id: "t4",
    membershipId: "m3",
    type: "earn",
    points: 25,
    description: "Compra - $2500",
    date: new Date("2024-03-12"),
    operatorName: "Juan Pérez",
  },
];

// Recompensas
export const mockRewards = [
  {
    id: "r1",
    name: "Café Gratis",
    description: "Un café de tu elección",
    pointsRequired: 100,
    status: "active",
  },
  {
    id: "r2",
    name: "Descuento 20%",
    description: "20% de descuento en tu próxima compra",
    pointsRequired: 150,
    status: "active",
  },
  {
    id: "r3",
    name: "Combo Desayuno",
    description: "Café + medialunas",
    pointsRequired: 200,
    status: "active",
  },
  {
    id: "r4",
    name: "Torta Premium",
    description: "Porción de torta premium",
    pointsRequired: 300,
    status: "inactive",
  },
];

// Canjes
export const mockRedemptions = [
  {
    id: "rd1",
    membershipId: "m1",
    rewardId: "r1",
    code: "CANJE-001",
    status: "confirmed",
    date: new Date("2024-03-10"),
    validatedBy: "Juan Pérez",
    validatedAt: new Date("2024-03-10"),
  },
  {
    id: "rd2",
    membershipId: "m2",
    rewardId: "r2",
    code: "CANJE-002",
    status: "pending",
    date: new Date("2024-03-15"),
  },
  {
    id: "rd3",
    membershipId: "m4",
    rewardId: "r3",
    code: "CANJE-003",
    status: "confirmed",
    date: new Date("2024-03-14"),
    validatedBy: "Juan Pérez",
    validatedAt: new Date("2024-03-14"),
  },
];
